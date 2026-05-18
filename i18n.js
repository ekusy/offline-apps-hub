(function () {
  'use strict';

  var STORAGE_KEY = 'hub-lang';
  var SUPPORTED = ['ja', 'en'];
  var store = { ja: {}, en: {} };

  function detectInitial() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (e) {}
    var nav = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return nav.indexOf('ja') === 0 ? 'ja' : 'en';
  }

  var currentLang = detectInitial();
  document.documentElement.lang = currentLang;

  function deepMerge(target, source) {
    Object.keys(source).forEach(function (k) {
      var sv = source[k];
      if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
        if (!target[k] || typeof target[k] !== 'object') target[k] = {};
        deepMerge(target[k], sv);
      } else {
        target[k] = sv;
      }
    });
  }

  function lookup(lang, key) {
    var parts = key.split('.');
    var node = store[lang];
    for (var i = 0; i < parts.length; i++) {
      if (node == null || typeof node !== 'object') return undefined;
      node = node[parts[i]];
    }
    return typeof node === 'string' ? node : undefined;
  }

  function t(key, fallback) {
    var v = lookup(currentLang, key);
    if (v != null) return v;
    var other = currentLang === 'ja' ? 'en' : 'ja';
    v = lookup(other, key);
    if (v != null) return v;
    if (fallback != null) return fallback;
    return key;
  }

  function register(dict) {
    if (!dict) return;
    if (dict.ja) deepMerge(store.ja, dict.ja);
    if (dict.en) deepMerge(store.en, dict.en);
  }

  function applyAttr(el) {
    var spec = el.getAttribute('data-i18n-attr');
    if (!spec) return;
    spec.split(';').forEach(function (pair) {
      var p = pair.trim();
      if (!p) return;
      var idx = p.indexOf(':');
      if (idx <= 0) return;
      var attr = p.slice(0, idx).trim();
      var key = p.slice(idx + 1).trim();
      el.setAttribute(attr, t(key));
    });
  }

  function apply(root) {
    root = root || document;
    var nodes = root.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute('data-i18n'));
    }
    var html = root.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < html.length; j++) {
      html[j].innerHTML = t(html[j].getAttribute('data-i18n-html'));
    }
    var attrs = root.querySelectorAll('[data-i18n-attr]');
    for (var k = 0; k < attrs.length; k++) {
      applyAttr(attrs[k]);
    }
    // Allow root itself to be a translatable element
    if (root.nodeType === 1) {
      if (root.hasAttribute && root.hasAttribute('data-i18n')) {
        root.textContent = t(root.getAttribute('data-i18n'));
      }
    }
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) return;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.documentElement.lang = lang;
    apply();
    window.dispatchEvent(new CustomEvent('i18nchange', { detail: { lang: lang } }));
  }

  function toggle() {
    setLang(currentLang === 'ja' ? 'en' : 'ja');
  }

  function refreshToggleButton(btn) {
    btn.textContent = currentLang === 'ja' ? 'EN' : '日本語';
    btn.setAttribute('aria-label', currentLang === 'ja' ? 'Switch to English' : '日本語に切り替え');
  }

  function mountToggle(btn) {
    if (!btn || btn.dataset.i18nToggleMounted) return;
    btn.dataset.i18nToggleMounted = '1';
    refreshToggleButton(btn);
    btn.addEventListener('click', function () { toggle(); });
    window.addEventListener('i18nchange', function () { refreshToggleButton(btn); });
  }

  window.I18n = {
    getLang: function () { return currentLang; },
    setLang: setLang,
    toggle: toggle,
    register: register,
    t: t,
    apply: apply,
    mountToggle: mountToggle
  };
})();
