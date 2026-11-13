/* UI, published news and duty pharmacies. Catalog and analytics retain their own modules. */
(() => {
  'use strict';
  const paths = {
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    pin:'<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    pill:'<path d="m9.5 4.5-5 5a7.1 7.1 0 0 0 10 10l5-5a7.1 7.1 0 0 0-10-10Z"/><path d="m7 7 10 10"/>',
    cross:'<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
    check:'<path d="m5 12 4 4L19 6"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    phone:'<path d="m5 3 4 1 1 4-2 2a14 14 0 0 0 6 6l2-2 4 1 1 4c-1 3-6 3-11-1S1 7 5 3Z"/>',
    chat:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 2v-9.5A8.5 8.5 0 1 1 21 11.5Z"/><path d="M7 10h10m-10 4h6"/>',
    instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>'
  };
  const icon = name => '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(paths[name]||paths.info)+'</svg>';
  document.querySelectorAll('[data-icon]').forEach(el => {el.innerHTML=icon(el.dataset.icon);});
  const menu = document.querySelector('.menu-toggle');
  const nav = document.getElementById('mainNav');
  const closeMenu = () => {nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Abrir menú');};
  menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('is-open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');});
  nav.addEventListener('click',event=>{if(event.target.closest('a'))closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){if(nav.classList.contains('is-open')){closeMenu();menu.focus();}closeChat();}});
  const observer = new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;nav.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});});},{rootMargin:'-20% 0px -60% 0px'});
  ['servicios','precios','noticias','turnos'].forEach(id=>observer.observe(document.getElementById(id)));

  const chat = document.getElementById('chatbox'), chatButton = document.getElementById('chatBtn');
  function syncChat(){const open=chat.classList.contains('open');chat.inert=!open;chatButton.setAttribute('aria-expanded',String(open));chatButton.setAttribute('aria-label',open?'Cerrar asistente FarmaJovi':'Abrir asistente FarmaJovi');if(open)document.getElementById('chatInput').focus();}
  function closeChat(){if(chat.classList.contains('open')){chat.classList.remove('open');syncChat();chatButton.focus();}}
  chatButton.addEventListener('click',syncChat);
  document.getElementById('closeChat').addEventListener('click',closeChat);

  const text = (tag,value,className) => {const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;};
  const safeUrl = value => {try{const u=new URL(value);return /^https?:$/.test(u.protocol)?u.href:null;}catch{return null;}};
  const link = (label,href,className='text-link') => {const el=text('a',label,className);el.href=href;el.target='_blank';el.rel='noopener noreferrer';return el;};
  const getJSON = async (url,options={}) => {const response=await fetch(url,{...options,cache:'no-store',signal:AbortSignal.timeout(14000)});if(!response.ok)throw Error('HTTP '+response.status);return response.json();};

  // News continues to read the same published records edited in the administrative panel.
  async function loadNews(){
    const grid=document.getElementById('newsGrid');
    grid.setAttribute('aria-busy','true');
    try{
      const rows=await getJSON('https://bwytvofvxbkdntsoipmf.supabase.co/rest/v1/news?select=id,created_at,title,excerpt,body,image_url,instagram_url,source_url&published=is.true&order=created_at.desc&limit=6',{headers:{apikey:'sb_publishable_vAgutfClE7NUInmPJEaSYg_-o6-KMIT'}});
      if(!Array.isArray(rows))throw Error('Invalid news response');
      grid.replaceChildren();
      if(!rows.length){grid.append(text('p','Pronto compartiremos nuevas noticias para nuestra comunidad.','newsEmpty'));return;}
      rows.forEach(n=>{
        const card=document.createElement('article');card.className='newsCard';
        const cover=safeUrl(n.image_url);if(cover){const image=document.createElement('img');image.className='newsCover';image.src=cover;image.alt=n.title||'Noticia FarmaJovi';image.loading='lazy';image.addEventListener('error',()=>image.remove(),{once:true});card.append(image);}
        const body=document.createElement('div');body.className='newsCard__body';
        const meta=document.createElement('div');meta.className='newsMeta';
        const date=new Date(n.created_at);const dateText=Number.isNaN(date.getTime())?'':date.toLocaleDateString('es-CL',{timeZone:'America/Santiago',day:'numeric',month:'short',year:'numeric'});
        meta.append(text('span','FARMAJOVI','newsTag'),text('span',dateText,'newsDate'));
        body.append(meta,text('h3',n.title||'Noticia'),text('p',n.excerpt||''));
        const detail=text('div',n.body||n.excerpt||'Consulta el detalle en la fuente oficial.','newsDetail');detail.hidden=true;detail.id='news-detail-'+n.id;
        const actions=document.createElement('div');actions.className='newsActions';
        const read=text('button','Leer noticia','btn soft newsReadRetry');read.type='button';read.setAttribute('aria-expanded','false');read.setAttribute('aria-controls',detail.id);
        read.addEventListener('click',()=>{detail.hidden=!detail.hidden;read.textContent=detail.hidden?'Leer noticia':'Ocultar noticia';read.setAttribute('aria-expanded',String(!detail.hidden));});
        const article=text('a','Abrir y compartir ↗','btn outline');article.href='noticia.html?id='+encodeURIComponent(n.id);
        actions.append(read,article);
        body.append(detail,actions);
        const sources=document.createElement('div');sources.className='officialLinks';
        for(const [label,url] of [['Fuente oficial ↗',n.source_url],['Instagram ↗',n.instagram_url]]){const safe=safeUrl(url);if(safe)sources.append(link(label,safe));}
        if(sources.children.length)body.append(sources);
        card.append(body);grid.append(card);
      });
    }catch{
      const error=text('div','No pudimos cargar las noticias en este momento.','newsEmpty');
      const retry=text('button','Volver a intentar','retry-button');retry.type='button';retry.addEventListener('click',loadNews);error.append(retry);grid.replaceChildren(error);
    }finally{grid.setAttribute('aria-busy','false');}
  }
  loadNews();

  // A single Farmanet loader replaces the former competing render/filter scripts.
  let pharmacies=[],selectedCity='all';
  const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const val=(row,...keys)=>{for(const key of keys){if(row[key]!=null&&String(row[key]).trim())return String(row[key]).trim();}return '';};
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const grid=document.getElementById('turnosLiveGrid');
  const emptyTurnos = message => {const p=text('p',message+' ','turnosEmpty');p.append(link('Consultar fuente oficial ↗','https://seremienlinea.minsal.cl/asdigital/index.php?mfarmacias'));grid.replaceChildren(p);};
  function renderTurnos(){
    const rows=pharmacies.filter(row=>selectedCity==='all'||norm(val(row,'comuna_nombre','comuna'))===selectedCity);
    grid.replaceChildren();
    if(!rows.length){emptyTurnos('No hay registros vigentes para esta comuna en la respuesta de Farmanet. Confirma en el buscador oficial.');return;}
    rows.forEach(row=>{
      const card=document.createElement('article');card.className='turnoCard';
      const heading=document.createElement('div');heading.className='turnoTop';heading.append(text('h3',val(row,'local_nombre','nombre')||'Farmacia'),text('span','De turno','turnoStatus'));
      const city=val(row,'comuna_nombre','comuna'),address=val(row,'local_direccion','direccion'),phone=val(row,'local_telefono','telefono');
      const maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent([address,city].filter(Boolean).join(', '));
      const content=document.createElement('div');content.className='turnoBody';
      const meta=(name,label,value)=>{const item=document.createElement('div');item.className='turnoMeta';const pic=document.createElement('span');pic.className='line-icon';pic.setAttribute('aria-hidden','true');pic.innerHTML=icon(name);const copy=document.createElement('span');copy.append(text('b',label),document.createElement('br'),document.createTextNode(value));item.append(pic,copy);return item;};
      const opening=val(row,'funcionamiento_hora_apertura','hora_apertura'),closing=val(row,'funcionamiento_hora_cierre','hora_cierre');
      const hour=value=>/^\d{2}:\d{2}/.test(value)?value.slice(0,5):value;
      content.append(meta('pin',city,address||'Dirección no publicada'),meta('clock','Horario de turno',opening&&closing?hour(opening)+' — '+hour(closing)+' hrs':'Consultar horario en la fuente oficial'));
      if(phone)content.append(meta('phone','Teléfono',phone));
      content.append(text('small','Fecha del registro: '+val(row,'fecha')));
      const actions=document.createElement('div');actions.className='turnoActions';
      if(phone){const tel=text('a','Llamar','btn primary');tel.href='tel:'+phone.replace(/[^\d+]/g,'');actions.append(tel);}
      actions.append(link('Cómo llegar ↗',maps,'btn '+(phone?'soft':'primary')));
      card.append(heading,content,actions);grid.append(card);
    });
  }
  document.querySelector('.turnosFilters').addEventListener('click',event=>{const button=event.target.closest('[data-city]');if(!button)return;selectedCity=button.dataset.city;document.querySelectorAll('.turnosFilter').forEach(el=>{el.classList.toggle('active',el===button);el.setAttribute('aria-pressed',String(el===button));});renderTurnos();});
  async function loadTurnos(){
    const source=document.querySelector('.turnosSource');grid.setAttribute('aria-busy','true');
    try{
      const data=await getJSON('https://midas.minsal.cl/farmacia_v2/WS/getLocalesTurnos.php');
      const rows=Array.isArray(data)?data:(data.data||data.results||[]);
      if(!Array.isArray(rows))throw Error('Invalid duty response');
      const local=rows.filter(row=>['la serena','coquimbo'].includes(norm(val(row,'comuna_nombre','comuna'))));
      pharmacies=local.filter(row=>val(row,'fecha').slice(0,10)===today());
      renderTurnos();
      source.textContent=pharmacies.length?'Consultado en Farmanet · '+new Date().toLocaleTimeString('es-CL',{timeZone:'America/Santiago',hour:'2-digit',minute:'2-digit'}):'Farmanet no devolvió registros con fecha de hoy para estas comunas.';
    }catch{pharmacies=[];source.textContent='No fue posible verificar los turnos en vivo.';emptyTurnos('La conexión a Farmanet no está disponible. Consulta los turnos actualizados directamente en el canal oficial.');}
    finally{grid.setAttribute('aria-busy','false');}
  }
  loadTurnos();

  // Keep real browser installation; never pretend a web app is an executable download.
  let deferred=null;
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const help=()=>{
    let dialog=document.getElementById('installAppHelp');
    if(!dialog){dialog=document.createElement('dialog');dialog.id='installAppHelp';dialog.className='install-dialog';dialog.setAttribute('aria-labelledby','installTitle');dialog.innerHTML='<h2 id="installTitle">Lleva FarmaJovi contigo.</h2><p>En Chrome o Edge en computador: abre el menú de tres puntos y selecciona «Instalar FarmaJovi» o «Instalar esta página como aplicación».</p><p>En Android: en el menú de Chrome, selecciona «Instalar aplicación» o «Añadir a pantalla de inicio».</p><p>En iPhone o iPad: abre esta página en Safari, pulsa Compartir y luego «Añadir a pantalla de inicio».</p><p>Si ya la instalaste, ábrela desde tus aplicaciones.</p><form method="dialog"><button class="btn primary">Entendido</button></form>';document.body.append(dialog);}
    if(!dialog.open)dialog.showModal();
  };
  if(!standalone()){
    const button=text('button','Instalar app','btn install-btn');button.type='button';button.id='installAppBtn';
    button.addEventListener('click',async()=>{if(deferred){const prompt=deferred;deferred=null;try{await prompt.prompt();const result=await prompt.userChoice;if(result.outcome==='accepted')button.remove();}catch{help();}}else help();});
    document.querySelector('.navin').append(button);
  }
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferred=event;});
  window.addEventListener('appinstalled',()=>{deferred=null;document.getElementById('installAppBtn')?.remove();});
  if('serviceWorker' in navigator && new URLSearchParams(location.search).get('fj_preview')!=='1')window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
})();
