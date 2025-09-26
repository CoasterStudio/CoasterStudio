const fetch = require('node-fetch');
(async ()=>{
  const url = 'http://localhost:8888/.netlify/functions/rolimons-proxy?universeId=17152219682';
  for(let i=0;i<30;i++){
    try{
      console.log('attempt', i+1, 'fetching', url);
      const res = await fetch(url);
      console.log('HTTP', res.status);
      const txt = await res.text();
      try{ console.log(JSON.stringify(JSON.parse(txt), null, 2)); }catch(e){ console.log(txt); }
      process.exit(0);
    }catch(err){
      console.error('not ready yet:', err.message || err);
      await new Promise(r=>setTimeout(r,1000));
    }
  }
  console.error('failed to reach local function after retries');
  process.exit(1);
})();
