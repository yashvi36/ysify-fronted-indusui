"""
Database models for INDUS UI.
db is imported from extensions.py — NOT from app.py
"""

from datetime import datetime
from extensions import db          # ← FIXED: import from extensions, not app


class Lead(db.Model):
    __tablename__ = "leads"

    id           = db.Column(db.Integer, primary_key=True)
    name         = db.Column(db.String(120), nullable=True)
    email        = db.Column(db.String(120), nullable=True)
    phone        = db.Column(db.String(30),  nullable=True)
    company      = db.Column(db.String(120), nullable=True)
    service      = db.Column(db.String(200), nullable=True)
    budget       = db.Column(db.String(80),  nullable=True)
    requirements = db.Column(db.Text,        nullable=True)
    score        = db.Column(db.String(1),   nullable=True)
    score_reason = db.Column(db.Text,        nullable=True)
    session_id   = db.Column(db.String(64),  nullable=True)
    created_at   = db.Column(db.DateTime,    default=datetime.utcnow)
    updated_at   = db.Column(db.DateTime,    default=datetime.utcnow, onupdate=datetime.utcnow)

    messages = db.relationship("ChatMessage", backref="lead", lazy=True,
                               cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id":           self.id,
            "name":         self.name,
            "email":        self.email,
            "phone":        self.phone,
            "company":      self.company,
            "service":      self.service,
            "budget":       self.budget,
            "requirements": self.requirements,
            "score":        self.score,
            "score_reason": self.score_reason,
            "session_id":   self.session_id,
            "created_at":   self.created_at.isoformat() if self.created_at else None,
        }


class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id         = db.Column(db.Integer, primary_key=True)
    lead_id    = db.Column(db.Integer, db.ForeignKey("leads.id"), nullable=True)
    session_id = db.Column(db.String(64), nullable=False)
    role       = db.Column(db.String(20), nullable=False)
    content    = db.Column(db.Text,       nullable=False)
    created_at = db.Column(db.DateTime,   default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":         self.id,
            "lead_id":    self.lead_id,
            "session_id": self.session_id,
            "role":       self.role,
            "content":    self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
