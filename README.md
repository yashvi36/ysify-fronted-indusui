# INDUS UI — AI-Powered Website

A premium UI/UX & web development agency website with a full **Python Flask AI backend** for lead capture, scoring, service recommendation, and proposal generation.

---

## 🗂 Project Structure

```
ysify_project/
├── frontend/                   # Static HTML/CSS/JS website (unchanged)
│   ├── index.html              # ← AI chatbot injected here
│   ├── about.html
│   ├── services.html
│   ├── contact.html
│   ├── admin-dashboard.html    # ← NEW: AI Lead management dashboard
│   ├── js/
│   │   ├── chatbot.js          # ← NEW: Floating AI chatbot widget
│   │   └── ... (existing JS)
│   └── css/ images/ fonts/ ...
│
├── backend/                    # NEW: Python Flask AI backend
│   ├── app.py                  # Flask app factory
│   ├── config.py               # Config (DB, OpenAI, Flask)
│   ├── requirements.txt        # Python dependencies
│   ├── models/
│   │   └── models.py           # SQLAlchemy models (Lead, ChatMessage)
│   ├── routes/
│   │   ├── chat.py             # POST /api/chat/message
│   │   ├── leads.py            # CRUD /api/leads/
│   │   ├── proposal.py         # POST /api/proposal/generate
│   │   └── admin.py            # GET  /api/admin/stats & leads
│   └── utils/
│       └── ai_helpers.py       # OpenAI wrappers
│
└── database.sql                # MySQL schema + sample data
```

---

## 🚀 Quick Start

### 1. Install Python dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set your OpenAI API key

**Option A — Environment variable (recommended):**
```bash
export OPENAI_API_KEY="sk-your-real-key-here"
```

**Option B — Edit `backend/config.py`:**
```python
OPENAI_API_KEY = "sk-your-real-key-here"
```

### 3. Set up the database

**Option A — SQLite (zero config, perfect for local dev):**
Leave `DB_PASSWORD` empty in `config.py`. A file `backend/indusui.db` will be created automatically.

**Option B — MySQL:**
```bash
mysql -u root -p < database.sql
```
Then set environment variables:
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=indusui_db
export DB_USER=root
export DB_PASSWORD=your_mysql_password
```

### 4. Start the Flask backend

```bash
cd backend
python app.py
```

You should see:
```
* Running on http://0.0.0.0:5000
```

### 5. Open the website

Open `frontend/index.html` in your browser (or serve it via any static server):

```bash
# Using Python's built-in server
cd frontend
python -m http.server 8080
# then open http://localhost:8080
```

The floating **💬 chat button** will appear in the bottom-right corner of every page.

### 6. Access the Admin Dashboard

Open `frontend/admin-dashboard.html` in your browser while the Flask server is running.

---

## 🤖 AI Features

| Feature | Endpoint | Description |
|---|---|---|
| AI Chatbot | `POST /api/chat/message` | Lead-conversion chatbot powered by GPT |
| Lead Storage | Auto via chatbot | Saves name, email, phone, service, budget |
| Lead Scoring | Auto via chatbot | Classifies leads A (hot) / B (warm) / C (cold) |
| Service Recommendation | `POST /api/leads/recommend` | Suggests services based on requirements |
| Proposal Generator | `POST /api/proposal/generate` | Full project proposal with price & timeline |
| Admin Dashboard | `GET /api/admin/stats` | Aggregate stats for admin panel |

---

## 📡 API Reference

### Chat
```
POST /api/chat/message
Body: { "session_id": "abc", "message": "I need a website" }

GET /api/chat/history/<session_id>
```

### Leads
```
POST /api/leads/          → create lead
GET  /api/leads/          → list leads (?score=A|B|C)
GET  /api/leads/<id>      → single lead
POST /api/leads/recommend → { "requirements": "..." }
```

### Proposal
```
POST /api/proposal/generate
Body: { "lead_id": 1 }
  OR  { "name": "...", "service": "...", "budget": "...", "requirements": "..." }
```

### Admin
```
GET /api/admin/stats
GET /api/admin/leads  (?page=1&per_page=20&score=A)
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | `sk-YOUR_KEY` | **Required** for AI features |
| `OPENAI_MODEL` | `gpt-3.5-turbo` | OpenAI model to use |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `indusui_db` | Database name |
| `DB_USER` | `root` | Database user |
| `DB_PASSWORD` | *(empty = SQLite)* | Database password |
| `SECRET_KEY` | auto | Flask secret key |

---

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3, Bootstrap 4, jQuery, AOS animations
- **Backend:** Python 3.10+, Flask, SQLAlchemy, Flask-CORS
- **AI:** OpenAI GPT-3.5-turbo (chat completions)
- **Database:** SQLite (dev) / MySQL (production)
- **Packaging:** PyMySQL, python-dotenv

---

## 📝 Notes

- The chatbot widget is injected into all main HTML pages via `js/chatbot.js`
- The chatbot uses `localStorage` to persist the session across page navigations
- Lead data is automatically extracted from the conversation when the AI detects sufficient info (name + email + at least one of service/budget/requirements)
- All OpenAI calls include graceful fallbacks if the API is unavailable

---

Built with ❤️ — INDUS UI AI System
