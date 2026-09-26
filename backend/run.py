from flask import Flask
from app.routes.task import task_bp
from app.routes.users import users_bp
from flask_cors import CORS


app = Flask(__name__)
CORS(
    app,
    supports_credentials=True,
   origins=["http://localhost:3000", "http://127.0.0.1:3000"],
)

app.register_blueprint(task_bp)
app.register_blueprint(users_bp)

if __name__ == '__main__':
    app.run(debug=True)
