"""
Configuration for INDUS UI backend.
Copy this file to config_local.py and override settings for production.
"""

import os

class Config:
    # ── Flask ─────────────────────────────────────────────────────────────────
    SECRET_KEY = os.environ.get("SECRET_KEY", "indus-ui-secret-key-change-in-production")
    DEBUG = os.environ.get("FLASK_DEBUG", "true").lower() == "true"

    # ── Database (MySQL) ──────────────────────────────────────────────────────
    # Format: mysql+pymysql://user:password@host:port/dbname
    # Defaults to SQLite for easy local dev — swap to MySQL for production
    DB_HOST     = os.environ.get("DB_HOST",     "localhost")
    DB_PORT     = os.environ.get("DB_PORT",     "3306")
    DB_NAME     = os.environ.get("DB_NAME",     "indusui_db")
    DB_USER     = os.environ.get("DB_USER",     "root")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "")

    # Use MySQL if credentials are provided, else fall back to SQLite
    if DB_PASSWORD:
        SQLALCHEMY_DATABASE_URI = (
            f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )
    else:
        SQLALCHEMY_DATABASE_URI = "sqlite:///indusui.db"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ── OpenAI ────────────────────────────────────────────────────────────────
    # Replace with your real key or set the env variable
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "sk-YOUR_OPENAI_API_KEY_HERE")
    OPENAI_MODEL   = os.environ.get("OPENAI_MODEL", "gpt-3.5-turbo")

    # ── App behaviour ─────────────────────────────────────────────────────────
    MAX_CHAT_HISTORY = 20   # messages kept in context per session
