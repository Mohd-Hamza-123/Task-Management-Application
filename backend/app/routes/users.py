from app.supabase import supabase
from app.auth.decorators import require_auth
from flask import Blueprint, request, jsonify

users_bp = Blueprint("users", __name__)


@users_bp.route("/api/users", methods=["GET"])
@require_auth
def get_users():

    user_id = request.current_user.id
    users = (supabase
             .table("profiles")
             .select("id,full_name,email")
             .neq("id", user_id)
             .execute()
             )
    # print(users.data)
    return jsonify(users.data), 200

