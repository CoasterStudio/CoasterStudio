// Netlify Function: rolimons-proxy
// Fetches Rolimons game page server-side and extracts players, visits, favorites (heuristic).

const fetch = globalThis.fetch || require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const qs = event.queryStringParameters || {};
    const id = qs.universeId || qs.id;
    if (!id) {
      return { statusCode: 400, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'missing universeId' }) };
    }

    // Try both common Rolimons URL styles: /game?id=<id> and /game/<id>
    const tryUrls = [
      'https://www.rolimons.com/game?id=' + encodeURIComponent(id),
      'https://www.rolimons.com/game/' + encodeURIComponent(id)
    ];

    let text = null;
    let lastErr = null;
    for (const target of tryUrls) {
      try {
        const res = await fetch(target, { headers: { 'User-Agent': 'CoasterStudio/1.0', 'Accept': 'text/html' } });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        text = await res.text();
        if (text && text.length) break;
      } catch (err) { lastErr = err; continue; }
    }
    if (!text) {
      return { statusCode: 502, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: 'failed to fetch rolimons page', detail: String(lastErr) }) };
    }

    // Helpers
    function numFromStr(s) { if (!s) return null; const n = String(s).replace(/[\s,]/g, ''); const v = parseInt(n, 10); return isNaN(v) ? null : v; }
    function numFromMatch(m) { if (!m) return null; return numFromStr(m[1]); }

    // 1) Try to find JSON-like numbers in scripts (e.g., "playing":123)
    function extractFromJsonKeys(keys) {
      for (const k of keys) {
        const re = new RegExp('"' + k + '"\\s*:\\s*([0-9]{1,15})', 'i');
        const m = text.match(re);
        if (m) return parseInt(m[1], 10);
      }
      return null;
    }

    const playersCandidates = ['playing', 'players', 'currentPlayers', 'activePlayers', 'playingCount', 'playerCount'];
    const visitsCandidates = ['visits', 'totalVisits', 'visitCount', 'totalPlayCount'];
    const favCandidates = ['favorites', 'favorited', 'favoriteCount', 'favourites', 'favCount'];

    let players = extractFromJsonKeys(playersCandidates);
    let visits = extractFromJsonKeys(visitsCandidates);
    let favorites = extractFromJsonKeys(favCandidates);

    // 2) Label-based extraction: look for the visible labels and nearby numbers
    if (players == null) {
      players = numFromMatch(text.match(/Players[^\d]{0,120}([0-9,]+)/i)) || numFromMatch(text.match(/Playing[^\d]{0,120}([0-9,]+)/i));
    }
    if (visits == null) {
      visits = numFromMatch(text.match(/Total\s+Visits[^\d]{0,120}([0-9,]+)/i)) || numFromMatch(text.match(/Visits[^\d]{0,120}([0-9,]+)/i));
    }
    if (favorites == null) {
      favorites = numFromMatch(text.match(/Favorites[^\d]{0,120}([0-9,]+)/i)) || numFromMatch(text.match(/Favs[^\d]{0,120}([0-9,]+)/i));
    }

    // 3) Primary Stats panel heuristic: capture the block labeled "Primary Stats" and grab numbers in order
    if (players == null || visits == null || favorites == null) {
      const block = text.match(/Primary\s+Stats[\s\S]{0,1200}/i);
      if (block && block[0]) {
        const nums = Array.from(block[0].matchAll(/([0-9][0-9,]*)/g)).map(m => m[1]);
        if (nums.length) {
          if (players == null) players = numFromStr(nums[0]);
          if (visits == null && nums.length > 1) visits = numFromStr(nums[1]);
          // Favorites often appears later in the grid; try to find a number labeled Favorites nearby
          if (favorites == null) {
            const favMatch = block[0].match(/Favorites[\s\S]{0,120}?([0-9,]+)/i);
            if (favMatch) favorites = numFromStr(favMatch[1]);
            else if (nums.length > 5) favorites = numFromStr(nums[5]);
          }
        }
      }
    }

    // 4) Inline var/object patterns
    if (players == null) {
      let m = text.match(/\bplaying\s*[:=]\s*([0-9,]+)/i) || text.match(/\bplayers\s*[:=]\s*([0-9,]+)/i) || text.match(/playerCount\s*[:=]\s*([0-9,]+)/i);
      players = numFromMatch(m);
    }

    // Extra optional stats: upvotes, downvotes, rating
    let upvotes = null, downvotes = null, rating = null;
    const upMatch = text.match(/Upvotes[^\d]{0,120}([0-9,]+)/i) || text.match(/Upvote[s]?[^\d]{0,120}([0-9,]+)/i);
    if (upMatch) upvotes = numFromMatch(upMatch);
    const downMatch = text.match(/Downvotes[^\d]{0,120}([0-9,]+)/i) || text.match(/Downvote[s]?[^\d]{0,120}([0-9,]+)/i);
    if (downMatch) downvotes = numFromMatch(downMatch);
    const ratingMatch = text.match(/Rating[^\d\n]{0,120}([0-9]{1,3}\.?[0-9]{0,3}%?)/i) || text.match(/Rating[^\d\n]{0,120}([0-9,.%]+)/i);
    if (ratingMatch) rating = (ratingMatch[1] || null);

    const out = { universeId: String(id), players: players, visits: visits, favorites: favorites, upvotes: upvotes, downvotes: downvotes, rating: rating, source: 'rolimons' };
    return { statusCode: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(out) };
  } catch (err) {
    return { statusCode: 500, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: String(err) }) };
  }
};