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

// ── FLOATING MORINGA LEAVES ────────────────────────────────
(function(){
  var LEAVES = ['🌿','🍃','🌱','✨','🍀'];
  var hero = document.querySelector('.hero');
  if (!hero) return;
  function spawnLeaf() {
    var el = document.createElement('span');
    var leaf = LEAVES[Math.floor(Math.random()*LEAVES.length)];
    var size = Math.random()*18+12;
    var left = Math.random()*100;
    var dur = Math.random()*8+6;
    var delay = Math.random()*4;
    var sway = (Math.random()*80-40);
    el.textContent = leaf;
    el.style.cssText = 'position:absolute;left:'+left+'%;top:110%;font-size:'+size+'px;pointer-events:none;opacity:0.8;z-index:1;animation:leafFall '+dur+'s '+delay+'s linear forwards;--sway:'+sway+'px';
    hero.appendChild(el);
    setTimeout(function(){ el.remove(); }, (dur+delay)*1000+100);
  }
  var leafStyle = document.createElement('style');
  leafStyle.textContent = '@keyframes leafFall{0%{transform:translateY(0) rotate(0deg);opacity:.8}25%{transform:translateY(-25vh) translateX(var(--sway)) rotate(90deg)}50%{transform:translateY(-50vh) translateX(0) rotate(180deg);opacity:.9}75%{transform:translateY(-75vh) translateX(calc(var(--sway)*-1)) rotate(270deg)}100%{transform:translateY(-110vh) translateX(0) rotate(360deg);opacity:0}}';
  document.head.appendChild(leafStyle);
  for(var i=0;i<6;i++) setTimeout(spawnLeaf, i*600);
  setInterval(spawnLeaf, 1200);
})();

// ── AURORA GRADIENT ANIMATION ──────────────────────────────
(function(){
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var aurora = document.createElement('div');
  aurora.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:0;overflow:hidden;border-radius:inherit';
  aurora.innerHTML = [
    '<div style="position:absolute;width:700px;height:700px;background:radial-gradient(ellipse,rgba(82,183,136,0.22) 0%,transparent 70%);border-radius:50%;top:-200px;left:-150px;animation:auroraDrift1 12s ease-in-out infinite;"></div>',
    '<div style="position:absolute;width:500px;height:500px;background:radial-gradient(ellipse,rgba(27,67,50,0.28) 0%,transparent 70%);border-radius:50%;bottom:-100px;right:-100px;animation:auroraDrift2 10s ease-in-out infinite;"></div>',
    '<div style="position:absolute;width:400px;height:400px;background:radial-gradient(ellipse,rgba(183,228,199,0.15) 0%,transparent 70%);border-radius:50%;top:30%;left:40%;animation:auroraDrift3 15s ease-in-out infinite;"></div>'
  ].join('');
  hero.insertBefore(aurora, hero.firstChild);
  var s = document.createElement('style');
  s.textContent = [
    '@keyframes auroraDrift1{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(80px,-40px) scale(1.15)}66%{transform:translate(-40px,60px) scale(0.92)}}',
    '@keyframes auroraDrift2{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-60px,-50px) scale(1.2)}}',
    '@keyframes auroraDrift3{0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}50%{transform:translate(40px,-30px) scale(1.1) rotate(20deg)}}'
  ].join('');
  document.head.appendChild(s);
})();

// ── CURSOR GLOW TRAIL ──────────────────────────────────────
(function(){
  if (window.matchMedia('(hover:none)').matches) return;
  var trail = document.createElement('div');
  trail.id = 'cursorGlow';
  trail.style.cssText = 'position:fixed;width:28px;height:28px;background:radial-gradient(circle,rgba(82,183,136,0.55),transparent 70%);border-radius:50%;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);transition:left .08s ease,top .08s ease;mix-blend-mode:screen';
  document.body.appendChild(trail);
  var mx=0, my=0;
  document.addEventListener('mousemove', function(e){
    mx=e.clientX; my=e.clientY;
    trail.style.left=mx+'px'; trail.style.top=my+'px';
  });
  // Spawn tiny dot trails
  setInterval(function(){
    var dot = document.createElement('div');
    dot.style.cssText = 'position:fixed;width:6px;height:6px;background:rgba(82,183,136,0.4);border-radius:50%;pointer-events:none;z-index:99998;left:'+mx+'px;top:'+my+'px;transform:translate(-50%,-50%);transition:opacity 0.5s,transform 0.5s;';
    document.body.appendChild(dot);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      dot.style.opacity='0'; dot.style.transform='translate(-50%,-50%) scale(2.5)';
      setTimeout(function(){ dot.remove(); }, 550);
    }); });
  }, 60);
})();

// ── 3D CARD TILT ───────────────────────────────────────────
(function(){
  if (window.matchMedia('(hover:none)').matches) return;
  function addTilt(selector) {
    document.querySelectorAll(selector).forEach(function(card) {
      card.addEventListener('mousemove', function(e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = 'perspective(700px) rotateY('+(x*14)+'deg) rotateX('+(-y*10)+'deg) translateY(-10px) scale(1.03)';
        card.style.boxShadow = '0 30px 80px rgba(45,106,79,'+(0.15+Math.abs(x)*0.2)+')';
        var shine = card.querySelector('.tilt-shine');
        if (shine) { shine.style.opacity = '0.18'; shine.style.background = 'radial-gradient(ellipse at '+(x*100+50)+'% '+(y*100+50)+'%, rgba(255,255,255,0.55) 0%, transparent 70%)'; }
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = '';
        card.style.boxShadow = '';
        var shine = card.querySelector('.tilt-shine');
        if (shine) shine.style.opacity = '0';
      });
      card.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
      card.style.willChange = 'transform';
      card.style.position = 'relative';
      var shine = document.createElement('div');
      shine.className = 'tilt-shine';
      shine.style.cssText = 'position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity 0.2s;z-index:2';
      card.appendChild(shine);
    });
  }
  // Apply after DOM is ready
  setTimeout(function(){ addTilt('.product-card'); addTilt('.feature-card'); addTilt('.review-card'); addTilt('.blog-card'); }, 800);
})();

// ── MAGNETIC BUTTONS ───────────────────────────────────────
(function(){
  if (window.matchMedia('(hover:none)').matches) return;
  function applyMagnetic(btn) {
    btn.addEventListener('mousemove', function(e) {
      var rect = btn.getBoundingClientRect();
      var dx = e.clientX - (rect.left + rect.width/2);
      var dy = e.clientY - (rect.top + rect.height/2);
      btn.style.transform = 'translate('+(dx*0.22)+'px,'+(dy*0.22)+'px) scale(1.05)';
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
    });
    btn.addEventListener('mouseenter', function() {
      btn.style.transition = 'transform 0.15s ease';
    });
  }
  setTimeout(function(){
    document.querySelectorAll('.btn-primary, .btn-secondary, .add-to-cart, .hero-ctas button').forEach(applyMagnetic);
  }, 600);
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
  for (var i = 0; i < 36; i++) {
    (function(i){
      var el = document.createElement('div');
      var size = Math.random()*10+3;
      var angle = (i/36)*360 + Math.random()*30;
      var dist = Math.random()*120+60;
      var shape = Math.random()>.5 ? '50%' : (Math.random()*4+2)+'px';
      el.style.cssText = 'position:fixed;left:'+x+'px;top:'+y+'px;width:'+size+'px;height:'+size+'px;background:'+colors[i%colors.length]+';border-radius:'+shape+';pointer-events:none;z-index:99999;transition:transform .9s cubic-bezier(0.2,0.8,0.4,1),opacity .9s;opacity:1';
      document.body.appendChild(el);
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        var rad=angle*Math.PI/180;
        el.style.transform='translate('+(Math.cos(rad)*dist)+'px,'+(Math.sin(rad)*dist - 40)+'px) rotate('+(Math.random()*720-360)+'deg) scale(0)';
        el.style.opacity='0';
        setTimeout(function(){ el.remove(); }, 1000);
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

  // Stagger wave for grids
  var gridObs = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if (!entry.isIntersecting) return;
      var children = entry.target.querySelectorAll('.product-card,.feature-card,.review-card,.blog-card,.nutrition-stat,.about-metric');
      children.forEach(function(child, idx){
        setTimeout(function(){
          child.style.transition='opacity 0.5s ease, transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
          child.style.opacity='1';
          child.style.transform='translateY(0) scale(1)';
        }, idx*80);
      });
      gridObs.unobserve(entry.target);
    });
  }, {threshold:0.05});
  document.querySelectorAll('#productsGrid, .features-grid, .reviews-grid, .blog-grid, .about-metrics, .nutrition-stats').forEach(function(grid){
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
        var start = 0, startTime = null;
        function step(ts) {
          if (!startTime) startTime=ts;
          var p = Math.min((ts-startTime)/1400, 1);
          var eased = 1 - Math.pow(1-p, 3);
          el.textContent = Math.floor(eased*num) + suffix;
          if (p<1) requestAnimationFrame(step); else el.textContent=target;
        }
        requestAnimationFrame(step);
        obs.unobserve(el);
      }
    });
  }, {threshold:0.5});
  document.querySelectorAll('.stat-num').forEach(function(el){ obs.observe(el); });
})();

// ── SCROLL-LINKED PARALLAX ─────────────────────────────────
(function(){
  var hero = document.querySelector('.hero-visual, .hero-product-card');
  if (!hero) return;
  window.addEventListener('scroll', function(){
    var y = window.scrollY;
    hero.style.transform = 'translateY('+(y*0.18)+'px)';
  }, {passive:true});
})();

// ── SHIMMER TEXT ON HEADINGS ───────────────────────────────
(function(){
  var s = document.createElement('style');
  s.textContent = [
    '.shimmer-text{background:linear-gradient(90deg,rgba(255,255,255,0.75) 0%,#fff 42%,#b7e4c7 60%,rgba(255,255,255,0.75) 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:shimmerMove 4s linear infinite;}',
    '@keyframes shimmerMove{0%{background-position:0% center}100%{background-position:200% center}}'
  ].join('');
  document.head.appendChild(s);
  // Apply to first h1/h2 in hero only
  var heroH = document.querySelector('.hero h1, .hero-title');
  if (heroH) {
    heroH.classList.add('shimmer-text');
  }
})();

// ── SECTION ENTRANCE WAVES ─────────────────────────────────
(function(){
  if (!('IntersectionObserver' in window)) return;
  var s = document.createElement('style');
  s.textContent = '.section-wave-in{opacity:0;transform:translateY(32px);transition:opacity 0.65s cubic-bezier(0.4,0,0.2,1),transform 0.65s cubic-bezier(0.4,0,0.2,1);}.section-wave-in.in-view{opacity:1;transform:none;}';
  document.head.appendChild(s);
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, {threshold:0.08});
  document.querySelectorAll('section, .section-header, .hero-badge, .section-tag').forEach(function(el){
    if(!el.classList.contains('hero')){
      el.classList.add('section-wave-in');
      obs.observe(el);
    }
  });
})();

// ── PRODUCT EMOJI PARTICLE BURST ──────────────────────────
(function(){
  document.addEventListener('click', function(e){
    var card = e.target.closest('.product-card');
    if (!card || !e.target.closest('.add-to-cart')) return;
    var emojiEl = card.querySelector('.product-emoji');
    if (!emojiEl) return;
    var emoji = emojiEl.textContent.trim();
    var rect = emojiEl.getBoundingClientRect();
    for(var i=0;i<8;i++){
      (function(i){
        var p = document.createElement('span');
        p.textContent = emoji;
        var angle = (i/8)*360;
        var dist = 60+Math.random()*40;
        var rad = angle*Math.PI/180;
        p.style.cssText = 'position:fixed;left:'+rect.left+'px;top:'+rect.top+'px;font-size:18px;pointer-events:none;z-index:99999;transition:transform 0.7s cubic-bezier(0.2,0.8,0.4,1),opacity 0.7s;';
        document.body.appendChild(p);
        requestAnimationFrame(function(){ requestAnimationFrame(function(){
          p.style.transform='translate('+(Math.cos(rad)*dist)+'px,'+(Math.sin(rad)*dist - 30)+'px) scale(0) rotate('+(Math.random()*360)+'deg)';
          p.style.opacity='0';
          setTimeout(function(){ p.remove(); }, 750);
        }); });
      })(i);
    }
  });
})();

// ── TOAST SUCCESS CELEBRATION ──────────────────────────────
(function(){
  var _origShowToast = window.showToast;
  if(typeof _origShowToast !== 'function') return;
  window.showToast = function(msg){
    _origShowToast(msg);
    var toast = document.getElementById('toast');
    if(!toast) return;
    toast.style.animation = '';
    toast.style.transition = 'none';
    void toast.offsetWidth;
    toast.style.animation = 'toastBounceIn 0.5s cubic-bezier(0.34,1.56,0.64,1)';
  };
  var s = document.createElement('style');
  s.textContent = '@keyframes toastBounceIn{0%{transform:translateX(120%) scale(0.8)}60%{transform:translateX(-8px) scale(1.05)}100%{transform:translateX(0) scale(1)}}';
  document.head.appendChild(s);
})();
