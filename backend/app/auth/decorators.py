from app.supabase import supabase
from flask import request, jsonify
from functools import wraps


def require_auth(f):
    @wraps(f)  # "This decorated_function is wrapping f. Preserve f's metadata."
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Missing authorization token"}), 401

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Invalid authorization header"}), 401

        token = auth_header.split(" ")[1]

        try:
            user_response = supabase.auth.get_user(token)

            if not user_response.user:
                return jsonify({"error": "Invalid token"}), 401
            request.current_user = user_response.user

        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated_function
