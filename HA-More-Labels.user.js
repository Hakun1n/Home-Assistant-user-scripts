// ==UserScript==
// @name         HA More Labels
// @namespace    https://github.com/Hakun1n/Home-Assistant-user-scripts
// @author       Hakun1n
// @description  Increase visible labels
// @match        *://*/lovelace/*
// @match        *://*/config/*
// @homepage     https://github.com/Hakun1n/Home-Assistant-user-scripts
// @downloadURL  https://raw.githubusercontent.com/Hakun1n/Home-Assistant-user-scripts/refs/heads/main/HA-More-Labels.user.js
// @grant        none
// @version      1.0
// ==/UserScript==

(function () {
  'use strict';

// Here you can define visible labels. 2 is default, more than 10 will likely break the UI.
  let limit = 5;

  function run() {
    const c = customElements.get('ha-data-table-labels');
    if (!c) return;

    const p = c.prototype;
    if (p._done) return;

    const r = p.render;

    p.render = function () {
      if (this.labels && Array.isArray(this.labels)) {
        const orig = this.labels;

        this.labels = new Proxy(orig, {
          get(t, k) {
            if (k === 'slice') {
              return function (s, e) {
                if (s === 0 && e === 2) return t.slice(0, limit);
                if (s === 2 && e === undefined) return t.slice(limit);
                return t.slice(s, e);
              };
            }
            if (k === 'length') return t.length - (limit - 2);
            return t[k];
          }
        });

        let out = r.apply(this, arguments);
        this.labels = orig;
        return out;
      }

      return r.apply(this, arguments);
    };

    p._done = true;
  }

  let i = 0;
  const t = setInterval(() => {
    i++;
    if (customElements.get('ha-data-table-labels')) {
      clearInterval(t);
      run();
    }
    if (i > 50) clearInterval(t);
  }, 200);

})();
