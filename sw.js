/* Service worker.
   Estrategia: RED PRIMERO con respaldo en cache (timeout 3.5 s).
   Con señal siempre ves el plan más reciente; sin señal la app abre igual
   desde la cache. Cache-primero dejaría el plan viejo congelado en el
   teléfono cada vez que se publique una versión nueva.

   Clave: todas las peticiones a la red van con cache:'no-store' /
   'reload'. Sin eso, fetch() dentro del worker pasa por la cache HTTP del
   navegador y termina guardando un index.html rancio — que a su vez pide
   archivos que no están en la cache, y la app abre en blanco sin señal. */
const CACHE = 'mmty-v14';
const NET_TIMEOUT = 3500;

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './plan.js',
  './datos.enc.json',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // cache:'reload' → salta la cache HTTP y baja el original de verdad.
      .then(c => c.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function fromNetwork(req) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), NET_TIMEOUT);
    // Se pide por URL con no-store: evita la cache HTTP intermedia.
    fetch(req.url, { cache: 'no-store', credentials: 'same-origin' })
      .then(res => {
        clearTimeout(t);
        if (!res || !res.ok) return reject(new Error('bad status'));
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        resolve(res);
      })
      .catch(err => { clearTimeout(t); reject(err); });
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  const fallback = () =>
    caches.match(req, { ignoreSearch: true }).then(hit =>
      hit || (req.mode === 'navigate' ? caches.match('./index.html') : undefined));

  e.respondWith(
    fromNetwork(req)
      .catch(fallback)
      .then(res => res || fallback())
      .then(res => res || new Response('Sin conexión y sin copia guardada.', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      }))
  );
});
