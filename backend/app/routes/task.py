from app.supabase import supabase
from uuid import UUID
from flask import Blueprint, request, jsonify, current_app
from app.auth.decorators import require_auth
from app.services.email_service import send_task_email
from app.schemas.task import TaskCreate, TaskUpdate
from pydantic import ValidationError
from datetime import datetime, timezone

task_bp = Blueprint("task", __name__)


@task_bp.route("/api/tasks", methods=["GET"])
@require_auth
def get_task():
    created_by = request.current_user.id

    # Pagination parameters
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=5, type=int)

    # Reject values that would produce a negative or empty range
    if page < 1 or limit < 1:
        return jsonify({"error": "page and limit must be positive integers"}), 400

    # Cap limit so a client can't request the whole table
    limit = min(limit, 100)

    # Calculate range
    start = (page - 1) * limit
    end = start + limit - 1

    try:
        task_response = (
            supabase
            .table("tasks")
            .select("""
                id,
                title,
                description,
                status,
                priority,
                due_date,
                assigned_to,
                assigned_user:profiles!tasks_assigned_to_fkey (
                    id,
                    full_name,
                    email,
                    avatar_url
                )
            """)
            .eq("created_by", created_by)
            .order("created_at", desc=True)
            .range(start, end)
            .execute()
        )
    except Exception:
        current_app.logger.exception("Failed to fetch tasks")
        return jsonify({"error": "Failed to fetch tasks"}), 500

    tasks = task_response.data or []

    return jsonify({
        "data": tasks,
        "page": page,
        "limit": limit,
        "hasNextPage": len(tasks) == limit,
        "nextPage": page + 1 if len(tasks) == limit else None
    }), 200


@task_bp.route("/api/task/<id>", methods=["GET"])
@require_auth
def get_a_task(id):

    try:
        task_id = str(UUID(id))
    except ValueError:
        return jsonify({"error": "Invalid task id"}), 400

    try:
        task_response = (
            supabase.table("tasks")
            .select("*")
            .eq("id", task_id)
            .execute()
        )
    except Exception:
        current_app.logger.exception("Failed to fetch task")
        return jsonify({"error": "Failed to fetch task"}), 500

    if not task_response.data:
        return jsonify({"error": "Task not found"}), 404

    task = task_response.data[0]
    user_id = request.current_user.id

    # Only the creator or the assignee view the task
    if user_id not in (task.get("created_by"), task.get("assigned_to")):
        return jsonify({"error": "Forbidden"}), 403

    return jsonify({"data": task_response.data}), 200


@task_bp.route("/api/tasks/<id>", methods=["DELETE"])
@require_auth
def delete_task(id):

    try:
        task_id = str(UUID(id))
    except ValueError:
        return jsonify({"error": "Invalid task id"}), 400

    try:
        task = (
            supabase
            .table("tasks")
            .select("id, created_by")
            .eq("id", task_id)
            .limit(1)
            .execute()
        )

        if not task.data:
            return jsonify({"error": "Task not found"}), 404

        if task.data[0]["created_by"] != request.current_user.id:
            return jsonify({"error": "Forbidden"}), 403

        response = (
            supabase
            .table("tasks")
            .delete()
            .eq("id", task_id)
            .eq("created_by", request.current_user.id)
            .execute()
        )

        if not response.data:
            # Row vanished or changed owner between the check and the delete
            return jsonify({"error": "Task not found"}), 404

    except Exception:
        current_app.logger.exception("Failed to delete task")
        return jsonify({"error": "Failed to delete task"}), 500

    return "", 204


@task_bp.route("/api/tasks", methods=["POST"])
@require_auth
def create_task():
    body = request.get_json(silent=True)

    if body is None:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        task = TaskCreate.model_validate(body)
    except ValidationError as e:
        return jsonify({
            "errors": e.errors(include_url=False, include_context=False)
        }), 400

    created_by = request.current_user.id

    # 1. Verify the assignee exists
    try:
        assignee = (
            supabase
            .table("profiles")
            .select("id, full_name, email")
            .eq("id", str(task.assigned_to))
            .limit(1)
            .execute()
        )
    except Exception:
        current_app.logger.exception("Failed to look up assignee")
        return jsonify({"error": "Failed to verify assignee"}), 500

    if not assignee.data:
        return jsonify({"error": "Task assigned to invalid user"}), 404

    assignee_data = assignee.data[0]

    # 2. Create the task using the validated data
    try:

        payload = task.model_dump(mode="json")  # UUID/datetime -> str
        payload["created_by"] = created_by

        created_task = supabase.table("tasks").insert(payload).execute()

        if not created_task.data:
            return jsonify({"error": "Failed to create task"}), 500

        new_task_id = created_task.data[0]["id"]

        # 3. Fetch the task with the joined assignee profile
        task_response = (
            supabase
            .table("tasks")
            .select("""
                id,
                title,
                description,
                status,
                priority,
                due_date,
                assigned_to,
                assigned_user:profiles!tasks_assigned_to_fkey (
                    id,
                    full_name,
                    email,
                    avatar_url
                )
            """)
            .eq("id", new_task_id)
            .single()
            .execute()
        )
    except Exception:
        current_app.logger.exception("Failed to create task")
        return jsonify({"error": "Failed to create task"}), 500

    try:
        send_task_email(
            recipient=[assignee_data["email"]],
            task_title="Task Assigned",
            body=f"You have been assigned the task: {task.title}",
        )
    except Exception:
        current_app.logger.exception("Failed to send task assignment email")

    return {"data": task_response.data}, 201


ALLOWED_UPDATED_FIELDS = {
    "title",
    "description",
    "due_date",
    "assigned_to",
    "priority",
    "completed_at",
    "status"
}

VALID_STATUSES = {"pending", "in_progress", "completed"}

@task_bp.route("/api/tasks/<id>", methods=["PATCH"])
@require_auth
def updateTask(id):
    try:
        task_id = str(UUID(id))
    except ValueError:
        return jsonify({"error": "Invalid task id"}), 400

    body = request.get_json(silent=True)
    if not isinstance(body, dict) or not body:
        return jsonify({"error": "Request body must be a non-empty JSON object"}), 400

    try:
        parsed = TaskUpdate.model_validate(body)
    except ValidationError as e:
        return jsonify({
            "errors": e.errors(include_url=False, include_context=False)
        }), 400

    # Only fields the client sent; unknown fields (id, created_by...) are ignored
    updates = parsed.model_dump(mode="json", exclude_unset=True)
    if not updates:
        return jsonify({"error": "No valid fields to update"}), 400

    user_id = request.current_user.id

    try:
        # 1. Fetch the task
        existing = (
            supabase.table("tasks")
            .select("id, created_by, assigned_to, status")
            .eq("id", task_id)
            .limit(1)
            .execute()
        )
        if not existing.data:
            return jsonify({"error": "Task not found"}), 404

        task = existing.data[0]
        is_creator = user_id == task["created_by"]
        is_assignee = user_id == task["assigned_to"]

        # 2. Must be creator or assignee
        if not (is_creator or is_assignee):
            return jsonify({"error": "Forbidden"}), 403

        # 3. Only the creator can reassign (and the new assignee must exist)
        if "assigned_to" in updates:
            if not is_creator:
                return jsonify({"error": "Only the creator can reassign this task"}), 403

            new_assignee = (
                supabase.table("profiles")
                .select("id")
                .eq("id", updates["assigned_to"])
                .limit(1)
                .execute()
            )
            if not new_assignee.data:
                return jsonify({"error": "Task assigned to invalid user"}), 404

        # 4. Only the assignee can change status
        just_completed = False
        if "status" in updates:
            if not is_assignee:
                return jsonify({"error": "Only the assignee can change the task status"}), 403

            was_completed = task["status"] == "completed"
            if updates["status"] == "completed" and not was_completed:
                updates["completed_at"] = datetime.now(
                    timezone.utc).isoformat()
                just_completed = True
            elif updates["status"] != "completed" and was_completed:
                updates["completed_at"] = None  # task was reopened

        # 5. Single update
        response = (
            supabase.table("tasks")
            .update(updates)
            .eq("id", task_id)
            .execute()
        )
        if not response.data:
            return jsonify({"error": "Update failed"}), 500

        # 6. Return the updated task
        task_response = (
            supabase.table("tasks")
            .select("""
                id,
                title,
                description,
                status,
                priority,
                due_date,
                assigned_to,
                created_by,
                assigned_user:profiles!tasks_assigned_to_fkey (
                    id,
                    full_name,
                    email,
                    avatar_url
                )
            """)
            .eq("id", task_id)
            .limit(1)
            .execute()
        )
        if not task_response.data:
            return jsonify({"error": "Task not found"}), 404

    except Exception:
        current_app.logger.exception("Failed to update task")
        return jsonify({"error": "Failed to update task"}), 500

    updated_task = task_response.data[0]

    # 7. Notify the creator, only on the transition to completed
    if just_completed and task["created_by"] != user_id:
        try:
            creator = (
                supabase.table("profiles")
                .select("email")
                .eq("id", task["created_by"])
                .limit(1)
                .execute()
            )
            if creator.data:
                assignee = updated_task.get("assigned_user") or {}
                completed_by = assignee.get("full_name") or assignee.get(
                    "email") or "the assignee"

                send_task_email(
                    task_title="Task Completed",
                    body=f"Task '{updated_task.get('title')}' has been completed by {completed_by}",
                    recipient=[creator.data[0]["email"]],
                )
        except Exception:
            current_app.logger.exception(
                "Failed to send task completion email")

    return jsonify({"data": task_response.data}), 200


@task_bp.route("/api/task-stats", methods=["GET"])
@require_auth
def get_task_stats():

    created_by = request.current_user.id

    try:
        total_task = (
            supabase
            .table("tasks")
            .select("id", count="exact")
            .eq("created_by", created_by)
            .execute()
        )
        pending_task = (
            supabase
            .table("tasks")
            .select("id", count="exact")
            .eq("created_by", created_by)
            .eq("status", "pending")
            .execute()
        )

        completed_task = (
            supabase
            .table("tasks")
            .select("id", count="exact")
            .eq("created_by", created_by)
            .eq("status", "completed")
            .execute()
        )

        in_progress_task = (
            supabase
            .table("tasks")
            .select("id", count="exact")
            .eq("created_by", created_by)
            .eq("status", "in_progress")
            .execute()
        )
    except Exception:
        current_app.logger.exception("Failed to fetch task stats")
        return jsonify({"error": "Failed to fetch task stats"}), 500

    return jsonify({
        "total": total_task.count or 0,
        "pending": pending_task.count or 0,
        "completed": completed_task.count or 0,
        "inProgress": in_progress_task.count or 0,
    }), 200


@task_bp.route("/api/assigned-tasks", methods=["GET"])
@require_auth
def get_assigned_tasks():
    user = request.current_user.id

    # Pagination parameters
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=5, type=int)

    # Reject values that would produce a negative or empty range
    if page < 1 or limit < 1:
        return jsonify({"error": "page and limit must be positive integers"}), 400

    # Cap limit so a client can't request the whole table
    limit = min(limit, 100)

    # Calculate range
    start = (page - 1) * limit
    end = start + limit - 1

    try:
        task_response = (
            supabase
            .table("tasks")
            .select("""
                id,
                title,
                description,
                status,
                priority,
                due_date,
                assigned_to,
            created_by:profiles!tasks_created_by_fkey (
            id,
            full_name,
            email,
            avatar_url
        )
            """)
            .eq("assigned_to", user)
            .order("created_at", desc=True)
            .range(start, end)
            .execute()
        )
    except Exception:
        current_app.logger.exception("Failed to fetch assigned tasks")
        return jsonify({"error": "Failed to fetch assigned tasks"}), 500

    tasks = task_response.data or []

    return jsonify({
        "data": tasks,
        "page": page,
        "limit": limit,
        "hasNextPage": len(tasks) == limit,
        "nextPage": page + 1 if len(tasks) == limit else None
    }), 200

@task_bp.route("/api/assigned-task-stats", methods=["GET"])
@require_auth
def get_assigned_task_stats():

    user_id = request.current_user.id

    try:
        total_task = (
            supabase
            .table("tasks")
            .select("id", count="exact")
            .eq("assigned_to", user_id)
            .execute()
        )
        pending_task = (
            supabase
            .table("tasks")
            .select("id", count="exact")
            .eq("assigned_to", user_id)
            .eq("status", "pending")
            .execute()
        )

        completed_task = (
            supabase
            .table("tasks")
            .select("id", count="exact")
            .eq("assigned_to", user_id)
            .eq("status", "completed")
            .execute()
        )

        in_progress_task = (
            supabase
            .table("tasks")
            .select("id", count="exact")
            .eq("assigned_to", user_id)
            .eq("status", "in_progress")
            .execute()
        )
    except Exception:
        current_app.logger.exception("Failed to fetch assigned task stats")
        return jsonify({"error": "Failed to fetch task stats"}), 500

    return {
        "total": total_task.count or 0,
        "pending": pending_task.count or 0,
        "completed": completed_task.count or 0,
        "inProgress": in_progress_task.count or 0,
    }, 200
