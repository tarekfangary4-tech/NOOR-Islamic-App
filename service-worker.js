
"use strict";

const CACHE_NAME = "noor-app-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json",
    "./css/style.css",
    "./js/app.js"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(FILES_TO_CACHE);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (key) {
                    return key !== CACHE_NAME;
                }).map(function (key) {
                    return caches.delete(key);
                })
            );
        })
    );

    self.clients.claim();
});

self.addEventListener("fetch", function (event) {

    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then(function (cachedFile) {

            if (cachedFile) return cachedFile;

            return fetch(event.request).then(function (response) {
                return response;
            }).catch(function () {
                return caches.match("./index.html");
            });

        })
    );

});
