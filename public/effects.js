// ── HERO PARTICLES ─────────────────────────────────────────
(function(){
  var hero = document.querySelector('.hero');
  if (!hero) return;
  for (var i = 0; i < 20; i++) {
    (function(){
      var d = document.createElement('div');
      var size = Math.random()*10+4;
      d.style.cssText = [
        'position:absolute','border-radius:50%',
        'background:rgba(183,228,199,0.4)',
        'pointer-events:none',
        'width:'+size+'px','height:'+size+'px',
        'left:'+(Math.random()*100)+'%',
        'top:'+(Math.random()*100)+'%',
        'animation:heroParticleDrift '+(Math.random()*7+4)+'s linear '+(Math.random()*6)+'s infinite'
      ].join(';');
      hero.appendChild(d);
    })();
  }
  var style = document.createElement('style');
  style.textContent = '@keyframes heroParticleDrift{0%{transform:translateY(0) scale(1);opacity:.7}50%{transform:translateY(-60px) translateX(20px) scale(1.3);opacity:1}100%{transform:translateY(-120px) translateX(-10px) scale(0.6);opacity:0}}';
  document.head.appendChild(style);
})();

// ── RIPPLE ON BUTTONS ──────────────────────────────────────
document.addEventListener('click', function(e){
  var btn = e.target.closest('button, .btn-primary, .btn-secondary');
  if (!btn) return;
  if (!btn.style.position || btn.style.position === 'static') btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  var r = document.createElement('span');
  var rect = btn.getBoundingClientRect();
  var size = Math.max(rect.width, rect.height);
  r.style.cssText = 'position:absolute;border-radius:50%;background:rgba(255,255,255,0.4);width:'+size+'px;height:'+size+'px;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px;transform:scale(0);animation:ripple 0.6s linear;pointer-events:none';
  var style = document.getElementById('rippleStyle');
  if (!style) { style=document.createElement('style'); style.id='rippleStyle'; style.textContent='@keyframes ripple{to{transform:scale(4);opacity:0}}'; document.head.appendChild(style); }
  btn.appendChild(r);
  setTimeout(function(){ r.remove(); }, 700);
});

// ── CONFETTI ON ADD TO CART ────────────────────────────────
function confettiBurst(x, y) {
  var colors = ['#2d6a4f','#52b788','#b7e4c7','#f4a261','#f0c030','#40916c'];
  for (var i = 0; i < 24; i++) {
    (function(i){
      var el = document.createElement('div');
      var size = Math.random()*8+3;
      var angle = Math.random()*360;
      var dist = Math.random()*100+50;
      el.style.cssText = 'position:fixed;left:'+x+'px;top:'+y+'px;width:'+size+'px;height:'+size+'px;background:'+colors[i%colors.length]+';border-radius:'+(Math.random()>.5?'50%':'4px')+';pointer-events:none;z-index:99999;transition:transform .8s ease-out,opacity .8s;opacity:1';
      document.body.appendChild(el);
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        var rad=angle*Math.PI/180;
        el.style.transform='translate('+(Math.cos(rad)*dist)+'px,'+(Math.sin(rad)*dist)+'px) scale(0)';
        el.style.opacity='0';
        setTimeout(function(){ el.remove(); }, 900);
      }); });
    })(i);
  }
}
document.addEventListener('click', function(e){
  if (e.target.closest('.add-to-cart')) confettiBurst(e.clientX, e.clientY);
});

// ── SCROLL REVEAL ──────────────────────────────────────────
(function(){
  if (!('IntersectionObserver' in window)) return;
  var seen = new Set();
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting && !seen.has(entry.target)) {
        seen.add(entry.target);
        entry.target.style.opacity='1';
        entry.target.style.transform='none';
        obs.unobserve(entry.target);
      }
    });
  }, {threshold:0.12});
  document.querySelectorAll('.feature-card, .review-card, .product-card, .benefit-item').forEach(function(el){
    if (!el.classList.contains('visible')) {
      el.style.transition='opacity 0.55s ease, transform 0.55s ease';
      obs.observe(el);
    }
  });
})();

// ── COUNTER ANIMATION ──────────────────────────────────────
(function(){
  if (!('IntersectionObserver' in window)) return;
  var done = new Set();
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting && !done.has(entry.target)) {
        done.add(entry.target);
        var el = entry.target;
        var target = el.dataset.count || el.textContent;
        var num = parseFloat(target.replace(/[^0-9.]/g,''));
        var suffix = target.replace(/[0-9,+.]/g,'');
        var start = 0, startTime = null;
        function step(ts) {
          if (!startTime) startTime=ts;
          var p = Math.min((ts-startTime)/1400, 1);
          el.textContent = Math.floor(p*num) + suffix;
          if (p<1) requestAnimationFrame(step); else el.textContent=target;
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      }
    });
  }, {threshold:0.5});
  document.querySelectorAll('.stat-num').forEach(function(el){ obs.observe(el); });
})();
