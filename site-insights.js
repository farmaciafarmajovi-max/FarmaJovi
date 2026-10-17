(() => {
  'use strict';
  const API = 'https://bwytvofvxbkdntsoipmf.supabase.co/rest/v1/chat_interactions';
  const KEY = 'sb_publishable_vAgutfClE7NUInmPJEaSYg_-o6-KMIT';
  const suppressed = () => { if(new URLSearchParams(location.search).get('fj_preview')==='1')return true; try { return localStorage.getItem('fj-exclude-tests') === '1'; } catch { return false; } };
  const log = async question => {
    if (suppressed() || navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
    try {
      const response = await fetch(API, {method:'POST', keepalive:true, headers:{apikey:KEY, Authorization:'Bearer '+KEY, 'Content-Type':'application/json', Prefer:'return=minimal'}, body:JSON.stringify({question})});
      if (!response.ok) console.warn('FarmaJovi: no se pudo registrar la interacción.');
    } catch { /* La medición nunca bloquea el sitio. */ }
  };
  const source = () => {
    const tags = new URLSearchParams(location.search);
    const tagged = (tags.get('utm_source') || '').toLowerCase();
    if (/instagram|facebook|google|bing/.test(tagged)) return tagged.match(/instagram|facebook|google|bing/)[0];
    let host = ''; try { host = new URL(document.referrer).hostname; } catch {}
    if (!host || host === location.hostname) return 'directo';
    if (/instagram\.com$/.test(host)) return 'instagram';
    if (/facebook\.com$/.test(host)) return 'facebook';
    if (/(^|\.)google\./.test(host)) return 'google';
    if (/(^|\.)bing\.com$/.test(host)) return 'bing';
    return 'otros';
  };
  const page = location.pathname.endsWith('/noticia.html') ? 'noticia' : 'inicio';
  const device = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'movil' : 'computador';
  // Sesión aleatoria y temporal; no se envían IP, correo, URL de origen ni preguntas del chat.
  const session = (() => {
    try {
      const previous = JSON.parse(sessionStorage.getItem('fj-session-v2') || 'null');
      const next = previous && Date.now()-previous.at < 30*60*1000 ? previous : {id:crypto.randomUUID(),at:Date.now()};
      next.at=Date.now(); sessionStorage.setItem('fj-session-v2',JSON.stringify(next)); return next.id;
    } catch { return ''; }
  })();
  const visit = new URLSearchParams({page,source:source(),device});
  if (session) visit.set('session',session);
  log('v2|view|'+visit.toString());
  let lastQuery='', lastAt=0;
  const price = () => {
    const input = document.getElementById('precioInputFijo');
    const query = (input?.value || '').trim().toLocaleLowerCase('es-CL').replace(/\s+/g,' ').slice(0,80);
    if (!query || (query===lastQuery && Date.now()-lastAt<1000)) return;
    lastQuery=query;lastAt=Date.now();log('price:search');log('keyword:'+query);
  };
  document.addEventListener('click', event => {
    const target = event.target.closest('a,button'); if (!target) return;
    if (target.id==='buscarPrecioFijo') price();
    if (target.id==='sernacComparatorLink') log('v2|sernac_comparator');
    if (target.id==='installAppBtn') log('v2|install_click');
    if (target.matches('a')) {
      let url; try { url=new URL(target.href,location.href); } catch { return; }
      if (url.hostname==='wa.me' || url.hostname.endsWith('.whatsapp.com')) log('click:whatsapp');
      else if (url.pathname.includes('LISTADO-PRECIOS-FARMAJOVI')) log('v2|price_list');
      else if (url.pathname.endsWith('/noticia.html')) log('v2|news_open');
      else if (url.hostname==='www.instagram.com' || url.hostname==='instagram.com') log('v2|instagram');
    }
    if (target.classList.contains('newsReadRetry') && target.textContent.includes('Leer')) log('v2|news_open');
  },true);
  document.addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target.id==='precioInputFijo')price();},true);
  document.addEventListener('submit',event=>{
    if(event.target.id!=='chatForm')return;
    const query=(document.getElementById('chatInput')?.value||'').trim();if(!query)return;
    const category=/precio|cu[aá]nto|valor/i.test(query)?'precio':/stock|disponib|tienen/i.test(query)?'stock':/direcci[oó]n|ubicaci[oó]n|d[oó]nde/i.test(query)?'ubicacion':'general';
    log('chat:'+category);
  },true);
  window.addEventListener('appinstalled',()=>log('v2|installed'));
})();

