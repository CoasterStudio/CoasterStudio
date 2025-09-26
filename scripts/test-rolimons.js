const fetch = require('node-fetch');
(async function(){
  try{
    const res = await fetch('https://www.rolimons.com/game/17152219682', { headers: { 'User-Agent': 'CoasterStudio-Test/1.0', 'Accept': 'text/html' } });
    console.log('HTTP', res.status);
    const text = await res.text();
    // Quick extract players using a simple regex mirroring the function
    const m = text.match(/Players[^\d]{0,120}([0-9,]+)/i) || text.match(/Playing[^\d]{0,120}([0-9,]+)/i);
    console.log('players match:', m && m[1]);
  }catch(e){ console.error('error', e); }
})();
