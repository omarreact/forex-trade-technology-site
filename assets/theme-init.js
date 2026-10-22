/* Set the persisted theme before stylesheet loading to avoid a theme flash. */
(()=>{const themes=['current','matchtrade','b2broker','leverate','softfx','uptrader'];let theme='current';try{const saved=localStorage.getItem('forex-theme');if(themes.includes(saved))theme=saved;}catch{}document.documentElement.dataset.theme=theme;})();
