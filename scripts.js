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
  // collect all toggles so mobile and hero controls stay in sync
  var vToggles = Array.prototype.slice.call(document.querySelectorAll('.video-toggle'));
  try{
    var stored = localStorage.getItem('coaster_video_muted');
    if(stored !== null && video){
      video.muted = stored === 'true';
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
