from app.supabase import supabase
from flask import Blueprint, request
from app.auth.decorators import require_auth
from app.services.email_service import send_task_email

task_bp = Blueprint("task", __name__)


@task_bp.route("/api/tasks", methods=["GET"])
@require_auth
def get_task():
    created_by = request.current_user.id

    # Pagination parameters
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=5, type=int)

    # Calculate range
    start = (page - 1) * limit
    end = start + limit - 1

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

    tasks = task_response.data

    return {
        "data": tasks,
        "page": page,
        "limit": limit,
        "hasNextPage": len(tasks) == limit,
        "nextPage": page + 1 if len(tasks) == limit else None
    }, 200


@task_bp.route("/api/task/<id>", methods=["GET"])
@require_auth
def get_a_task(id):
    print("id------------->", id)
    task_response = (
        supabase.table("tasks")
        .select("*")
        .eq("id", id)
        .execute()
    )
    if not task_response.data:
        return {"error": "Task not found"}, 404

    return {"data": task_response.data}, 200


@task_bp.route("/api/tasks/<id>", methods=["DELETE"])
@require_auth
def delete_task(id):
    response = (
        supabase
        .table("tasks")
        .delete()
        .eq("id", id)
        .execute()
    )

    return {"data": response.data}, 200


@task_bp.route("/api/tasks", methods=["POST"])
@require_auth
def create_task():
    data = request.get_json()
    created_by = request.current_user.id
    sender_mail = request.current_user.email

    assignee = (
        supabase
        .table("profiles")
        .select("id, full_name, email")
        .eq("id", data.get("assigned_to"))
        .single()
        .execute()
    )

    if not assignee.data:
        return {"error": "task assinged to invalid user"}, 404

    assignee_data = assignee.data

    # print("assignee : ", assignee_data)

    created_task = supabase.table("tasks").insert({
        "priority": data.get("priority"),
        "assigned_to": data.get("assigned_to"),
        "description": data.get("description"),
        "due_date": data.get("due_date"),
        "title": data.get("title"),
        "created_by": created_by
    }).execute()

    new_task_id = created_task.data[0].get("id")
    print(new_task_id)

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
        .eq("id", new_task_id)
        .execute()
    )

    # print(task_response2)
    # send_task_email(
    #     recipient=[assignee_data['email']],
    #     task_title="Task Assigned",
    #     body=f"You have been assigned the task: {data.get("title")}"
    # )

    return {"data": task_response.data}, 201


ALLOWED_UPDATED_FIELDS = {"title", "description",
                          "due_date", "assigned_to", "priority", "completed_at"}


@task_bp.route("/api/tasks/<id>", methods=["PATCH"])
@require_auth
def updateTask(id):

    data = request.get_json(silent=True)
    if not data:
        return {"error": "Request body must be valid JSON"}, 400

 # Only allow fields are permitted (blocks id, created_by, etc.)
    updates = {
        k: v
        for k, v in data.items()
        if k in ALLOWED_UPDATED_FIELDS
    }

    if not updates:
        return {"error": "No valid fields to update"}, 400

    user_id = request.current_user.id

    # 1. Fetch the task
    existing = (
        supabase.table("tasks")
        .select("id, created_by, assigned_to")
        .eq("id", id)
        .execute()
    )

    task = existing.data[0]

    if not existing.data:
        return {"error": "Task not found"}, 404

 # 2. Ownership check: creator or assignee only
    if user_id not in [task['created_by'], task['assigned_to']]:
        return {"error": "Forbidden"}, 403

 # 3. Only the creator can reassign the task
    if "assigned_to" in updates and user_id != task["created_by"]:
        return {"error": "Only the creator can reassign this task"}, 403

    response = (
        supabase.table("tasks")
        .update(updates)
        .eq("id", id)
        .execute()
    )

    new_task_id = response.data[0].get("id")
    print(new_task_id)

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
        .eq("created_by", user_id)
        .eq("id", new_task_id)
        .execute()
    )

    return {"data": task_response.data[0]}, 200


@task_bp.route("/api/task-stats", methods=["GET"])
@require_auth
def get_task_stats():

    print("task stats")
    created_by = request.current_user.id

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
    # print(pending_task.count, completed_task.count, in_progress_task.count)

    return {
        "total": total_task.count or 0,
        "pending": pending_task.count or 0,
        "completed": completed_task.count or 0,
        "inProgress": in_progress_task.count or 0,
    }, 200
