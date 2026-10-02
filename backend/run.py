from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

from app.routes.task import task_bp
from app.routes.users import users_bp
from app.extensions import mail

load_dotenv()

app = Flask(__name__)

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
)

app.register_blueprint(task_bp)
app.register_blueprint(users_bp)

app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"] = 465
app.config["MAIL_USE_SSL"] = True
app.config["MAIL_USE_TLS"] = False
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_USERNAME")

# print("MAIL SERVER:", os.getenv("MAIL_SERVER"))
# print("USERNAME:", os.getenv("MAIL_USERNAME"))
# print("PASSWORD SET:", bool(os.getenv("MAIL_PASSWORD")))

mail.init_app(app)


if __name__ == "__main__":
    app.run(debug=True)