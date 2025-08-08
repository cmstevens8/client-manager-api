from flask import Blueprint, request, jsonify
from models import db, Invoice, Client
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

invoice_bp = Blueprint("invoices", __name__)

# Helper method to serialize invoice
def serialize_invoice(invoice):
    return {
        "id": invoice.id,
        "client_id": invoice.client_id,
        "amount": invoice.amount,
        "description": invoice.description,
        "due_date": invoice.due_date.isoformat() if invoice.due_date else None,
        "status": invoice.status
    }

# 1. Get all invoices (optionally filtered by client_id)
@invoice_bp.route("/", methods=["GET"])
@jwt_required()
def get_invoices():
    user_id = get_jwt_identity()
    client_id = request.args.get("client_id", type=int)

    query = Invoice.query.join(Invoice.client).filter(Client.user_id == user_id)
    if client_id:
        query = query.filter(Invoice.client_id == client_id)
    invoices = query.all()

    return jsonify([serialize_invoice(i) for i in invoices]), 200

# 2. Get a specific invoice by ID
@invoice_bp.route("/<int:invoice_id>/", methods=["GET"])
@jwt_required()
def get_invoice(invoice_id):
    user_id = get_jwt_identity()
    invoice = Invoice.query.join(Invoice.client).filter(
        Invoice.id == invoice_id,
        Client.user_id == user_id
    ).first()
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    return jsonify(serialize_invoice(invoice)), 200

# 3. Update an invoice
@invoice_bp.route("/<int:invoice_id>/", methods=["PUT"])
@jwt_required()
def update_invoice(invoice_id):
    user_id = get_jwt_identity()
    invoice = Invoice.query.join(Invoice.client).filter(
        Invoice.id == invoice_id,
        Client.user_id == user_id
    ).first()
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    data = request.get_json()
    
    if "amount" in data:
        invoice.amount = data["amount"]
    if "description" in data:
        invoice.description = data["description"]
    if "due_date" in data:
        due_date_str = data["due_date"]
        if due_date_str:
            try:
                invoice.due_date = datetime.strptime(due_date_str, "%Y-%m-%d").date()
            except ValueError:
                return jsonify({"error": "due_date must be in YYYY-MM-DD format"}), 400
        else:
            invoice.due_date = None
    if "status" in data:
        invoice.status = data["status"]

    db.session.commit()
    return jsonify(serialize_invoice(invoice)), 200

# 4. Delete an invoice
@invoice_bp.route("/<int:invoice_id>/", methods=["DELETE"])
@jwt_required()
def delete_invoice(invoice_id):
    user_id = get_jwt_identity()
    invoice = Invoice.query.join(Invoice.client).filter(
        Invoice.id == invoice_id,
        Client.user_id == user_id
    ).first()
    if not invoice:
        return jsonify({"error": "Invoice not found"}), 404

    db.session.delete(invoice)
    db.session.commit()
    return jsonify({"message": f"Invoice {invoice_id} deleted"}), 200

# 5. Create a new invoice
@invoice_bp.route("/", methods=["POST"])
@jwt_required()
def create_invoice():
    user_id = get_jwt_identity()
    data = request.get_json()

    client = Client.query.filter_by(id=data.get("client_id"), user_id=user_id).first()
    if not client:
        return jsonify({"error": "Client not found"}), 404

    due_date_str = data.get("due_date")
    due_date = None
    if due_date_str:
        try:
            due_date = datetime.strptime(due_date_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "due_date must be in YYYY-MM-DD format"}), 400

    new_invoice = Invoice(
        client_id=client.id,
        amount=data.get("amount"),
        description=data.get("description"),
        due_date=due_date,
        status=data.get("status", "unpaid")
    )

    db.session.add(new_invoice)
    db.session.commit()
    return jsonify(serialize_invoice(new_invoice)), 201
