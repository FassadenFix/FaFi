/**
 * Service Worker Registrierung und Offline-Upload-Queue
 * Verwaltet die Registrierung des SW und die IndexedDB-Queue für Offline-Uploads
 */

// ============================================
// Service Worker Registrierung
// ============================================

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    console.warn("[SW] Service Worker nicht unterstützt");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });

    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "activated") {
            console.log("[SW] Neuer Service Worker aktiviert");
          }
        });
      }
    });

    console.log("[SW] Service Worker registriert:", registration.scope);
    return registration;
  } catch (error) {
    console.error("[SW] Registrierung fehlgeschlagen:", error);
    return null;
  }
}

// ============================================
// Offline-Upload-Queue
// ============================================

interface OfflineUpload {
  id?: number;
  blob: Blob;
  filename: string;
  metadata: {
    baustelleId: number;
    kategorie: string;
    seite?: string;
    beschreibung?: string;
    gps?: { lat: number; lng: number };
    timestamp: string;
  };
  createdAt: string;
}

const DB_NAME = "fafi-pm-offline";
const DB_VERSION = 1;
const STORE_NAME = "uploads";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Foto zur Offline-Queue hinzufügen
 */
export async function queueOfflineUpload(upload: Omit<OfflineUpload, "id" | "createdAt">): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add({
      ...upload,
      createdAt: new Date().toISOString(),
    });
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Alle Offline-Uploads abrufen
 */
export async function getOfflineUploads(): Promise<OfflineUpload[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Upload aus Queue entfernen
 */
export async function removeOfflineUpload(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Anzahl der ausstehenden Uploads
 */
export async function getOfflineUploadCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Background Sync triggern
 */
export async function triggerBackgroundSync(): Promise<void> {
  if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
    console.warn("[SW] Background Sync nicht unterstützt");
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  await (registration as any).sync.register("foto-upload");
  console.log("[SW] Background Sync für Foto-Upload registriert");
}

/**
 * Prüft ob der Browser online ist
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Registriert Online/Offline-Event-Listener
 */
export function onConnectionChange(callback: (online: boolean) => void): () => void {
  const onOnline = () => callback(true);
  const onOffline = () => callback(false);
  
  window.addEventListener("online", onOnline);
  window.addEventListener("offline", onOffline);
  
  return () => {
    window.removeEventListener("online", onOnline);
    window.removeEventListener("offline", onOffline);
  };
}
