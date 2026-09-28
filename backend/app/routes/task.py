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
        .select("*")
        .eq("created_by", created_by)
        .execute()
    )

    # print(task_response.data)

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
