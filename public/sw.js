const CACHE_NAME = "finance-track-v1";
const STATIC_CACHE = "static-cache-v1";
const DYNAMIC_CACHE = "dynamic-cache-v1";

// Arquivos estáticos para cache
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/transactions",
  "/reports",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/favicon-96x96.png",
  "/screenshots/dashboard.png",
  "/screenshots/mobile.png",
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(DYNAMIC_CACHE),
    ])
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Estratégia de cache: Cache First para assets estáticos
self.addEventListener("fetch", (event) => {
  // Ignorar requisições para a API
  if (event.request.url.includes("/api/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Não cachear se não for uma resposta válida
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // Clone a resposta pois ela só pode ser consumida uma vez
        const responseToCache = response.clone();

        // Cache dinâmico para novas requisições
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Push Notifications
self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/web-app-manifest-192x192.png",
      badge: "/favicon-96x96.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "1",
        url: data.url || "/",
      },
      actions: [
        {
          action: "open",
          title: "Abrir",
        },
        {
          action: "close",
          title: "Fechar",
        },
      ],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Interação com Notificações
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Se já existe uma janela aberta, focar nela
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      // Se não existe, abrir uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || "/");
      }
    })
  );
});

// Background Sync para operações offline
self.addEventListener("sync", function (event) {
  if (event.tag === "sync-transactions") {
    event.waitUntil(syncTransactions());
  }
});

// Função para sincronizar transações offline
async function syncTransactions() {
  try {
    const db = await openDB();
    const offlineTransactions = await db.getAll("offlineTransactions");

    for (const transaction of offlineTransactions) {
      try {
        const response = await fetch("/api/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transaction),
        });

        if (response.ok) {
          await db.delete("offlineTransactions", transaction.id);
        }
      } catch (error) {
        console.error("Erro ao sincronizar transação:", error);
      }
    }
  } catch (error) {
    console.error("Erro ao abrir banco de dados:", error);
  }
}

// Função auxiliar para abrir o banco de dados IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("FinanceTrackDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("offlineTransactions")) {
        db.createObjectStore("offlineTransactions", { keyPath: "id" });
      }
    };
  });
}
