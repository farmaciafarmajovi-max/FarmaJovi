(() => {
 'use strict';
 const $=id=>document.getElementById(id),day=86400000;
 const text=(tag,value,className)=>{const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;};
 const norm=value=>String(value||'').trim().toLocaleLowerCase('es-CL').replace(/\s+/g,' ');
 const classify=question=>{const q=String(question||'');if(q.startsWith('v2|view|'))return {type:'view',meta:new URLSearchParams(q.slice(8))};if(q.startsWith('keyword:'))return {type:'keyword',keyword:norm(q.slice(8))};if(q.startsWith('chat:'))return {type:'chat',category:q.slice(5)};if(q==='price:search')return {type:'price'};if(q==='click:whatsapp'||q==='click:wa')return {type:'wa'};return {type:q.startsWith('v2|')?q.slice(3):q};};
 const friendly=question=>{const e=classify(question);if(e.type==='keyword')return 'Palabra buscada · '+e.keyword;if(e.type==='chat')return 'Chat · '+({precio:'Precio',stock:'Disponibilidad',ubicacion:'Ubicación',general:'General'}[e.category]||'General');return {view:'Vista de página',price:'Búsqueda de precios',wa:'Clic en WhatsApp',news_open:'Apertura de noticia',price_list:'Listado completo',installed:'Instalación confirmada',install_click:'Botón instalar',instagram:'Enlace Instagram',sernac_comparator:'Comparador SERNAC'}[e.type]||'Otro acceso';};
 const summarize=items=>{
  const counts={view:0,chat:0,price:0,wa:0,news_open:0,installed:0,actions:0},sessions=new Set(),keywords={},sources={},devices={},categories={precio:0,stock:0,ubicacion:0,general:0};
  for(const row of items){const e=classify(row.question);if(e.type==='keyword'){if(e.keyword)keywords[e.keyword]=(keywords[e.keyword]||0)+1;continue;}if(e.type!=='view')counts.actions++;counts[e.type]=(counts[e.type]||0)+1;if(e.type==='chat')categories[e.category in categories?e.category:'general']++;if(e.type==='view'){const session=e.meta.get('session');if(session)sessions.add(session);const source=e.meta.get('source')||'desconocido',device=e.meta.get('device')||'desconocido';sources[source]=(sources[source]||0)+1;devices[device]=(devices[device]||0)+1;}}
  return {counts,sessions:sessions.size,keywords,sources,devices,categories};
 };
 const format=value=>Number(value).toLocaleString('es-CL');
 const sourceLabels={instagram:'Instagram',facebook:'Facebook',google:'Google',bing:'Bing',directo:'Acceso directo',otros:'Otros sitios',desconocido:'Sin identificar'};
 const deviceLabels={movil:'Móvil',computador:'Computador',desconocido:'Sin identificar'};
 function distribution(id,values,labels,empty){const root=$(id),entries=Object.entries(values).sort((a,b)=>b[1]-a[1]),total=entries.reduce((sum,[,n])=>sum+n,0);root.replaceChildren();if(!total){root.append(text('p',empty,'empty-note'));return;}
  for(const [key,n] of entries){const row=document.createElement('div');row.className='distribution-item';const heading=document.createElement('div');const count=text('b',format(n));count.append(text('small',Math.round(n/total*100)+'%'));heading.append(text('span',labels[key]||key),count);const track=document.createElement('div');track.className='distribution-track';track.setAttribute('aria-hidden','true');const bar=document.createElement('div');bar.className='distribution-fill';bar.style.width=(n/total*100)+'%';track.append(bar);row.append(heading,track);root.append(row);}
 }
 let current=[],activityPage=1,activeController=null,initialized=false,generation=0,statsNotice=false;
 function renderActivity(){const type=$('activityType').value,q=norm($('activitySearch').value),filtered=current.filter(row=>(type==='all'||classify(row.question).type===type)&&(!q||norm(friendly(row.question)).includes(q)));const pages=Math.max(1,Math.ceil(filtered.length/50));activityPage=Math.min(activityPage,pages);const tbody=$('rows');tbody.replaceChildren();
  for(const row of filtered.slice((activityPage-1)*50,activityPage*50)){const tr=document.createElement('tr');tr.append(text('td',new Date(row.created_at).toLocaleString('es-CL',{timeZone:'America/Santiago'})),text('td',friendly(row.question)));tbody.append(tr);}
  if(!filtered.length){const tr=document.createElement('tr'),td=text('td','No hay acciones que coincidan con este período y filtro.');td.colSpan=2;tr.append(td);tbody.append(tr);}
  $('activityPage').textContent=filtered.length+' registros · Página '+activityPage+' de '+pages;$('activityPrevious').disabled=activityPage<=1;$('activityNext').disabled=activityPage>=pages;
 }
 async function refresh(){
  activeController?.abort();if(statsNotice){window.FarmaAdmin.message('');statsNotice=false;}const controller=new AbortController();activeController=controller;const run=++generation,period=$('insightsPeriod').value,now=Date.now(),days=period==='all'?null:Number(period),cutoff=days?now-2*days*day:null;const range=$('insightsRange');range.textContent='Consultando registros…';$('insightsRefresh').disabled=true;$('view-overview').setAttribute('aria-busy','true');const list=[];let capped=false;
  try{
   for(let offset=0;offset<20000;offset+=1000){const query=new URLSearchParams({select:'id,created_at,question',order:'created_at.desc,id.desc',limit:'1000',offset:String(offset)});if(cutoff)query.set('created_at','gte.'+new Date(cutoff).toISOString());const timeout=AbortSignal.timeout(20000),signal=AbortSignal.any([controller.signal,timeout]);const page=await window.FarmaAdmin.api('chat_interactions?'+query,{signal});if(!Array.isArray(page))throw Error('El servidor devolvió estadísticas inesperadas.');list.push(...page);if(page.length<1000)break;if(offset===19000)capped=true;if(run!==generation)return;}
   if(run!==generation)return;
   current=list.filter(row=>{const at=new Date(row.created_at).getTime();return at<=now&&(!days||at>=now-days*day);});const previous=days?list.filter(row=>{const at=new Date(row.created_at).getTime();return at>=cutoff&&at<now-days*day;}):[];const data=summarize(current),prior=summarize(previous);
   for(const [id,value] of Object.entries({total:data.counts.actions,chatTotal:data.counts.chat,searchTotal:data.counts.price,waTotal:data.counts.wa,viewTotal:data.counts.view,sessionTotal:data.sessions,newsTotal:data.counts.news_open,installTotal:data.counts.installed}))$(id).textContent=format(value);
   const change=(a,b)=>!days?'Todo lo registrado':b?((a-b)/b*100>=0?'+':'')+Math.round((a-b)/b*100)+'% vs. período anterior':a?'Sin base anterior comparable':'Sin actividad en el período';
   for(const [id,key] of [['totalChange','actions'],['chatChange','chat'],['searchChange','price'],['waChange','wa'],['viewChange','view']])$(id).textContent=change(data.counts[key],prior.counts[key]);
   distribution('sourceSummary',data.sources,sourceLabels,'Todavía no hay vistas con procedencia en este período.');distribution('deviceSummary',data.devices,deviceLabels,'Todavía no hay vistas con dispositivo en este período.');distribution('bars',data.categories,{precio:'Precio',stock:'Disponibilidad',ubicacion:'Ubicación',general:'General'},'Todavía no hay consultas del chat en este período.');
   const keywords=$('keywords');keywords.replaceChildren();const ordered=Object.entries(data.keywords).sort((a,b)=>b[1]-a[1]).slice(0,20);for(const [word,n] of ordered){const row=document.createElement('div');row.className='keyword-item';row.append(text('span',word),text('b',format(n)));keywords.append(row);}if(!ordered.length)keywords.append(text('p','No hay palabras registradas en este período.','empty-note'));
   $('sernacAccesses').textContent=format(data.counts.sernac_comparator||0)+' accesos al comparador';activityPage=1;renderActivity();
   const localDate=value=>new Date(value).toLocaleDateString('es-CL',{timeZone:'America/Santiago'});range.textContent=(days?localDate(now-days*day)+' a '+localDate(now):'Todo lo registrado')+' · '+format(current.length)+' registros'+(capped?' · Resumen parcial: límite de 20.000 registros.':'');
   $('lastUpdated').textContent='Actualizado a las '+new Date().toLocaleTimeString('es-CL',{timeZone:'America/Santiago',hour:'2-digit',minute:'2-digit'});
   if(capped){statsNotice=true;window.FarmaAdmin.message('Se alcanzó el límite de 20.000 registros. El resumen puede estar incompleto; selecciona un período más corto.','warning');}
  }catch(error){if(run!==generation||controller.signal.aborted)return;statsNotice=true;range.textContent=error.name==='TimeoutError'?'La consulta tardó demasiado. Usa «Actualizar datos» para volver a intentar.':error.message;window.FarmaAdmin.message('No se actualizaron las estadísticas. Los valores anteriores, si existen, no corresponden necesariamente al período seleccionado.','error');}
  finally{if(run===generation){$('insightsRefresh').disabled=false;$('view-overview').setAttribute('aria-busy','false');}}
 }
 window.loadFarmaInsights=async()=>{
  if(!initialized){initialized=true;try{$('excludeMyTests').checked=localStorage.getItem('fj-exclude-tests')==='1';}catch{}
   $('excludeMyTests').addEventListener('change',()=>{try{localStorage.setItem('fj-exclude-tests',$('excludeMyTests').checked?'1':'0');window.FarmaAdmin.message($('excludeMyTests').checked?'Las acciones futuras de este navegador quedarán excluidas de la medición.':'Las acciones futuras de este navegador volverán a medirse.');}catch{window.FarmaAdmin.message('El navegador no permite guardar esta preferencia.','error');}});
   $('insightsPeriod').addEventListener('change',refresh);$('insightsRefresh').addEventListener('click',refresh);$('activitySearch').addEventListener('input',()=>{activityPage=1;renderActivity();});$('activityType').addEventListener('change',()=>{activityPage=1;renderActivity();});$('activityPrevious').addEventListener('click',()=>{activityPage--;renderActivity();});$('activityNext').addEventListener('click',()=>{activityPage++;renderActivity();});
  }
  await refresh();
 };
})();
