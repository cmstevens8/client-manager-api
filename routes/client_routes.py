from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Client

client_bp = Blueprint("clients", __name__, url_prefix="/clients")

def serialize_client(client):
    return {
        "id": client.id,
        "name": client.name,
        "email": client.email,
        "phone": client.phone
    }

@client_bp.route("/", methods=["GET"])
@jwt_required()
def get_clients():
    user_id = get_jwt_identity()
    clients = Client.query.filter_by(user_id=user_id).all()
    return jsonify([serialize_client(c) for c in clients]), 200

@client_bp.route("/<int:client_id>/", methods=["GET"])
@jwt_required()
def get_client(client_id):
    user_id = get_jwt_identity()
    client = Client.query.filter_by(id=client_id, user_id=user_id).first()
    if not client:
        return jsonify({"error": "Client not found"}), 404
    return jsonify(serialize_client(client)), 200

@client_bp.route("/", methods=["POST"])
@jwt_required()
def create_client():
    user_id = get_jwt_identity()
    data = request.get_json()
    new_client = Client(
        name=data.get("name"),
        email=data.get("email"),
        phone=data.get("phone"),
        user_id=user_id
    )
    db.session.add(new_client)
    db.session.commit()
    return jsonify(serialize_client(new_client)), 201

@client_bp.route("/<int:client_id>/", methods=["PUT"])
@jwt_required()
def update_client(client_id):
    user_id = get_jwt_identity()
    client = Client.query.filter_by(id=client_id, user_id=user_id).first()
    if not client:
        return jsonify({"error": "Client not found"}), 404

    data = request.get_json()
    client.name = data.get("name", client.name)
    client.email = data.get("email", client.email)
    client.phone = data.get("phone", client.phone)

    db.session.commit()
    return jsonify(serialize_client(client)), 200

@client_bp.route("/<int:client_id>/", methods=["DELETE"])
@jwt_required()
def delete_client(client_id):
    user_id = get_jwt_identity()
    client = Client.query.filter_by(id=client_id, user_id=user_id).first()
    if not client:
        return jsonify({"error": "Client not found"}), 404

    db.session.delete(client)
    db.session.commit()
    return jsonify({"message": "Client deleted"}), 200
