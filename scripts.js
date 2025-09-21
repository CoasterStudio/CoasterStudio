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
});
