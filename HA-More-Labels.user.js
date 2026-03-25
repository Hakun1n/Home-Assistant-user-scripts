// ==UserScript==
// @name         HA More Labels
// @namespace    https://github.com/Hakun1n/Home-Assistant-user-scripts
// @author       Hakun1n
// @description  Increase visible labels
// @match        *://*/lovelace/*
// @match        *://*/config/*
// @homepage     https://github.com/Hakun1n/Home-Assistant-user-scripts
// @downloadURL  https://raw.githubusercontent.com/Hakun1n/Home-Assistant-user-scripts/refs/heads/master/HA-More-Labels.user.js
// @grant        none
// @version      1.0
// ==/UserScript==

(function () {
  'use strict';

  // Here you can define visible labels. 2 is default, more than 10 will likely break the UI.
  const LIMIT = 5;

  const patch = () => {
    const el = customElements.get('ha-data-table-labels');
    if (!el) return;

    const proto = el.prototype;
    if (proto.__patched) return;

    const original = proto.render;

    proto.render = function (...args) {
      if (Array.isArray(this.labels)) {
        const orig = this.labels;
        const proxy = new Proxy(orig, {
          get(target, prop) {
            if (prop === 'slice') {
              return (start, end) => {
                if (start === 0 && end === 2) return target.slice(0, LIMIT);
                if (start === 2 && end === undefined) return target.slice(LIMIT);
                return target.slice(start, end);
              };
            }
            if (prop === 'length') {
              return target.length - (LIMIT - 2);
            }
            return target[prop];
          }
        });
        this.labels = proxy;
        const result = original.apply(this, args);
        this.labels = orig;
        return result;
      }
      return original.apply(this, args);
    };
    proto.__patched = true;
    console.log('HA-More-Labels patch applied');
  };
  const wait = setInterval(() => {
    if (customElements.get('ha-data-table-labels')) {
      clearInterval(wait);
      patch();
    }
  }, 200);
})();
