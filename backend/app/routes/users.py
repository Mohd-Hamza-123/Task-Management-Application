from app.supabase import supabase
from app.auth.decorators import require_auth
from flask import Blueprint, request, jsonify, current_app

users_bp = Blueprint("users", __name__)

@users_bp.route("/api/users", methods=["GET"])
@require_auth
def get_users():

    user_id = request.current_user.id

    try:
        users = (
            supabase
            .table("profiles")
            .select("id,full_name,email")
            .neq("id", user_id)
            .execute()
        )
    except Exception:
        current_app.logger.exception("Failed to fetch users")
        return jsonify({"error": "Failed to fetch users"}), 500

    return jsonify(users.data or []), 200