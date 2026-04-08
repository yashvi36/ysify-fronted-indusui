"""
/api/proposal — AI proposal generator
"""

from flask import Blueprint, request, jsonify
from models.models import Lead
from utils.ai_helpers import generate_proposal

proposal_bp = Blueprint("proposal", __name__)


@proposal_bp.route("/generate", methods=["POST"])
def generate():
    data    = request.get_json(force=True) or {}
    lead_id = data.get("lead_id")
    if lead_id:
        lead = Lead.query.get(lead_id)
        if not lead:
            return jsonify({"error": "Lead not found"}), 404
        lead_data = lead.to_dict()
    else:
        lead_data = {"name": data.get("name", "Client"),
                     "service": data.get("service", "Web Development"),
                     "budget": data.get("budget", ""),
                     "requirements": data.get("requirements", "")}
    proposal = generate_proposal(lead_data)
    return jsonify({"proposal": proposal, "lead": lead_data})
