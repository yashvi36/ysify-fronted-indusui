/**
 * INDUS UI — AI Chatbot Widget
 * Works with or without OpenAI key (smart fallback mode)
 */

(function ($) {
  "use strict";

  const API_BASE = "http://127.0.0.1:5000/api";

  // Session ID persisted across page loads
  let sessionId = localStorage.getItem("indus_session_id");
  if (!sessionId) {
    sessionId = "sess_" + Math.random().toString(36).substr(2, 12) + Date.now();
    localStorage.setItem("indus_session_id", sessionId);
  }

  let currentLeadId = null;

  // ── Inject HTML ─────────────────────────────────────────────────────────────
  const WIDGET_HTML = `
<div id="indus-chat-widget">
  <button id="indus-chat-toggle" title="Chat with our AI assistant">
    <span id="chat-btn-icon">💬</span>
    <span id="chat-btn-close" style="display:none">✕</span>
    <span id="indus-chat-badge" style="display:none">1</span>
  </button>
  <div id="indus-chat-window" style="display:none">
    <div id="indus-chat-header">
      <div class="chat-header-info">
        <div class="chat-avatar">🤖</div>
        <div>
          <strong>INDUS UI Assistant</strong>
          <small>AI-powered sales agent</small>
        </div>
      </div>
      <button id="indus-chat-close-btn" title="Close">✕</button>
    </div>
    <div id="indus-chat-messages"></div>
    <div id="indus-chat-input-area">
      <input type="text" id="indus-chat-input" placeholder="Type your message…" autocomplete="off"/>
      <button id="indus-chat-send">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
    <div id="indus-quick-actions" style="display:none">
      <button class="quick-btn" id="btn-get-proposal">📋 Get Proposal</button>
      <button class="quick-btn" id="btn-view-services">🔧 Our Services</button>
    </div>
  </div>
</div>

<div id="indus-proposal-modal" style="display:none">
  <div id="indus-proposal-overlay"></div>
  <div id="indus-proposal-content">
    <div id="indus-proposal-header">
      <h2>📋 Your Project Proposal</h2>
      <button id="indus-proposal-close">✕</button>
    </div>
    <div id="indus-proposal-body">
      <div id="proposal-loading"><div class="spinner"></div><p>Generating your proposal…</p></div>
      <div id="proposal-result" style="display:none"></div>
    </div>
  </div>
</div>`;

  // ── CSS ─────────────────────────────────────────────────────────────────────
  const WIDGET_CSS = `
#indus-chat-widget{position:fixed;bottom:28px;right:28px;z-index:99999;font-family:'Poppins',sans-serif}
#indus-chat-toggle{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#f96d00,#e05500);border:none;cursor:pointer;box-shadow:0 4px 18px rgba(249,109,0,.5);font-size:26px;display:flex;align-items:center;justify-content:center;transition:transform .2s,box-shadow .2s;position:relative}
#indus-chat-toggle:hover{transform:scale(1.1);box-shadow:0 6px 24px rgba(249,109,0,.6)}
#indus-chat-badge{position:absolute;top:-4px;right:-4px;background:#e53e3e;color:#fff;border-radius:50%;width:20px;height:20px;font-size:11px;font-weight:700;line-height:20px;text-align:center}
#indus-chat-window{position:absolute;bottom:74px;right:0;width:360px;background:#fff;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,.18);display:flex;flex-direction:column;overflow:hidden;animation:slideUp .25s ease}
@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
#indus-chat-header{background:linear-gradient(135deg,#1a1a2e,#16213e);padding:14px 16px;display:flex;align-items:center;justify-content:space-between;color:#fff}
.chat-header-info{display:flex;align-items:center;gap:10px}
.chat-avatar{font-size:28px;line-height:1}
#indus-chat-header strong{display:block;font-size:14px}
#indus-chat-header small{font-size:11px;opacity:.7}
#indus-chat-close-btn{background:none;border:none;color:#fff;font-size:18px;cursor:pointer;opacity:.7}
#indus-chat-close-btn:hover{opacity:1}
#indus-chat-messages{flex:1;height:320px;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:10px;background:#f8f9fa}
.chat-msg{max-width:82%;padding:10px 14px;border-radius:12px;font-size:13.5px;line-height:1.5;word-wrap:break-word}
.chat-msg.user{align-self:flex-end;background:linear-gradient(135deg,#f96d00,#e05500);color:#fff;border-bottom-right-radius:3px}
.chat-msg.assistant{align-self:flex-start;background:#fff;color:#333;border:1px solid #e8e8e8;border-bottom-left-radius:3px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.chat-msg.typing{opacity:.6;font-style:italic}
#indus-chat-input-area{display:flex;padding:12px 14px;background:#fff;border-top:1px solid #eee;gap:8px}
#indus-chat-input{flex:1;border:1.5px solid #e0e0e0;border-radius:24px;padding:9px 16px;font-size:13px;outline:none;transition:border-color .2s}
#indus-chat-input:focus{border-color:#f96d00}
#indus-chat-send{width:40px;height:40px;border-radius:50%;background:#f96d00;border:none;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;transition:background .2s}
#indus-chat-send:hover{background:#e05500}
#indus-quick-actions{padding:10px 14px;background:#fff;border-top:1px solid #eee;display:flex;gap:8px;flex-wrap:wrap}
.quick-btn{padding:7px 14px;border:1.5px solid #f96d00;border-radius:20px;background:#fff;color:#f96d00;font-size:12px;font-weight:600;cursor:pointer;transition:all .2s}
.quick-btn:hover{background:#f96d00;color:#fff}
#indus-proposal-modal{position:fixed;inset:0;z-index:999999;display:flex;align-items:center;justify-content:center}
#indus-proposal-overlay{position:absolute;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(3px)}
#indus-proposal-content{position:relative;background:#fff;border-radius:16px;width:min(680px,96vw);max-height:88vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.25);animation:slideUp .3s ease}
#indus-proposal-header{background:linear-gradient(135deg,#1a1a2e,#16213e);padding:18px 24px;display:flex;justify-content:space-between;align-items:center;color:#fff}
#indus-proposal-header h2{margin:0;font-size:18px}
#indus-proposal-close{background:none;border:none;color:#fff;font-size:22px;cursor:pointer;opacity:.7}
#indus-proposal-close:hover{opacity:1}
#indus-proposal-body{padding:24px;overflow-y:auto}
#proposal-loading{text-align:center;padding:40px}
.spinner{width:44px;height:44px;border:4px solid #f0f0f0;border-top-color:#f96d00;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px}
@keyframes spin{to{transform:rotate(360deg)}}
.proposal-title{font-size:22px;font-weight:700;color:#1a1a2e;margin-bottom:8px}
.proposal-overview{color:#555;font-size:14px;line-height:1.6;margin-bottom:20px}
.proposal-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px}
.proposal-stat{background:#f8f9fa;border-radius:10px;padding:14px 18px;border-left:3px solid #f96d00}
.proposal-stat .label{font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.6px}
.proposal-stat .value{font-size:17px;font-weight:700;color:#1a1a2e;margin-top:4px}
.feature-list{list-style:none;padding:0;margin:0 0 20px;display:flex;flex-direction:column;gap:6px}
.feature-list li{padding:8px 14px;background:#f0fff4;border-radius:8px;font-size:13.5px;color:#2d7a4f}
.feature-list li::before{content:"✓ ";font-weight:700}
.step-list{list-style:none;padding:0;margin:0;counter-reset:steps;display:flex;flex-direction:column;gap:8px}
.step-list li{counter-increment:steps;padding:10px 14px 10px 42px;background:#fff7f0;border-radius:8px;font-size:13.5px;border-left:3px solid #f96d00;position:relative}
.step-list li::before{content:counter(steps);position:absolute;left:12px;top:50%;transform:translateY(-50%);background:#f96d00;color:#fff;width:20px;height:20px;border-radius:50%;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center}
.proposal-cta{margin-top:24px;text-align:center;padding:20px;background:linear-gradient(135deg,#f96d00,#e05500);border-radius:12px;color:#fff}
.proposal-cta p{margin:0 0 12px;font-size:15px}
.proposal-cta a{display:inline-block;background:#fff;color:#f96d00;padding:10px 24px;border-radius:24px;font-weight:700;text-decoration:none;font-size:14px}
@media(max-width:480px){#indus-chat-window{width:calc(100vw - 24px);right:-14px}.proposal-grid{grid-template-columns:1fr}}
`;

  // ── Boot ────────────────────────────────────────────────────────────────────
  $(document).ready(function () {
    $("<style>").text(WIDGET_CSS).appendTo("head");
    $("body").append(WIDGET_HTML);
    bindEvents();
    setTimeout(showWelcome, 1200);
  });

  // ── Events ──────────────────────────────────────────────────────────────────
  function bindEvents() {
    $("#indus-chat-toggle").on("click", toggleChat);
    $("#indus-chat-close-btn").on("click", closeChat);
    $("#indus-chat-send").on("click", sendMessage);
    $("#indus-chat-input").on("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    });
    $("#btn-get-proposal").on("click", openProposalModal);
    $("#btn-view-services").on("click", function () { window.location.href = "services.html"; });
    $("#indus-proposal-close, #indus-proposal-overlay").on("click", closeProposalModal);
  }

  function toggleChat() {
    $("#indus-chat-window").is(":visible") ? closeChat() : openChat();
  }
  function openChat() {
    $("#indus-chat-window").show();
    $("#chat-btn-icon").hide();
    $("#chat-btn-close").show();
    $("#indus-chat-badge").hide();
    $("#indus-chat-input").focus();
    scrollToBottom();
  }
  function closeChat() {
    $("#indus-chat-window").hide();
    $("#chat-btn-icon").show();
    $("#chat-btn-close").hide();
  }

  // ── Messages ─────────────────────────────────────────────────────────────────
  function showWelcome() {
    addMessage("assistant", "👋 Hi there! I'm the INDUS UI AI Assistant.\n\nI can help you find the right service, estimate your project cost, and generate a personalised proposal — all in minutes!\n\nWhat kind of project are you looking to build?");
    if (!$("#indus-chat-window").is(":visible")) {
      $("#indus-chat-badge").show();
    }
  }

  function addMessage(role, text) {
    var $msg = $("<div>").addClass("chat-msg " + role)
      .html(String(text).replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g, "<br>"));
    $("#indus-chat-messages").append($msg);
    scrollToBottom();
  }

  function addTypingIndicator() {
    $("<div>").addClass("chat-msg assistant typing").attr("id","indus-typing").text("INDUS AI is typing…")
      .appendTo("#indus-chat-messages");
    scrollToBottom();
  }
  function removeTypingIndicator() { $("#indus-typing").remove(); }
  function scrollToBottom() {
    var el = document.getElementById("indus-chat-messages");
    if (el) el.scrollTop = el.scrollHeight;
  }

  // ── Send ─────────────────────────────────────────────────────────────────────
  function sendMessage() {
    var text = $("#indus-chat-input").val().trim();
    if (!text) return;

    $("#indus-chat-input").val("").prop("disabled", true);
    $("#indus-chat-send").prop("disabled", true);
    addMessage("user", text);
    addTypingIndicator();

    $.ajax({
      url: API_BASE + "/chat/message",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ session_id: sessionId, message: text }),
      timeout: 30000,
      success: function (res) {
        removeTypingIndicator();
        addMessage("assistant", res.reply);
        if (res.lead_captured && res.lead_id) {
          currentLeadId = res.lead_id;
          setTimeout(function () { $("#indus-quick-actions").slideDown(200); }, 600);
        }
      },
      error: function (xhr, status, err) {
        removeTypingIndicator();
        var msg = "❌ Cannot connect to the AI server.\n\nMake sure Flask is running:\n cd backend\n python app.py";
        if (status === "timeout") {
          msg = "⏱️ Request timed out. The AI is taking too long. Please try again.";
        }
        addMessage("assistant", msg);
        console.error("Chatbot API error:", status, err, xhr.responseText);
      },
      complete: function () {
        $("#indus-chat-input").prop("disabled", false);
        $("#indus-chat-send").prop("disabled", false);
        $("#indus-chat-input").focus();
      }
    });
  }

  // ── Proposal ─────────────────────────────────────────────────────────────────
  function openProposalModal() {
    $("#indus-proposal-modal").show();
    $("#proposal-loading").show();
    $("#proposal-result").hide().empty();

    var payload = currentLeadId
      ? { lead_id: currentLeadId }
      : { name: "Valued Client", service: "Web Development", requirements: "Custom project" };

    $.ajax({
      url: API_BASE + "/proposal/generate",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(payload),
      timeout: 30000,
      success: function (res) {
        $("#proposal-loading").hide();
        renderProposal(res.proposal, res.lead);
        $("#proposal-result").show();
      },
      error: function () {
        $("#proposal-loading").hide();
        $("#proposal-result").html('<p style="color:#e53e3e;text-align:center">Failed to generate proposal. Make sure Flask server is running.</p>').show();
      }
    });
  }

  function closeProposalModal() { $("#indus-proposal-modal").hide(); }

  function renderProposal(p, lead) {
    var features = (p.features || []).map(function(f){ return "<li>"+f+"</li>"; }).join("");
    var steps    = (p.next_steps || []).map(function(s){ return "<li>"+s+"</li>"; }).join("");
    var score    = lead && lead.score ? lead.score : "";
    var scoreBadge = score ? '<span style="display:inline-block;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:700;background:'+(score==="A"?"#d4edda":score==="B"?"#fff3cd":"#f8d7da")+';color:'+(score==="A"?"#155724":score==="B"?"#856404":"#721c24")+'">Lead Score: '+score+'</span>' : "";

    $("#proposal-result").html(
      '<div class="proposal-title">'+p.project_title+'</div>'+scoreBadge+
      '<p class="proposal-overview" style="margin-top:10px">'+p.overview+'</p>'+
      '<div class="proposal-grid">'+
        '<div class="proposal-stat"><div class="label">💰 Budget</div><div class="value">'+p.price_range+'</div></div>'+
        '<div class="proposal-stat"><div class="label">⏱ Timeline</div><div class="value">'+p.timeline+'</div></div>'+
        '<div class="proposal-stat" style="grid-column:1/-1"><div class="label">👥 Team</div><div class="value" style="font-size:14px">'+p.team+'</div></div>'+
      '</div>'+
      '<h3 style="font-size:12px;text-transform:uppercase;color:#f96d00;letter-spacing:.8px;margin-bottom:10px">✨ Key Features</h3>'+
      '<ul class="feature-list">'+features+'</ul>'+
      '<h3 style="font-size:12px;text-transform:uppercase;color:#f96d00;letter-spacing:.8px;margin:16px 0 10px">🚀 Next Steps</h3>'+
      '<ol class="step-list">'+steps+'</ol>'+
      '<div class="proposal-cta"><p>Ready to get started?</p><a href="contact.html">📞 Schedule a Discovery Call</a></div>'
    );
  }

})(jQuery);
