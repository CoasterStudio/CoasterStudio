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
    try{ if(localStorage && localStorage.getItem('coaster_debug') === '1') console.log('DEBUG: delegated click on vToggle', btn); }catch(e){}
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
