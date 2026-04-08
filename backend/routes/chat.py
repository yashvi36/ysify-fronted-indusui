"""
/api/chat — AI chatbot endpoints
"""

import re
import json
import uuid
from flask import Blueprint, request, jsonify
from extensions import db                          # ← from extensions
from models.models import Lead, ChatMessage
from utils.ai_helpers import chat_with_ai, score_lead

chat_bp = Blueprint("chat", __name__)

LEAD_PATTERN = re.compile(r"<<<LEAD_DATA>>>(.*?)<<<END_LEAD_DATA>>>", re.DOTALL)


def _extract_lead_json(text):
    match = LEAD_PATTERN.search(text)
    if not match:
        return None
    try:
        return json.loads(match.group(1).strip())
    except (json.JSONDecodeError, ValueError):
        return None


def _clean_reply(text):
    return LEAD_PATTERN.sub("", text).strip()


@chat_bp.route("/message", methods=["POST"])
def send_message():
    data       = request.get_json(force=True) or {}
    session_id = data.get("session_id") or str(uuid.uuid4())
    user_msg   = (data.get("message") or "").strip()

    if not user_msg:
        return jsonify({"error": "message is required"}), 400

    # Save user message
    db.session.add(ChatMessage(session_id=session_id, role="user", content=user_msg))
    db.session.commit()

    # Build history (last 20 messages)
    recent = (ChatMessage.query
              .filter_by(session_id=session_id)
              .order_by(ChatMessage.id.desc())
              .limit(20).all())
    history = [{"role": m.role, "content": m.content} for m in reversed(recent)]

    # Call AI
    raw_reply = chat_with_ai(history)

    # Extract lead data if AI embedded it
    lead_json     = _extract_lead_json(raw_reply)
    clean_reply   = _clean_reply(raw_reply)
    lead_id       = None
    lead_captured = False

    if lead_json:
        lead = Lead.query.filter_by(session_id=session_id).first()
        if not lead:
            lead = Lead(session_id=session_id)
        for field in ("name", "email", "phone", "service", "budget", "requirements", "company"):
            val = lead_json.get(field)
            if val:
                setattr(lead, field, val)
        scoring           = score_lead(lead.__dict__)
        lead.score        = scoring.get("score", "B")
        lead.score_reason = scoring.get("reason", "")
        db.session.add(lead)
        db.session.flush()
        ChatMessage.query.filter_by(session_id=session_id, lead_id=None).update({"lead_id": lead.id})
        lead_id       = lead.id
        lead_captured = True

    # Save assistant reply
    db.session.add(ChatMessage(session_id=session_id, role="assistant",
                               content=clean_reply, lead_id=lead_id))
    db.session.commit()

    return jsonify({"reply": clean_reply, "session_id": session_id,
                    "lead_captured": lead_captured, "lead_id": lead_id})


@chat_bp.route("/history/<session_id>", methods=["GET"])
def get_history(session_id):
    messages = (ChatMessage.query
                .filter_by(session_id=session_id)
                .order_by(ChatMessage.id.asc()).all())
    return jsonify({"messages": [m.to_dict() for m in messages]})
