'use strict';
(function () {
  var history = [];
  var sending = false;

  var style = document.createElement('style');
  style.textContent = [
    '.mrg-chat-toggle{position:fixed;bottom:24px;right:24px;width:56px;height:56px;border-radius:50%;',
    'background:linear-gradient(135deg,#c9a84c,#a07c30);color:#111;display:flex;align-items:center;justify-content:center;',
    'font-size:26px;z-index:1200;box-shadow:0 4px 24px rgba(201,168,76,0.48);border:none;cursor:pointer;',
    'transition:transform .2s,box-shadow .2s;}',
    '.mrg-chat-toggle:hover{transform:scale(1.1);box-shadow:0 8px 36px rgba(201,168,76,0.6);}',
    '.mrg-chat-panel{position:fixed;bottom:92px;right:24px;width:340px;max-width:calc(100vw - 32px);height:460px;',
    'max-height:calc(100vh - 140px);background:#161616;border:1px solid #2a2a2a;border-radius:16px;',
    'box-shadow:0 12px 48px rgba(0,0,0,0.5);z-index:1200;display:none;flex-direction:column;overflow:hidden;',
    "font-family:inherit;}",
    '.mrg-chat-panel.open{display:flex;}',
    '.mrg-chat-head{background:linear-gradient(135deg,#c9a84c,#a07c30);color:#111;padding:14px 16px;',
    'font-weight:700;display:flex;align-items:center;justify-content:space-between;}',
    '.mrg-chat-head span{font-size:14px;}',
    '.mrg-chat-close{background:none;border:none;color:#111;font-size:20px;cursor:pointer;line-height:1;padding:0 4px;}',
    '.mrg-chat-body{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;}',
    '.mrg-msg{max-width:85%;padding:9px 12px;border-radius:12px;font-size:13.5px;line-height:1.45;white-space:pre-wrap;}',
    '.mrg-msg.user{align-self:flex-end;background:#c9a84c;color:#111;border-bottom-right-radius:4px;}',
    '.mrg-msg.bot{align-self:flex-start;background:#252525;color:#eee;border-bottom-left-radius:4px;}',
    '.mrg-msg.typing{align-self:flex-start;background:#252525;color:#999;font-style:italic;}',
    '.mrg-chat-input{display:flex;border-top:1px solid #2a2a2a;padding:10px;gap:8px;}',
    '.mrg-chat-input textarea{flex:1;resize:none;background:#0f0f0f;border:1px solid #333;border-radius:8px;',
    'color:#eee;padding:8px 10px;font-size:13.5px;font-family:inherit;max-height:80px;}',
    '.mrg-chat-input textarea:focus{outline:none;border-color:#c9a84c;}',
    '.mrg-chat-input button{background:#c9a84c;color:#111;border:none;border-radius:8px;padding:0 14px;',
    'font-weight:700;cursor:pointer;font-size:13px;}',
    '.mrg-chat-input button:disabled{opacity:0.5;cursor:default;}',
    '@media (max-width:480px){.mrg-chat-panel{right:16px;bottom:88px;}.mrg-chat-toggle{right:16px;}}'
  ].join('');
  document.head.appendChild(style);

  var toggle = document.createElement('button');
  toggle.className = 'mrg-chat-toggle';
  toggle.setAttribute('aria-label', 'Chat with Moringai Assistant');
  toggle.textContent = '🌿';

  var panel = document.createElement('div');
  panel.className = 'mrg-chat-panel';
  panel.innerHTML =
    '<div class="mrg-chat-head"><span>Moringai Assistant</span><button class="mrg-chat-close" aria-label="Close chat">×</button></div>' +
    '<div class="mrg-chat-body"></div>' +
    '<div class="mrg-chat-input"><textarea rows="1" placeholder="Ask about our moringa products..."></textarea><button>Send</button></div>';

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(toggle);
    document.body.appendChild(panel);
  });
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    document.body.appendChild(toggle);
    document.body.appendChild(panel);
  }

  var body = panel.querySelector('.mrg-chat-body');
  var textarea = panel.querySelector('textarea');
  var sendBtn = panel.querySelector('.mrg-chat-input button');
  var closeBtn = panel.querySelector('.mrg-chat-close');

  function addMessage(role, text) {
    var el = document.createElement('div');
    el.className = 'mrg-msg ' + role;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
    return el;
  }

  function openPanel() {
    panel.classList.add('open');
    if (!history.length) {
      addMessage('bot', "Hi! I'm the Moringai Assistant. Ask me about our moringa powder, capsules, dosage, shipping, or anything else.");
    }
    textarea.focus();
  }

  toggle.addEventListener('click', function () {
    panel.classList.contains('open') ? panel.classList.remove('open') : openPanel();
  });
  closeBtn.addEventListener('click', function () { panel.classList.remove('open'); });

  async function send() {
    var text = textarea.value.trim();
    if (!text || sending) return;
    sending = true;
    textarea.value = '';
    sendBtn.disabled = true;
    addMessage('user', text);
    history.push({ role: 'user', content: text });
    var typingEl = addMessage('typing', 'Thinking...');

    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });
      var data = await res.json();
      typingEl.remove();
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
      addMessage('bot', data.reply);
      history.push({ role: 'assistant', content: data.reply });
    } catch (err) {
      typingEl.remove();
      addMessage('bot', "Sorry, I'm having trouble connecting. Please try again or reach us on WhatsApp.");
    } finally {
      sending = false;
      sendBtn.disabled = false;
    }
  }

  sendBtn.addEventListener('click', send);
  textarea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  });
})();
