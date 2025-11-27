/* eslint-disable no-console */
// Minimal sanity checks for SimpleCache
const SimpleCache = require('./cache');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const cache = new SimpleCache(2); // maxEntries 2

  // 1) Miss before any set
  console.log('GET x (expect null):', cache.get('x'));
  console.log('Stats after miss:', cache.getStats());

  // 2) Put and hit
  cache.set('a', 1, 200); // 200ms TTL
  console.log('GET a (expect 1):', cache.get('a'));
  console.log('Stats after hit:', cache.getStats());

  // 3) Expire
  await sleep(250);
  console.log('GET a after TTL (expect null):', cache.get('a'));
  console.log('Stats after expire miss:', cache.getStats());

  // 4) Eviction by capacity
  cache.set('k1', 'v1', 5000);
  cache.set('k2', 'v2', 5000);
  cache.set('k3', 'v3', 5000); // should evict oldest (k1) if you delete oldest on full
  console.log('GET k1 (likely null due to eviction):', cache.get('k1'));
  console.log('GET k2 (expect v2):', cache.get('k2'));
  console.log('GET k3 (expect v3):', cache.get('k3'));

  // Final stats snapshot
  console.log('Final stats:', JSON.stringify(cache.getStats(), null, 2));
})();