from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from models import db
from routes.client_routes import client_bp
from routes.auth_routes import auth_bp
from routes.invoice_routes import invoice_bp
from token_blacklist import BLACKLIST
from flask_cors import CORS

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///client_manager.db"
app.config["JWT_SECRET_KEY"] = "your_secret_key"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
CORS(app)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)

# Token blacklist check
@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    jti = jwt_payload["jti"]
    return jti in BLACKLIST

# Register blueprints
app.register_blueprint(client_bp, url_prefix="/clients")
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(invoice_bp, url_prefix="/invoices")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)
