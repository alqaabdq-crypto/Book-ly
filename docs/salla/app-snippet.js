// Book-ly "احجز موعدك" button for Salla storefronts.
//
// Paste into the App Snippet editor of the Book-ly app in the Salla Partners
// portal (JavaScript only; Salla injects it into <body> of every store that
// installs the app). Replace BOOKLY_ORIGIN with the live Book-ly domain first.
//
// It asks Book-ly for the store's booking page and shows the button only when
// the store is linked to an approved salon, so an unlinked store shows nothing.
(function () {
  var BOOKLY_ORIGIN = "https://book-ly-peach.vercel.app";

  function storeId() {
    try {
      // Salla documents reading store values with salla.config.get(); the exact
      // key for the store id is not published, so try both known shapes.
      var id = window.salla && salla.config && salla.config.get("store.id");
      if (!id && window.salla && salla.config) {
        var store = salla.config.get("store");
        id = store && store.id;
      }
      return id ? String(id) : null;
    } catch (e) {
      return null;
    }
  }

  function show(url, lang) {
    if (document.getElementById("bookly-book-now")) return;
    var a = document.createElement("a");
    a.id = "bookly-book-now";
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = lang === "en" ? "Book now" : "احجز موعدك";
    a.style.cssText =
      "position:fixed;bottom:20px;inset-inline-start:20px;z-index:9999;" +
      "background:#b6d94a;color:#0a0b07;font:600 15px/1 system-ui,sans-serif;" +
      "padding:14px 22px;border-radius:999px;text-decoration:none;" +
      "box-shadow:0 8px 24px rgba(0,0,0,.25)";
    document.body.appendChild(a);
  }

  function run() {
    var id = storeId();
    if (!id) return;
    var lang = (document.documentElement.lang || "ar").slice(0, 2) === "en" ? "en" : "ar";
    fetch(BOOKLY_ORIGIN + "/api/salla/booking-link?store=" + encodeURIComponent(id) + "&lang=" + lang)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { if (d && d.url) show(d.url, lang); })
      .catch(function () {});
  }

  if (window.salla && salla.onReady) salla.onReady(run);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
  else run();
})();
