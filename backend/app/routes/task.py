from app.supabase import supabase
from flask import Blueprint, request
from app.auth.decorators import require_auth

task_bp = Blueprint("task", __name__)


@task_bp.route("/api/tasks", methods=["GET"])
@require_auth
def get_task():

    created_by = request.current_user.id

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
        .execute()
    )

    # print(task_response.data)

    return {"data": task_response.data}, 200


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

    task_response = supabase.table("tasks").insert({
        "assigned_to": data.get("assigned_to"),
        "description": data.get("description"),
        "due_date": data.get("due_date"),
        "title": data.get("title"),
        "created_by": created_by
    }).execute()

    # print(task_response.data)

    return {"data": task_response.data}, 201


ALLOWED_UPDATED_FIELDS = {"title", "description", "due_date", "assigned_to","priority","completed_at"}


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

    return {"data": response.data[0]}, 200
