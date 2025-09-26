// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function(){
  var nav = document.getElementById('mainNav');
  var toggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  toggle && toggle.addEventListener('click', function(){
    // if a mobile nav exists, toggle it instead of the desktop nav
    if(mobileNav){
      var isOpen = mobileNav.classList.toggle('open');
      mobileNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', String(isOpen));
      return;
    }
    if(nav.style.display === 'block'){
      nav.style.display = '';
    } else {
      nav.style.display = 'block';
    }
  });

  // Simple entrance animations
  var left = document.querySelector('.hero-left');
  if(left){
    left.style.opacity = 0;
    left.style.transform = 'translateY(8px)';
    setTimeout(function(){
      left.style.transition = 'opacity 600ms ease, transform 600ms ease';
      left.style.opacity = 1;
      left.style.transform = 'translateY(0)';
    }, 120);
  }

  // Video mute/unmute toggle with persistence
  var video = document.querySelector('.hero-video');
  var vLoader = document.querySelector('.video-loader');
  // collect all toggles so mobile and hero controls stay in sync
  var vToggles = Array.prototype.slice.call(document.querySelectorAll('.video-toggle'));
  // Autoplay policies block unmuted autoplay in many browsers.
  // Start the video muted to allow autoplay, but remember the user's preference.
  var desiredUnmute = false;
  try{
    var stored = localStorage.getItem('coaster_video_muted');
    if(video){
      // Default to muted so autoplay is allowed
      video.muted = true;
      if(stored === 'true'){
        // user previously chose muted: keep muted
        video.muted = true;
      } else if(stored === 'false'){
        // user previously chose unmuted: don't unmute automatically (requires gesture)
        desiredUnmute = true;
      }
    }
  }catch(e){/* ignore storage errors */}

  function updateAllToggles(){
    if(!video) return;
    var muted = !!video.muted;
    vToggles.forEach(function(btn){
      try{
        btn.setAttribute('aria-pressed', String(muted));
        btn.setAttribute('aria-label', muted ? 'Unmute background video' : 'Mute background video');
        btn.textContent = muted ? '🔇' : '🔊';
      }catch(e){}
    });
  }

  // Delegate clicks for .video-toggle to ensure handler always runs
  document.addEventListener('click', function(e){
  var btn = e.target && e.target.closest ? e.target.closest('.video-toggle') : null;
  if(!btn) return;
    // prevent default and stop immediate handling
    e.preventDefault();
    if(!video) return;
    video.muted = !video.muted;
    try{ localStorage.setItem('coaster_video_muted', String(video.muted)); }catch(e){}
    updateAllToggles();
    // animation: briefly add class then remove on the clicked button
    btn.classList.add('toggled');
    setTimeout(function(){ btn.classList.remove('toggled'); }, 260);
  });

  // initialize toggles from stored state
  updateAllToggles();

  // Try to start playback (will succeed if autoplay is allowed while muted)
  try{ if(video && video.play) video.play().catch(function(){/* autoplay blocked - waiting for user gesture */}); }catch(e){}

  // Video loader handling: hide when video can play, or fallback after timeout
  (function(){
    if(!vLoader || !video) return;
    var hide = function(){ if(!vLoader.classList.contains('hidden')) vLoader.classList.add('hidden'); };
    var onCan = function(){ try{ hide(); video.removeEventListener('canplay', onCan); }catch(e){} };
    video.addEventListener('canplay', onCan);
    // also listen for loadeddata as an earlier signal
    video.addEventListener('loadeddata', onCan);
    // fallback: hide after 6s to avoid stuck loader
    setTimeout(hide, 6000);
    // video error handling: show a small message and attempt one reload
    var vErrorEl = document.createElement('div');
    vErrorEl.className = 'video-error';
    vErrorEl.textContent = 'Background video failed to load. Click to retry.';
    vErrorEl.tabIndex = 0;
    vErrorEl.addEventListener('click', function(){ try{ video.load(); video.play(); vErrorEl.classList.remove('show'); }catch(e){} });
    document.body.appendChild(vErrorEl);
    var triedReload = false;
    video.addEventListener('error', function(){
      try{ vErrorEl.classList.add('show'); }catch(e){}
      // attempt one automated reload after 1s
      if(!triedReload){
        triedReload = true;
        setTimeout(function(){ try{ video.load(); video.play(); }catch(e){} }, 1000);
      }
    });
  })();
});

// Staggered entrance for stats when scrolled into view (respects reduced motion)
(function(){
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var container = document.querySelector('.stats-inner');
  if(!container) return;
  var stats = container.querySelectorAll('.stat');
  function reveal(){
    stats.forEach(function(el, idx){
      if(prefersReduced){ el.classList.add('visible'); return; }
      setTimeout(function(){ el.classList.add('visible'); }, 160 + 160 * idx);
    });
  }

  if(prefersReduced){ reveal(); return; }

  try{
    var io = new IntersectionObserver(function(entries, obs){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          reveal();
          obs.disconnect();
        }
      });
    }, {threshold: 0.25});
    io.observe(container);
  }catch(e){
    // fallback
    reveal();
  }
})();

// Featured page: populate stats using Rolimons only (no Roblox API calls)
(function(){
  if(!document.querySelector) return;
  var cards = Array.from(document.querySelectorAll('.game-card[data-universe-id]'));
  if(!cards.length) return;

  function fmt(n){ if(n==null) return '—'; return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  async function fetchJson(url, opts){
    var controller = new AbortController();
    var id = setTimeout(function(){ controller.abort(); }, 8000);
    try{
      var res = await fetch(url, Object.assign({}, opts || {}, { signal: controller.signal }));
      clearTimeout(id);
      if(!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    }catch(err){ clearTimeout(id); throw err; }
  }

  function updateCard(universeId, data){
    var card = document.querySelector('.game-card[data-universe-id="' + universeId + '"]');
    if(!card) return;
    var liveEl = card.querySelector('.players-live');
    var totalEl = card.querySelector('.players-total');
    var favEl = card.querySelector('.players-favorites');
    if(liveEl) liveEl.textContent = data.players != null ? fmt(data.players) : (data.playing != null ? fmt(data.playing) : '—');
    if(totalEl) totalEl.textContent = data.visits != null ? fmt(data.visits) : (data.totalVisits != null ? fmt(data.totalVisits) : '—');
    if(favEl) favEl.textContent = data.favorites != null ? fmt(data.favorites) : (data.favorited != null ? fmt(data.favorited) : '—');
  }

  async function tryRolimonsProxy(universeId){
    try{
      var url = '/.netlify/functions/rolimons-proxy?universeId=' + encodeURIComponent(universeId);
      var json = await fetchJson(url);
      if(json && (json.players != null || json.visits != null || json.favorites != null)){
        return json;
      }
    }catch(e){/* ignore */}
    return null;
  }

  (async function(){
    var universeIds = cards.map(function(c){ return c.getAttribute('data-universe-id'); }).filter(Boolean);
    // loading state
    cards.forEach(function(card){ var liveEl = card.querySelector('.players-live'); if(liveEl) liveEl.textContent = 'Loading...'; var totalEl = card.querySelector('.players-total'); if(totalEl) totalEl.textContent = 'Loading...'; var favEl = card.querySelector('.players-favorites'); if(favEl) favEl.textContent = 'Loading...'; });

    var any = false;
    for(var i=0;i<universeIds.length;i++){
      var id = universeIds[i];
      try{
        var data = await tryRolimonsProxy(id);
        if(data){ updateCard(id, data); any = true; }
      }catch(e){ /* ignore per-id errors */ }
    }
    if(!any){
      // nothing available, show placeholders
      cards.forEach(function(card){ var liveEl = card.querySelector('.players-live'); if(liveEl) liveEl.textContent = '—'; var totalEl = card.querySelector('.players-total'); if(totalEl) totalEl.textContent = '—'; var favEl = card.querySelector('.players-favorites'); if(favEl) favEl.textContent = '—'; });
    }
  })();

})();

    // News expand/collapse behavior
    (function(){
      var newsToggles = document.querySelectorAll('.news-toggle');
      if(newsToggles && newsToggles.length){
        newsToggles.forEach(function(btn){
          btn.addEventListener('click', function(){
            var expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', expanded ? 'false' : 'true');
            var body = this.nextElementSibling;
            if(!body) return;
            if(expanded){
              body.hidden = true;
            } else {
              body.hidden = false;
            }
          });
        });

        // Optional: simple rotator for headlines (non-intrusive)
        try{
          var rotatorIndex = 0;
          var headlineButtons = Array.from(newsToggles);
          if(headlineButtons.length > 1){
            setInterval(function(){
              var prev = headlineButtons[rotatorIndex % headlineButtons.length];
              prev.setAttribute('aria-expanded','false');
              var prevBody = prev.nextElementSibling; if(prevBody) prevBody.hidden = true;
              rotatorIndex++;
              var next = headlineButtons[rotatorIndex % headlineButtons.length];
              next.setAttribute('aria-expanded','true');
              var nextBody = next.nextElementSibling; if(nextBody) nextBody.hidden = false;
            }, 8000);
          }
        }catch(e){console.warn('news rotator error', e)}
      }
    })();
