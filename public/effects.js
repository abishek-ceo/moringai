// ── HERO PARTICLES (gold + green mix for dark bg) ───────────
(function(){
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var colors = [
    'rgba(201,168,76,0.45)',
    'rgba(183,228,199,0.35)',
    'rgba(201,168,76,0.25)',
    'rgba(116,198,157,0.4)',
    'rgba(232,212,157,0.3)',
  ];
  for (var i = 0; i < 22; i++) {
    (function(i){
      var d = document.createElement('div');
      var size = Math.random()*7+2;
      var color = colors[Math.floor(Math.random()*colors.length)];
      d.style.cssText = [
        'position:absolute','border-radius:50%',
        'background:'+color,
        'pointer-events:none',
        'width:'+size+'px','height:'+size+'px',
        'left:'+(Math.random()*100)+'%',
        'top:'+(Math.random()*100)+'%',
        'animation:heroParticleDrift '+(Math.random()*9+5)+'s linear '+(Math.random()*8)+'s infinite'
      ].join(';');
      hero.appendChild(d);
    })(i);
  }
  var style = document.createElement('style');
  style.textContent = '@keyframes heroParticleDrift{0%{transform:translateY(0) scale(1);opacity:.7}40%{transform:translateY(-50px) translateX(20px) scale(1.25);opacity:1}100%{transform:translateY(-130px) translateX(-12px) scale(0.4);opacity:0}}';
  document.head.appendChild(style);
})();

// ── FLOATING MORINGA LEAVES ────────────────────────────────
(function(){
  var LEAVES = ['🌿','🍃','🌱','✨'];
  // Attach to hero-bg so leaves stay BEHIND hero-content (z-index:2)
  var container = document.querySelector('.hero-bg') || document.querySelector('.hero');
  if (!container) return;
  var activeLeaves = 0;
  var MAX_LEAVES = 6;

  function spawnLeaf() {
    if (activeLeaves >= MAX_LEAVES) return;
    activeLeaves++;
    var el = document.createElement('span');
    var leaf = LEAVES[Math.floor(Math.random()*LEAVES.length)];
    var size = Math.random()*12+9;
    var left = Math.random()*100;
    var dur = Math.random()*8+7;
    var sway = (Math.random()*50-25);
    el.textContent = leaf;
    el.style.cssText = 'position:absolute;left:'+left+'%;top:110%;font-size:'+size+'px;pointer-events:none;opacity:0.55;z-index:0;animation:leafFall '+dur+'s linear forwards;--sway:'+sway+'px';
    container.appendChild(el);
    setTimeout(function(){
      el.remove();
      activeLeaves = Math.max(0, activeLeaves - 1);
    }, dur*1000+100);
  }

  var leafStyle = document.createElement('style');
  leafStyle.textContent = '@keyframes leafFall{0%{transform:translateY(0) rotate(0deg);opacity:.55}25%{transform:translateY(-25vh) translateX(var(--sway)) rotate(90deg)}50%{transform:translateY(-50vh) translateX(0) rotate(180deg);opacity:.65}75%{transform:translateY(-75vh) translateX(calc(var(--sway)*-0.7)) rotate(270deg)}100%{transform:translateY(-110vh) translateX(0) rotate(360deg);opacity:0}}';
  document.head.appendChild(leafStyle);

  for(var i=0;i<3;i++) setTimeout(spawnLeaf, i*1200);
  setInterval(spawnLeaf, 3500);
})();

// ── AURORA GRADIENT ANIMATION (dark-bg tuned) ──────────────
(function(){
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var aurora = document.createElement('div');
  aurora.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;border-radius:inherit';
  aurora.innerHTML = [
    '<div style="position:absolute;width:800px;height:800px;background:radial-gradient(ellipse,rgba(82,183,136,0.14) 0%,transparent 65%);border-radius:50%;top:-260px;left:-180px;animation:auroraDrift1 16s ease-in-out infinite;"></div>',
    '<div style="position:absolute;width:600px;height:600px;background:radial-gradient(ellipse,rgba(201,168,76,0.07) 0%,transparent 65%);border-radius:50%;bottom:-120px;right:-120px;animation:auroraDrift2 12s ease-in-out infinite;"></div>',
    '<div style="position:absolute;width:500px;height:500px;background:radial-gradient(ellipse,rgba(27,67,50,0.55) 0%,transparent 65%);border-radius:50%;top:25%;left:38%;animation:auroraDrift3 20s ease-in-out infinite;"></div>',
    '<div style="position:absolute;width:350px;height:350px;background:radial-gradient(ellipse,rgba(201,168,76,0.06) 0%,transparent 70%);border-radius:50%;top:60%;left:60%;animation:auroraDrift1 22s ease-in-out infinite reverse;"></div>'
  ].join('');
  hero.insertBefore(aurora, hero.firstChild);
  var s = document.createElement('style');
  s.textContent = [
    '@keyframes auroraDrift1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(80px,-40px) scale(1.14)}66%{transform:translate(-40px,60px) scale(0.92)}}',
    '@keyframes auroraDrift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-60px,-50px) scale(1.2)}}',
    '@keyframes auroraDrift3{0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}50%{transform:translate(40px,-28px) scale(1.1) rotate(18deg)}}'
  ].join('');
  document.head.appendChild(s);
})();

// ── CURSOR GLOW (single circle only — no dot trail) ────────
(function(){
  if (window.matchMedia('(hover:none)').matches) return;
  var glow = document.createElement('div');
  glow.id = 'cursorGlow';
  glow.style.cssText = 'position:fixed;width:32px;height:32px;background:radial-gradient(circle,rgba(82,183,136,0.45),transparent 70%);border-radius:50%;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);transition:left .1s ease,top .1s ease;mix-blend-mode:screen;';
  document.body.appendChild(glow);
  document.addEventListener('mousemove', function(e){
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
})();

// ── 3D CARD TILT ───────────────────────────────────────────
(function(){
  if (window.matchMedia('(hover:none)').matches) return;
  function addTilt(selector) {
    document.querySelectorAll(selector).forEach(function(card) {
      // Override any CSS hover transforms by controlling transition ourselves
      card.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease';
      card.style.willChange = 'transform';

      var shine = document.createElement('div');
      shine.className = 'tilt-shine';
      shine.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity 0.2s;z-index:2';
      card.appendChild(shine);

      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(800px) rotateY('+(x*12)+'deg) rotateX('+(-y*8)+'deg) translateY(-8px) scale(1.02)';
        card.style.boxShadow = '0 24px 64px rgba(27,67,50,'+(0.14+Math.abs(x)*0.18)+')';
        shine.style.opacity = '0.15';
        shine.style.background = 'radial-gradient(ellipse at '+(x*100+50)+'% '+(y*100+50)+'%, rgba(255,255,255,0.5) 0%, transparent 68%)';
      });

      card.addEventListener('mouseleave', function() {
        card.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
        card.style.transform = '';
        card.style.boxShadow = '';
        shine.style.opacity = '0';
        // Restore fast transition after reset
        setTimeout(function(){
          card.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease';
        }, 420);
      });
    });
  }
  setTimeout(function(){
    addTilt('.product-card');
    addTilt('.feature-card');
    addTilt('.review-card');
  }, 800);
})();

// ── MAGNETIC BUTTONS ───────────────────────────────────────
(function(){
  if (window.matchMedia('(hover:none)').matches) return;
  function applyMagnetic(btn) {
    btn.addEventListener('mousemove', function(e) {
      var rect = btn.getBoundingClientRect();
      var dx = e.clientX - (rect.left + rect.width/2);
      var dy = e.clientY - (rect.top + rect.height/2);
      btn.style.transform = 'translate('+(dx*0.18)+'px,'+(dy*0.18)+'px) scale(1.04)';
      btn.style.transition = 'transform 0.12s ease';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
      btn.style.transform = '';
    });
  }
  setTimeout(function(){
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(applyMagnetic);
  }, 700);
})();

// ── RIPPLE ON BUTTON CLICKS ────────────────────────────────
document.addEventListener('click', function(e){
  var btn = e.target.closest('button, .btn-primary, .btn-secondary');
  if (!btn) return;
  var pos = btn.style.position;
  if (!pos || pos === 'static') btn.style.position = 'relative';
  btn.style.overflow = 'hidden';
  var r = document.createElement('span');
  var rect = btn.getBoundingClientRect();
  var size = Math.max(rect.width, rect.height);
  r.style.cssText = 'position:absolute;border-radius:50%;background:rgba(255,255,255,0.38);width:'+size+'px;height:'+size+'px;left:'+(e.clientX-rect.left-size/2)+'px;top:'+(e.clientY-rect.top-size/2)+'px;transform:scale(0);animation:ripple 0.55s linear;pointer-events:none';
  if (!document.getElementById('rippleStyle')) {
    var s = document.createElement('style');
    s.id = 'rippleStyle';
    s.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0}}';
    document.head.appendChild(s);
  }
  btn.appendChild(r);
  setTimeout(function(){ r.remove(); }, 600);
});

// ── CONFETTI ON ADD TO CART ────────────────────────────────
function confettiBurst(x, y) {
  var colors = ['#c9a84c','#e8d49d','#2d6a4f','#52b788','#b7e4c7','#40916c','#a07c30'];
  for (var i = 0; i < 14; i++) {
    (function(i){
      var el = document.createElement('div');
      var size = Math.random()*7+3;
      var angle = (i/14)*360 + Math.random()*20;
      var dist = Math.random()*90+50;
      var shape = Math.random() > 0.5 ? '50%' : '2px';
      el.style.cssText = 'position:fixed;left:'+x+'px;top:'+y+'px;width:'+size+'px;height:'+size+'px;background:'+colors[i%colors.length]+';border-radius:'+shape+';pointer-events:none;z-index:99999;transition:transform .75s cubic-bezier(0.2,0.8,0.4,1),opacity .75s;opacity:1';
      document.body.appendChild(el);
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        var rad = angle * Math.PI / 180;
        el.style.transform = 'translate('+(Math.cos(rad)*dist)+'px,'+(Math.sin(rad)*dist - 35)+'px) rotate('+(Math.random()*360-180)+'deg) scale(0)';
        el.style.opacity = '0';
        setTimeout(function(){ el.remove(); }, 800);
      }); });
    })(i);
  }
}
document.addEventListener('click', function(e){
  if (e.target.closest('.add-to-cart')) confettiBurst(e.clientX, e.clientY);
});

// ── SCROLL REVEAL WITH STAGGER WAVE ───────────────────────
(function(){
  if (!('IntersectionObserver' in window)) return;
  var seen = new Set();

  // Per-element fade-in observer
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (entry.isIntersecting && !seen.has(entry.target)) {
        seen.add(entry.target);
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        obs.unobserve(entry.target);
      }
    });
  }, {threshold: 0.1});

  document.querySelectorAll('.feature-card, .review-card, .product-card, .benefit-item').forEach(function(el){
    if (!el.classList.contains('visible')) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      obs.observe(el);
    }
  });

  // Stagger wave for grid containers
  var gridObs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      var children = entry.target.querySelectorAll('.product-card,.feature-card,.review-card,.benefit-item');
      children.forEach(function(child, idx){
        setTimeout(function(){
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        }, idx * 70);
      });
      gridObs.unobserve(entry.target);
    });
  }, {threshold: 0.05});

  document.querySelectorAll('#productsGrid, .features-grid, .reviews-grid').forEach(function(grid){
    gridObs.observe(grid);
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
        var startTime = null;
        function step(ts) {
          if (!startTime) startTime = ts;
          var p = Math.min((ts - startTime) / 1400, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.floor(eased * num) + suffix;
          if (p < 1) requestAnimationFrame(step);
          else el.textContent = target;
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      }
    });
  }, {threshold: 0.5});
  document.querySelectorAll('.stat-num').forEach(function(el){ obs.observe(el); });
})();

// ── SHIMMER TEXT ON HERO TITLE ─────────────────────────────
(function(){
  // shimmer-text class is defined in fix.css — just apply it here
  var heroH = document.querySelector('.hero-title');
  if (heroH) heroH.classList.add('shimmer-text');
})();

// ── SECTION ENTRANCE WAVES ─────────────────────────────────
(function(){
  if (!('IntersectionObserver' in window)) return;
  // section-wave-in styles are in fix.css — just wire up the observer
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, {threshold: 0.08});
  document.querySelectorAll('section').forEach(function(el){
    if (!el.classList.contains('hero')) {
      el.classList.add('section-wave-in');
      obs.observe(el);
    }
  });
})();
