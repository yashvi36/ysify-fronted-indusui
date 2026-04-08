"""
extensions.py — holds shared Flask extensions.
Import db from HERE (not from app.py) to avoid circular imports.
"""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
