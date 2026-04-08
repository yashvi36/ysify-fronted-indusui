"""
OpenAI utility helpers for INDUS UI.
Includes graceful fallback if OpenAI key is missing or invalid.
"""

import json
import re
from flask import current_app

# ── CHATBOT SYSTEM PROMPT ─────────────────────────────────────────────────────
CHATBOT_SYSTEM = """
You are an AI sales assistant for INDUS UI, a premium UI/UX design and web development agency.
Your job is to:
1. Greet visitors warmly and understand what they need.
2. Ask about their project requirements, preferred service, budget range, and contact details
   (name, email, phone) — one question at a time so it feels conversational.
3. Suggest the most relevant INDUS UI service once you understand their needs.

INDUS UI services:
- UI/UX Design
- Web Development (React, Vue, HTML/CSS)
- Mobile App Development
- E-commerce Solutions
- Branding & Identity
- SEO & Digital Marketing
- Custom Software Development
- AI Integration

When you have collected name, email, and at least one of (service/requirements/budget),
append a JSON block at the END of your message like this:
<<<LEAD_DATA>>>
{"name":"...", "email":"...", "phone":"...", "service":"...", "budget":"...", "requirements":"..."}
<<<END_LEAD_DATA>>>

Be concise, friendly, and professional. Keep replies under 120 words.
"""

# ── Smart fallback responses (used when OpenAI key is not set) ────────────────
FALLBACK_RESPONSES = [
    "Hi! I'm the INDUS UI AI Assistant. What kind of project are you looking to build? 😊",
    "Great! Could you tell me a bit more about your requirements? For example, do you need a website, mobile app, or something else?",
    "Thanks for sharing that! What's your approximate budget for this project? (e.g. under $5k, $5k-$15k, $15k+)",
    "Perfect! May I have your name and email so our team can follow up with a detailed proposal?",
    "Thank you! Our team will reach out to you shortly with a customised proposal. In the meantime, feel free to check our services page! 🚀",
]
_fallback_index = {}


def _get_fallback(session_id):
    idx = _fallback_index.get(session_id, 0)
    response = FALLBACK_RESPONSES[min(idx, len(FALLBACK_RESPONSES) - 1)]
    _fallback_index[session_id] = idx + 1
    return response


# ── Helper: get OpenAI client ─────────────────────────────────────────────────
def _get_openai_client():
    try:
        from openai import OpenAI
        api_key = current_app.config.get("OPENAI_API_KEY", "")
        if not api_key or api_key.startswith("sk-YOUR"):
            return None
        return OpenAI(api_key=api_key)
    except Exception:
        return None


# ── PUBLIC API ────────────────────────────────────────────────────────────────

def chat_with_ai(messages):
    """Send conversation to OpenAI; fall back to scripted responses if unavailable."""
    session_id = "default"
    # Try to get session from last user message (for fallback tracking)
    for m in reversed(messages):
        if m.get("role") == "user":
            session_id = str(hash(m.get("content", "")))
            break

    client = _get_openai_client()
    if not client:
        current_app.logger.warning("OpenAI client unavailable — using fallback responses")
        return _get_fallback(session_id)

    try:
        system_msg = {"role": "system", "content": CHATBOT_SYSTEM}
        response = client.chat.completions.create(
            model=current_app.config.get("OPENAI_MODEL", "gpt-3.5-turbo"),
            messages=[system_msg] + messages,
            max_tokens=400,
            temperature=0.7,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        current_app.logger.error(f"OpenAI chat error: {e}")
        return _get_fallback(session_id)


def score_lead(lead_data):
    """Score lead A/B/C. Falls back to rule-based scoring if OpenAI unavailable."""
    client = _get_openai_client()

    # Rule-based fallback scoring
    def rule_based_score():
        has_email  = bool(lead_data.get("email"))
        has_budget = bool(lead_data.get("budget"))
        has_service = bool(lead_data.get("service"))
        score = "C"
        reason = "Insufficient information provided."
        if has_email and has_budget and has_service:
            score = "A"
            reason = "Complete contact info with budget and service specified."
        elif has_email and (has_budget or has_service):
            score = "B"
            reason = "Email provided with partial project details."
        return {"score": score, "reason": reason}

    if not client:
        return rule_based_score()

    prompt = f"""
Score this lead as A (hot), B (warm), or C (cold) for a web agency.
Lead: Name={lead_data.get('name')}, Email={lead_data.get('email')},
Service={lead_data.get('service')}, Budget={lead_data.get('budget')},
Requirements={lead_data.get('requirements')}

A = clear budget $5k+, specific requirements, valid contact
B = some info missing
C = vague or no budget/contact

Respond ONLY with JSON: {{"score": "A", "reason": "one sentence"}}
"""
    try:
        response = client.chat.completions.create(
            model=current_app.config.get("OPENAI_MODEL", "gpt-3.5-turbo"),
            messages=[{"role": "user", "content": prompt}],
            max_tokens=80,
            temperature=0.2,
        )
        raw = response.choices[0].message.content.strip()
        return json.loads(raw)
    except Exception as e:
        current_app.logger.error(f"Lead scoring error: {e}")
        return rule_based_score()


def recommend_services(requirements):
    """Return list of recommended services. Falls back to defaults if unavailable."""
    client = _get_openai_client()
    if not client:
        return ["UI/UX Design", "Web Development"]

    prompt = f"""
For a web agency, recommend 2-4 services from:
UI/UX Design, Web Development, Mobile App Development, E-commerce Solutions,
Branding & Identity, SEO & Digital Marketing, Custom Software Development, AI Integration.

Client requirements: "{requirements}"
Respond ONLY with a JSON array: ["Service 1", "Service 2"]
"""
    try:
        response = client.chat.completions.create(
            model=current_app.config.get("OPENAI_MODEL", "gpt-3.5-turbo"),
            messages=[{"role": "user", "content": prompt}],
            max_tokens=80,
            temperature=0.3,
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        current_app.logger.error(f"Service recommendation error: {e}")
        return ["UI/UX Design", "Web Development"]


def generate_proposal(lead_data):
    """Generate project proposal. Falls back to template if OpenAI unavailable."""
    client = _get_openai_client()

    def default_proposal():
        service = lead_data.get("service", "Web Development")
        name    = lead_data.get("name", "Client")
        return {
            "project_title": f"{service} Project for {name}",
            "overview": f"We will deliver a high-quality {service} solution tailored to your specific business needs with modern design and robust functionality.",
            "features": ["Responsive Design", "Modern UI/UX", "API Integration",
                         "Admin Dashboard", "Performance Optimisation"],
            "timeline": "6-8 weeks",
            "price_range": "$5,000 - $15,000",
            "next_steps": ["Schedule a discovery call", "Finalise requirements", "Kick-off meeting"],
            "team": "1 UI Designer + 2 Developers + 1 Project Manager",
        }

    if not client:
        return default_proposal()

    prompt = f"""
Generate a project proposal for INDUS UI agency client:
Name: {lead_data.get('name', 'Client')}
Service: {lead_data.get('service', 'Web Development')}
Budget: {lead_data.get('budget', 'Not specified')}
Requirements: {lead_data.get('requirements', 'Not specified')}

Respond ONLY with valid JSON:
{{
  "project_title": "...",
  "overview": "2-3 sentence summary",
  "features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "timeline": "e.g. 6-8 weeks",
  "price_range": "e.g. $8,000 - $12,000",
  "next_steps": ["Step 1", "Step 2", "Step 3"],
  "team": "e.g. 1 Designer + 2 Developers"
}}
"""
    try:
        response = client.chat.completions.create(
            model=current_app.config.get("OPENAI_MODEL", "gpt-3.5-turbo"),
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.5,
        )
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r"^```json|^```|```$", "", raw, flags=re.MULTILINE).strip()
        return json.loads(raw)
    except Exception as e:
        current_app.logger.error(f"Proposal generation error: {e}")
        return default_proposal()
