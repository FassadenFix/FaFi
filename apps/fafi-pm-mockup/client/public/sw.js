/**
 * FaFi PM Service Worker
 * Offline-Fähigkeit für Foto-Upload bei schlechter Verbindung
 * 
 * Strategie:
 * - Cache-First für statische Assets (CSS, JS, Fonts)
 * - Network-First für API-Aufrufe
 * - Background Sync für Foto-Uploads bei Offline
 */

const CACHE_NAME = "fafi-pm-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
];

// ============================================
// Install: Cache statische Assets
// ============================================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ============================================
// Activate: Alte Caches löschen
// ============================================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// ============================================
// Fetch: Strategie je nach Request-Typ
// ============================================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API-Aufrufe: Network-First
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Statische Assets: Cache-First
  event.respondWith(cacheFirst(request));
});

// ============================================
// Background Sync für Foto-Uploads
// ============================================
self.addEventListener("sync", (event) => {
  if (event.tag === "foto-upload") {
    event.waitUntil(processOfflineUploads());
  }
});

// ============================================
// Strategien
// ============================================

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: "Offline – Daten werden synchronisiert sobald Verbindung besteht" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

// ============================================
// Offline-Upload-Queue (IndexedDB)
// ============================================

async function processOfflineUploads() {
  const db = await openDB();
  const tx = db.transaction("uploads", "readonly");
  const store = tx.objectStore("uploads");
  const uploads = await getAllFromStore(store);

  for (const upload of uploads) {
    try {
      const formData = new FormData();
      formData.append("file", upload.blob, upload.filename);
      formData.append("metadata", JSON.stringify(upload.metadata));

      const response = await fetch("/api/trpc/photo.upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (response.ok) {
        // Erfolgreich hochgeladen → aus Queue entfernen
        const deleteTx = db.transaction("uploads", "readwrite");
        deleteTx.objectStore("uploads").delete(upload.id);
      }
    } catch {
      // Noch offline → beim nächsten Sync erneut versuchen
      break;
    }
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("fafi-pm-offline", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("uploads")) {
        db.createObjectStore("uploads", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// Push Notifications (optional)
// ============================================
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "FaFi PM", {
      body: data.body || "",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      tag: data.tag || "fafi-notification",
      data: data.url ? { url: data.url } : undefined,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.notification.data?.url) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    );
  }
});
