from flask import Blueprint

task_bp = Blueprint("task",__name__)

@task_bp.route("/tasks")
def get_task():
    return {
        "data" : "all tasks"
    }

@task_bp.route("/tasks",methods = ["POST"])
def create_task():
    return {
        "data" : "Hello"
    }