// Mobile nav toggle
document.addEventListener('DOMContentLoaded', function(){
  var nav = document.getElementById('mainNav');
  var toggle = document.getElementById('navToggle');
  toggle && toggle.addEventListener('click', function(){
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
  var vToggle = document.getElementById('videoToggle');
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
    vToggle.addEventListener('click', function(){
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
