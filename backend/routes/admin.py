"""
/api/admin — admin dashboard endpoints
"""

from flask import Blueprint, request, jsonify
from sqlalchemy import func
from extensions import db
from models.models import Lead, ChatMessage

admin_bp = Blueprint("admin", __name__)


@admin_bp.route("/stats", methods=["GET"])
def stats():
    total_leads = Lead.query.count()
    a_leads     = Lead.query.filter_by(score="A").count()
    b_leads     = Lead.query.filter_by(score="B").count()
    c_leads     = Lead.query.filter_by(score="C").count()
    total_chats = ChatMessage.query.filter_by(role="user").count()
    service_rows = (db.session.query(Lead.service, func.count(Lead.id))
                    .filter(Lead.service.isnot(None))
                    .group_by(Lead.service).all())
    return jsonify({
        "total_leads": total_leads, "a_leads": a_leads,
        "b_leads": b_leads,         "c_leads": c_leads,
        "total_chats": total_chats,
        "services_breakdown": {row[0]: row[1] for row in service_rows},
    })


@admin_bp.route("/leads", methods=["GET"])
def leads():
    page     = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))
    score    = request.args.get("score")
    query    = Lead.query.order_by(Lead.created_at.desc())
    if score:
        query = query.filter_by(score=score.upper())
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    results = []
    for lead in paginated.items:
        d = lead.to_dict()
        d["chat_count"] = ChatMessage.query.filter_by(
            session_id=lead.session_id, role="user").count()
        results.append(d)
    return jsonify({"leads": results, "total": paginated.total,
                    "pages": paginated.pages, "page": page})
