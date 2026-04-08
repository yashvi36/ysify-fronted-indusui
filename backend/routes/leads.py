"""
/api/leads — lead management endpoints
"""

from flask import Blueprint, request, jsonify
from extensions import db
from models.models import Lead
from utils.ai_helpers import score_lead, recommend_services

leads_bp = Blueprint("leads", __name__)


@leads_bp.route("/", methods=["POST"])
def create_lead():
    data    = request.get_json(force=True) or {}
    lead    = Lead(name=data.get("name"), email=data.get("email"),
                   phone=data.get("phone"), company=data.get("company"),
                   service=data.get("service"), budget=data.get("budget"),
                   requirements=data.get("requirements"), session_id=data.get("session_id"))
    scoring           = score_lead(data)
    lead.score        = scoring.get("score", "B")
    lead.score_reason = scoring.get("reason", "")
    db.session.add(lead)
    db.session.commit()
    return jsonify({"success": True, "lead": lead.to_dict()}), 201


@leads_bp.route("/", methods=["GET"])
def list_leads():
    score_filter = request.args.get("score")
    query        = Lead.query.order_by(Lead.created_at.desc())
    if score_filter:
        query = query.filter_by(score=score_filter.upper())
    leads = query.all()
    return jsonify({"leads": [l.to_dict() for l in leads], "total": len(leads)})


@leads_bp.route("/<int:lead_id>", methods=["GET"])
def get_lead(lead_id):
    lead = Lead.query.get_or_404(lead_id)
    return jsonify({"lead": lead.to_dict()})


@leads_bp.route("/recommend", methods=["POST"])
def recommend():
    data         = request.get_json(force=True) or {}
    requirements = data.get("requirements", "")
    if not requirements:
        return jsonify({"error": "requirements text is required"}), 400
    services = recommend_services(requirements)
    return jsonify({"recommended_services": services})
