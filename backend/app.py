"""
INDUS UI - AI-Powered Backend
Flask application entry point
"""

from flask import Flask
from flask_cors import CORS
from config import Config
from extensions import db          # db lives in extensions.py, NOT here


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for all /api/* routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialise SQLAlchemy with this app
    db.init_app(app)

    # Import blueprints INSIDE the function to avoid circular imports
    from routes.chat     import chat_bp
    from routes.leads    import leads_bp
    from routes.proposal import proposal_bp
    from routes.admin    import admin_bp

    app.register_blueprint(chat_bp,     url_prefix="/api/chat")
    app.register_blueprint(leads_bp,    url_prefix="/api/leads")
    app.register_blueprint(proposal_bp, url_prefix="/api/proposal")
    app.register_blueprint(admin_bp,    url_prefix="/api/admin")

    # Create DB tables on first run
    with app.app_context():
        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
