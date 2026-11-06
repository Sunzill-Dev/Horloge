// Service worker minimal : permet l'installation comme application et le fonctionnement hors ligne.
// Stratégie « réseau d'abord » : la dernière version publiée est toujours utilisée quand le réseau est là.
const CACHE = "horloge-outremer-v3";
const FICHIERS = ["./", "index.html", "manifest.webmanifest", "icon.svg"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  // On ne touche pas aux requêtes de synchronisation de l'heure (HEAD) ni aux autres domaines.
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then(rep => {
        if (rep.ok) { const copie = rep.clone(); caches.open(CACHE).then(c => c.put(req, copie)); }
        return rep;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
