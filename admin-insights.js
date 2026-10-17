(() => {
  'use strict';
  const API='https://bwytvofvxbkdntsoipmf.supabase.co/rest/v1/chat_interactions';
  const KEY='sb_publishable_vAgutfClE7NUInmPJEaSYg_-o6-KMIT';
  const norm=value=>String(value||'').trim().toLocaleLowerCase('es-CL').replace(/\s+/g,' ');
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const day=86400000;
  const classify=question=>{
    const q=String(question||'');
    if(q.startsWith('v2|view|'))return {type:'view',meta:new URLSearchParams(q.slice(8))};
    if(q.startsWith('keyword:'))return {type:'keyword',keyword:norm(q.slice(8))};
    if(q.startsWith('chat:'))return {type:'chat',category:q.slice(5)};
    if(q==='price:search')return {type:'price'};
    if(q==='click:whatsapp'||q==='click:wa')return {type:'wa'};
    return {type:q.startsWith('v2|')?q.slice(3):q};
  };
  const summarize=items=>{
    const counts={view:0,chat:0,price:0,wa:0,news_open:0,installed:0,actions:0};
    const sessions=new Set(),keywords={},sources={},devices={},categories={precio:0,stock:0,ubicacion:0,general:0};
    for(const row of items){
      const e=classify(row.question);
      if(e.type==='keyword'){if(e.keyword)keywords[e.keyword]=(keywords[e.keyword]||0)+1;continue;}
      if(e.type!=='view')counts.actions++;counts[e.type]=(counts[e.type]||0)+1;
      if(e.type==='chat')categories[e.category in categories?e.category:'general']++;
      if(e.type==='view'){
        const session=e.meta.get('session');if(session)sessions.add(session);
        const src=e.meta.get('source')||'desconocido',device=e.meta.get('device')||'desconocido';
        sources[src]=(sources[src]||0)+1;devices[device]=(devices[device]||0)+1;
      }
    }
    return {counts,sessions:sessions.size,keywords,sources,devices,categories};
  };
  const friendly=question=>{
    const e=classify(question);
    const labels={view:'Vista de página',price:'Búsqueda de precios',wa:'Clic en WhatsApp',chat:'Consulta del chat',news_open:'Apertura de noticia',price_list:'Listado completo',installed:'Instalación confirmada',install_click:'Botón instalar',instagram:'Enlace Instagram',sernac_comparator:'Comparador de anticonceptivos SERNAC'};
    if(e.type==='keyword')return 'Palabra: '+e.keyword;
    if(e.type==='chat')return 'Chat · '+({precio:'Precio',stock:'Disponibilidad',ubicacion:'Ubicación',general:'General'}[e.category]||'General');
    return labels[e.type]||'Otro acceso';
  };
  window.loadFarmaInsights=async token=>{
    const panel=document.getElementById('panel');
    const controls=document.createElement('div');controls.className='panel insightsControls';
    controls.innerHTML='<h2>Resumen de uso</h2><label>Período <select id="insightsPeriod"><option value="7">Últimos 7 días</option><option value="30" selected>Últimos 30 días</option><option value="all">Todo lo registrado</option></select></label> <button type="button" class="btn outline" id="insightsRefresh">Actualizar</button><p id="insightsRange" class="muted" role="status"></p><label><input id="excludeMyTests" type="checkbox"> Excluir mis pruebas en este navegador</label><p class="muted">La exclusión se aplica a acciones futuras en este navegador y equipo. Las pruebas anteriores siguen incluidas.</p>';
    panel.prepend(controls);
    const extra=document.createElement('div');extra.className='metrics';extra.innerHTML='<div class="metric"><b id="viewTotal">—</b><span>Vistas de página</span><small id="viewChange"></small></div><div class="metric"><b id="sessionTotal">—</b><span>Sesiones medidas</span></div><div class="metric"><b id="newsTotal">0</b><span>Aperturas de noticias</span></div><div class="metric"><b id="installTotal">0</b><span>Instalaciones confirmadas</span></div>';
    controls.after(extra);
    const coverage=document.createElement('div');coverage.className='panel';coverage.innerHTML='<h2>Procedencia y dispositivos</h2><div class="insightColumns"><div><h3>Origen de las vistas</h3><div id="sourceSummary"></div></div><div><h3>Dispositivos</h3><div id="deviceSummary"></div></div></div><p class="muted">Sesiones no equivale a personas únicas. Visitas, origen e instalaciones se miden desde la actualización del 17-10-2026; antes de esa fecha sólo había interacciones. Los bloqueadores o preferencias de privacidad pueden impedir el registro.</p><h3>Herramientas de la comunidad</h3><p id="sernacAccesses" role="status"></p><h3>Presencia en Google</h3><p>Los clics, impresiones y posición en Google se consultan en Search Console; este panel aún no está conectado a esos datos.</p><a href="https://search.google.com/search-console/" target="_blank" rel="noopener">Abrir Search Console ↗</a>';
    extra.after(coverage);
    const select=document.getElementById('insightsPeriod'),range=document.getElementById('insightsRange'),exclude=document.getElementById('excludeMyTests');
    try{exclude.checked=localStorage.getItem('fj-exclude-tests')==='1';}catch{}
    exclude.addEventListener('change',()=>{try{localStorage.setItem('fj-exclude-tests',exclude.checked?'1':'0');}catch{range.textContent='El navegador no permite guardar esta preferencia.';}});
    const note=document.querySelector('.note');if(note)note.textContent='Acciones registradas, no personas. Las palabras de búsqueda se muestran por separado y no suman una segunda acción. No se guardan preguntas completas del chat.';
    document.getElementById('total').nextElementSibling.textContent='Acciones medidas';
    let generation=0;
    async function refresh(){
      const run=++generation,period=select.value,now=Date.now(),days=period==='all'?null:Number(period);
      range.textContent='Consultando registros…';
      const cutoff=days?now-2*days*day:null;
      const list=[];let capped=false;
      try{
        for(let offset=0;offset<20000;offset+=1000){
          const query=new URLSearchParams({select:'id,created_at,question',order:'created_at.desc,id.desc',limit:'1000',offset:String(offset)});
          if(cutoff)query.set('created_at','gte.'+new Date(cutoff).toISOString());
          const response=await fetch(API+'?'+query,{headers:{apikey:KEY,Authorization:'Bearer '+token},cache:'no-store'});
          if(!response.ok)throw Error(response.status===401?'La sesión venció; vuelve a entrar con GitHub.':'No se pudieron leer las estadísticas.');
          const page=await response.json();if(!Array.isArray(page))throw Error('Respuesta de estadísticas inesperada.');
          list.push(...page);if(page.length<1000)break;if(offset===19000)capped=true;
          if(run!==generation)return;
        }
        if(run!==generation)return;
        const current=list.filter(x=>new Date(x.created_at).getTime()<=now&&(!days||new Date(x.created_at).getTime()>=now-days*day));
        const previous=days?list.filter(x=>{const at=new Date(x.created_at).getTime();return at>=cutoff&&at<now-days*day;}):[];
        const data=summarize(current),prior=summarize(previous);
        for(const [id,value] of Object.entries({total:data.counts.actions,chatTotal:data.counts.chat,searchTotal:data.counts.price,waTotal:data.counts.wa,viewTotal:data.counts.view||'—',sessionTotal:data.sessions||'—',newsTotal:data.counts.news_open,installTotal:data.counts.installed}))document.getElementById(id).textContent=value;
        const change=(a,b)=>!days?'Todo lo registrado':b?((a-b)/b*100>=0?'+':'')+Math.round((a-b)/b*100)+'% frente al período anterior':a?'Sin base anterior para comparar':'Sin actividad registrada';
        for(const [id,key] of [['total','actions'],['chatTotal','chat'],['searchTotal','price'],['waTotal','wa']]){
          const card=document.getElementById(id).parentElement;let small=card.querySelector('small');if(!small){small=document.createElement('small');card.appendChild(small);}small.textContent=change(data.counts[key],prior.counts[key]);
        }
        document.getElementById('viewChange').textContent='Medición nueva; aún no hay un período completo comparable.';
        const distribution=(id,values)=>{document.getElementById(id).innerHTML=Object.entries(values).sort((a,b)=>b[1]-a[1]).map(([label,n])=>'<div class="keywordItem"><span>'+escape(label)+'</span><strong>'+n+'</strong></div>').join('')||'<p class="emptyNote">Todavía no hay vistas registradas en este período.</p>';};
        distribution('sourceSummary',data.sources);distribution('deviceSummary',data.devices);
        document.getElementById('sernacAccesses').textContent='Accesos al comparador de anticonceptivos SERNAC: '+(data.counts.sernac_comparator||0)+'. Se cuenta el clic de salida; no las búsquedas realizadas en SERNAC.';
        const max=Math.max(1,...Object.values(data.categories));
        document.getElementById('bars').innerHTML=Object.entries({precio:'Precio',stock:'Stock',ubicacion:'Ubicación',general:'General'}).map(([key,label])=>'<div class="bar"><label>'+label+' <b>'+data.categories[key]+'</b></label><i style="width:'+Math.round(data.categories[key]/max*65)+'%"></i></div>').join('');
        document.getElementById('keywords').innerHTML=Object.entries(data.keywords).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([keyword,n])=>'<div class="keywordItem"><span>'+escape(keyword)+'</span><strong>'+n+'</strong></div>').join('')||'<p class="emptyNote">Sin palabras registradas en este período.</p>';
        document.getElementById('rows').innerHTML=current.slice(0,100).map(x=>'<tr><td>'+escape(new Date(x.created_at).toLocaleString('es-CL',{timeZone:'America/Santiago'}))+'</td><td>'+escape(friendly(x.question))+'</td></tr>').join('')||'<tr><td colspan="2">Sin registros en este período.</td></tr>';
        const date=value=>new Date(value).toLocaleDateString('es-CL',{timeZone:'America/Santiago'});
        range.textContent=(days?date(now-days*day)+' a '+date(now):'Todo lo registrado')+' · '+current.length+' registros consultados (incluyen etiquetas de palabras).'+(capped?' Se alcanzó el límite de 20.000 registros; el resumen es parcial.':'');
      }catch(error){if(run===generation)range.textContent=error.message;}
    }
    select.addEventListener('change',refresh);document.getElementById('insightsRefresh').addEventListener('click',refresh);
    await refresh();
  };
})();

