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
  // prefer the mobile topbar toggle if present, fallback to hero toggle
  var vToggle = document.querySelector('.mobile-topbar #videoToggle') || document.getElementById('videoToggle') || document.getElementById('videoToggleHero');
  try{
    var stored = localStorage.getItem('coaster_video_muted');
    if(stored !== null && video){
      video.muted = stored === 'true';
    }
  }catch(e){/* ignore storage errors */}

  function updateButton(){
    if(!vToggle || !video) return;
    var muted = !!video.muted;
    vToggle.setAttribute('aria-pressed', String(muted));
    vToggle.setAttribute('aria-label', muted ? 'Unmute background video' : 'Mute background video');
    vToggle.textContent = muted ? '🔇' : '🔊';
  }

  if(vToggle){
  // debug: indicate handler attached
  try{ if(localStorage && localStorage.getItem('coaster_debug') === '1') console.log('DEBUG: vToggle handler attached to', vToggle); }catch(e){}
  vToggle.addEventListener('click', function(e){
      // debug helper: if enabled, log the element under the click point
      try{
        if(localStorage && localStorage.getItem('coaster_debug') === '1'){
          var elAt = document.elementFromPoint(e.clientX, e.clientY);
      console.log('DEBUG: click on vToggle at', e.clientX, e.clientY, 'elementFromPoint =>', elAt, 'computedStyle:', elAt && window.getComputedStyle ? window.getComputedStyle(elAt) : null);
        }
      }catch(err){}
      if(!video) return;
      video.muted = !video.muted;
      try{ localStorage.setItem('coaster_video_muted', String(video.muted)); }catch(e){}
  updateButton();
  // animation: briefly add class then remove
  vToggle.classList.add('toggled');
  setTimeout(function(){ vToggle.classList.remove('toggled'); }, 260);
    });
  }
  updateButton();
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
