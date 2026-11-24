export const LANG_STORAGE_KEY = 'portfolio_language';
export const MOTION_STORAGE_KEY = 'portfolio_motion';

/** Inlined in <head>: applies stored/browser language and the motion opt-out before first paint. */
export const BOOT_SCRIPT = `(function(){var d=document.documentElement;try{var s=localStorage.getItem('${LANG_STORAGE_KEY}');d.lang=(s==='en'||s==='tr')?s:((navigator.language||'en').toLowerCase().indexOf('tr')===0?'tr':'en');if(localStorage.getItem('${MOTION_STORAGE_KEY}')==='off')d.setAttribute('data-motion','off');if((localStorage.getItem('portfolio_theme')||'dark')==='dark')d.classList.add('dark');}catch(e){}})();`;
