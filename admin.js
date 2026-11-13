(() => {
 'use strict';
 const SB='https://bwytvofvxbkdntsoipmf.supabase.co',KEY='sb_publishable_vAgutfClE7NUInmPJEaSYg_-o6-KMIT';
 // Same existing administrator allowlist; server-side Auth and RLS remain authoritative.
 const ADMIN='farmacia.farmajovi@gmail.com';
 const $=id=>document.getElementById(id);
 const text=(tag,value,className)=>{const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;};
 const paths={chart:'<path d="M4 3v17h17M8 16v-5m5 5V6m5 10v-7"/>',news:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h4"/>',shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',github:'<path d="M9 20c-4 1-4-2-6-2m12 4v-4a3.5 3.5 0 0 0-1-2.5c3-.3 6-1.5 6-6a4.7 4.7 0 0 0-1.3-3.2A4.3 4.3 0 0 0 18.6 3S17.5 2.7 15 4a11.3 11.3 0 0 0-6 0C6.5 2.7 5.4 3 5.4 3a4.3 4.3 0 0 0-.1 3.3A4.7 4.7 0 0 0 4 9.5c0 4.5 3 5.7 6 6A3.5 3.5 0 0 0 9 18v4"/>',heart:'<path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 8 15 8 15S25 10 20 5Z"/>',activity:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',refresh:'<path d="M20 7a8 8 0 0 0-14-2L3 8m0-5v5h5m-4 9a8 8 0 0 0 14 2l3-3m0 5v-5h-5"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-16a3 3 0 0 1 0 6m4 10v-3a6 6 0 0 0-3-5"/>',chat:'<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1 2v-9.5A8.5 8.5 0 1 1 21 11.5Z"/><path d="M7 10h10m-10 4h6"/>',search:'<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18Z"/>',device:'<rect x="3" y="3" width="12" height="13" rx="1"/><path d="M6 21h6m-3-5v5"/><rect x="16" y="9" width="5" height="12" rx="1"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>'};
 document.querySelectorAll('[data-icon]').forEach(el=>{el.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+(paths[el.dataset.icon]||paths.info)+'</svg>';});
 const date=value=>new Date(value).toLocaleString('es-CL',{timeZone:'America/Santiago',day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
 $('todayLabel').textContent=new Date().toLocaleDateString('es-CL',{timeZone:'America/Santiago',weekday:'long',day:'numeric',month:'long'});
 let token=null,authorized=false,news=[],filter='all',busy=false,baseline='',imagePreviewUrl='';
 const message=(value,type='success')=>{const el=$('globalMessage');el.textContent=value;el.className='global-message'+(type==='error'?' is-error':type==='warning'?' is-warning':'');el.hidden=!value;};
 const formMessage=(value,error=false)=>{const el=$('newsStatus');el.textContent=value;el.classList.toggle('is-error',error);};
 const snapshot=()=>JSON.stringify(['newsTitle','newsExcerpt','newsBody','newsImage','newsInstagram','newsSource'].map(id=>$(id).value).concat($('newsPublished').checked));
 const dirty=()=>!$('newsEditor').hidden&&snapshot()!==baseline;
 function expired(){authorized=false;token=null;$('panel').hidden=true;$('authGate').hidden=false;$('logout').hidden=true;$('sessionLabel').textContent='Sesión vencida';$('status').textContent='La sesión venció. Vuelve a entrar con GitHub. Los cambios no guardados aún no se han aplicado.';$('status').classList.add('is-error');$('login').hidden=false;}
 async function api(path,options={}){
  if(!authorized||!token)throw Error('Inicia sesión con la cuenta administradora.');
  let response;try{response=await fetch(SB+'/rest/v1/'+path,{...options,cache:'no-store',signal:options.signal||AbortSignal.timeout(20000),headers:{apikey:KEY,Authorization:'Bearer '+token,...(options.body?{'Content-Type':'application/json'}:{}),...options.headers}});}catch(error){if(error.name==='AbortError')throw error;throw Error('No pudimos confirmar la operación. Revisa la conexión y actualiza los datos antes de volver a intentar.');}
  if(response.status===401){expired();throw Error('La sesión venció. Vuelve a entrar con GitHub.');}
  if(!response.ok)throw Error(response.status===403?'El servidor no autorizó esta operación. Comprueba los permisos de tu cuenta.':response.status===409?'Hubo un conflicto al guardar. Actualiza la biblioteca antes de volver a intentar.':'No se pudo completar la operación. Revisa los datos y vuelve a intentarlo.');
  if(response.status===204)return null;const content=await response.text();return content?JSON.parse(content):null;
 }
 window.FarmaAdmin={api,message,expired};
 let confirmation=null;
 function finishConfirm(result){if(!confirmation)return;const resolve=confirmation;confirmation=null;$('confirmDialog').close();resolve(result);}
 function ask({title,description,label='Confirmar',danger=false}){
  if(confirmation)return Promise.resolve(false);
  $('confirmTitle').textContent=title;$('confirmDescription').textContent=description;$('confirmAccept').textContent=label;$('confirmAccept').className='btn '+(danger?'danger':'primary');$('deleteConfirmation').hidden=!danger;$('deleteWord').value='';$('confirmAccept').disabled=danger;
  return new Promise(resolve=>{confirmation=resolve;$('confirmDialog').showModal();if(danger)$('deleteWord').focus();else $('confirmCancel').focus();});
 }
 $('confirmCancel').addEventListener('click',()=>finishConfirm(false));$('confirmAccept').addEventListener('click',()=>finishConfirm(true));$('confirmDialog').addEventListener('cancel',event=>{event.preventDefault();finishConfirm(false);});$('confirmDialog').addEventListener('close',()=>{if(confirmation&&!$('confirmDialog').open){const resolve=confirmation;confirmation=null;resolve(false);}});
 $('deleteWord').addEventListener('input',()=>{$('confirmAccept').disabled=$('deleteWord').value.trim()!=='ELIMINAR';});
 async function mayDiscard(){return !dirty()||ask({title:'¿Descartar los cambios?',description:'Tienes cambios sin guardar en la noticia. Si continúas, se perderán esos cambios locales; la noticia guardada no se modifica.',label:'Descartar cambios'});}
 function switchSection(section,focus=true){
  const copy={overview:['EL PULSO DE TU SITIO','Resumen de uso','Una mirada clara a las interacciones registradas en FarmaJovi.'],news:['CONTENIDO QUE TE CUIDA','Noticias y publicaciones','Crea, revisa y administra las noticias del sitio público.'],activity:['ACCIONES, NO PERSONAS','Actividad reciente','Explora las acciones anónimas del período seleccionado.']};if(!copy[section])return;
  document.querySelectorAll('.admin-view').forEach(el=>el.hidden=el.id!=='view-'+section);document.querySelectorAll('[data-section]').forEach(el=>{if(el.dataset.section===section)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  [$('sectionEyebrow').textContent,$('sectionTitle').textContent,$('sectionDescription').textContent]=copy[section];$('analyticsToolbar').hidden=section==='news';if(focus)$('sectionTitle').focus({preventScroll:true});
 }
 document.querySelector('.sidebar-nav').addEventListener('click',event=>{const b=event.target.closest('[data-section]');if(b)switchSection(b.dataset.section);});
 const safeUrl=value=>{if(!value)return null;try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)&&!url.username&&!url.password?url.href:null;}catch{return null;}};
 function preview(){
  $('titleCount').textContent=$('newsTitle').value.length+' caracteres';$('previewTitle').textContent=$('newsTitle').value.trim()||'Aquí aparecerá el título';$('previewExcerpt').textContent=$('newsExcerpt').value.trim()||'El resumen aparecerá aquí mientras escribes.';$('previewBody').textContent=$('newsBody').value.trim()||'El contenido ampliado aparecerá aquí.';
  $('previewState').textContent=$('newsPublished').checked?'Se guardará como pública':'Se guardará sin publicar';$('previewState').classList.toggle('published',$('newsPublished').checked);$('previewLinks').textContent=[$('newsSource').value.trim()?'Fuente enlazada':'',$('newsInstagram').value.trim()?'Instagram enlazado':''].filter(Boolean).join(' · ');
  if(imagePreviewUrl!==$('newsImage').value.trim()){$('previewCover').hidden=true;$('previewCover').removeAttribute('src');}
  $('saveNews').textContent=$('editingId').value?'Guardar cambios':$('newsPublished').checked?'Publicar noticia':'Guardar sin publicar';const changed=dirty();$('dirtyState').textContent=changed?'Cambios sin guardar':'Sin cambios pendientes';$('dirtyState').classList.toggle('is-dirty',changed);
 }
 $('newsForm').addEventListener('input',preview);$('newsForm').addEventListener('change',preview);$('previewFull').addEventListener('click',()=>{const el=$('previewBody');el.hidden=!el.hidden;$('previewFull').textContent=el.hidden?'Ver contenido completo':'Ocultar contenido completo';});
 $('previewImage').addEventListener('click',()=>{const raw=$('newsImage').value.trim(),url=safeUrl(raw);if(!url){formMessage('Ingresa una dirección http o https válida para la imagen.',true);return;}imagePreviewUrl=raw;$('previewCover').src=url;$('previewCover').hidden=false;});
 $('previewCover').addEventListener('error',()=>{$('previewCover').hidden=true;formMessage('No pudimos cargar esa imagen. Revisa que el enlace sea público y corresponda a una imagen.',true);});
 function setBusy(value){busy=value;for(const el of $('newsForm').elements)el.disabled=value;['cancelEdit','cancelEditBottom','newNews','refreshNews'].forEach(id=>$(id).disabled=value);document.querySelectorAll('.news-item-actions button').forEach(el=>el.disabled=value);if(value)$('saveNews').textContent='Guardando…';else preview();}
 async function openEditor(row=null){if(busy||!await mayDiscard())return;switchSection('news',false);$('newsForm').reset();$('editingId').value=row?.id||'';
  for(const [id,key] of [['newsTitle','title'],['newsExcerpt','excerpt'],['newsBody','body'],['newsImage','image_url'],['newsInstagram','instagram_url'],['newsSource','source_url']])$(id).value=row?.[key]||'';
  $('newsPublished').checked=!!row?.published;$('editorTitle').textContent=row?'Editar noticia':'Escribe una noticia';$('editorEyebrow').textContent=row?'EDITANDO UNA PUBLICACIÓN':'NUEVA PUBLICACIÓN';$('editorExtras').open=!!(row?.image_url||row?.source_url||row?.instagram_url);$('previewCover').hidden=true;$('previewCover').removeAttribute('src');imagePreviewUrl='';$('previewBody').hidden=true;$('previewFull').textContent='Ver contenido completo';$('newsEditor').hidden=false;baseline=snapshot();formMessage('');preview();$('newsTitle').focus({preventScroll:true});$('newsEditor').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
 }
 async function cancelEditor(){if(busy||!await mayDiscard())return;$('newsEditor').hidden=true;baseline='';$('newNews').focus({preventScroll:true});}
 $('newNews').addEventListener('click',()=>openEditor());$('cancelEdit').addEventListener('click',cancelEditor);$('cancelEditBottom').addEventListener('click',cancelEditor);
 function renderNews(){
  const q=$('newsSearch').value.trim().toLocaleLowerCase('es-CL');const filtered=news.filter(n=>(filter==='all'||(filter==='published'?n.published:!n.published))&&(!q||[n.title,n.excerpt].join(' ').toLocaleLowerCase('es-CL').includes(q)));const list=$('newsAdminList');list.replaceChildren();const published=news.filter(n=>n.published).length;
  $('newsLibrarySummary').setAttribute('role','status');$('newsLibrarySummary').textContent='Mostrando '+filtered.length+' de '+news.length+' noticias · '+published+' publicadas · '+(news.length-published)+' no publicadas';$('sidebarNewsCount').textContent=news.length;
  if(!filtered.length){list.append(text('p',news.length?'No hay noticias que coincidan con este filtro.':'Todavía no tienes noticias. Usa «Nueva noticia» para comenzar.','empty-note'));return;}
  for(const n of filtered){const item=document.createElement('article');item.className='news-item';item.dataset.id=n.id;const copy=document.createElement('div'),meta=document.createElement('div');meta.className='news-item-meta';meta.append(text('span',n.published?'Publicada':'No publicada','state-badge'+(n.published?' published':'')),text('span',date(n.created_at)));copy.append(meta,text('h3',n.title||'Sin título'),text('p',n.excerpt||''));
   const actions=document.createElement('div');actions.className='news-item-actions';for(const [action,label,className] of [['edit','Editar','btn outline'],['archive',n.published?'Archivar':'Publicar','btn soft'],['delete','Eliminar','btn delete']]){const button=text('button',label,className);button.type='button';button.dataset.action=action;button.disabled=busy;actions.append(button);}
   if(n.published){const a=text('a','Ver en el sitio ↗','text-link');a.href='noticia.html?id='+encodeURIComponent(n.id);a.target='_blank';a.rel='noopener noreferrer';actions.append(a);}item.append(copy,actions);list.append(item);
  }
 }
 let newsGeneration=0;
 async function loadNews(){const run=++newsGeneration;$('refreshNews').disabled=true;$('newsListStatus').textContent='Actualizando biblioteca…';try{const data=await api('news?select=id,created_at,title,excerpt,body,image_url,instagram_url,source_url,published&order=created_at.desc');if(run!==newsGeneration)return;if(!Array.isArray(data))throw Error('El servidor devolvió una biblioteca inesperada.');news=data;renderNews();$('newsListStatus').textContent='';}catch(error){if(run===newsGeneration){$('newsListStatus').textContent=error.message;$('newsListStatus').classList.add('is-error');}}finally{if(run===newsGeneration){$('refreshNews').disabled=busy;if(!$('newsListStatus').textContent)$('newsListStatus').classList.remove('is-error');}}}
 $('refreshNews').addEventListener('click',loadNews);$('newsSearch').addEventListener('input',renderNews);document.querySelector('.segmented').addEventListener('click',event=>{const b=event.target.closest('[data-news-filter]');if(!b)return;filter=b.dataset.newsFilter;document.querySelectorAll('[data-news-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));renderNews();});
 $('newsForm').addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;const payload={title:$('newsTitle').value.trim(),excerpt:$('newsExcerpt').value.trim(),body:$('newsBody').value.trim(),image_url:$('newsImage').value.trim()||null,instagram_url:$('newsInstagram').value.trim()||null,source_url:$('newsSource').value.trim()||null,published:$('newsPublished').checked};
  if(!payload.title||!payload.excerpt){formMessage('Completa el título y el resumen antes de guardar.',true);return;}
  for(const key of ['image_url','instagram_url','source_url'])if(payload[key]&&!safeUrl(payload[key])){formMessage('Revisa los enlaces: deben comenzar con http o https, sin credenciales.',true);return;}
  const id=$('editingId').value,original=news.find(n=>n.id===id);setBusy(true);formMessage('');
  try{
   if(payload.published&&!original?.published&&!await ask({title:'¿Publicar esta noticia?',description:'«'+payload.title+'» quedará visible para los visitantes de FarmaJovi al guardar.',label:'Publicar noticia'}))return;
   const data=await api('news'+(id?'?id=eq.'+encodeURIComponent(id):''),{method:id?'PATCH':'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(payload)});if(!Array.isArray(data)||!data.length)throw Error('El servidor no confirmó la escritura. Actualiza la biblioteca y revisa los permisos antes de volver a intentar.');
   baseline=snapshot();$('newsEditor').hidden=true;message(id?'Cambios guardados correctamente.':payload.published?'Noticia publicada en el sitio.':'Noticia guardada sin publicar.');await loadNews();
  }catch(error){formMessage(error.message,true);}finally{setBusy(false);}
 });
 $('newsAdminList').addEventListener('click',async event=>{
  const b=event.target.closest('[data-action]');if(!b||busy)return;const n=news.find(row=>row.id===b.closest('[data-id]').dataset.id);if(!n)return;if(b.dataset.action==='edit'){openEditor(n);return;}
  if($('editingId').value===n.id&&dirty()&&!await mayDiscard())return;
  setBusy(true);try{
   const deleting=b.dataset.action==='delete';const confirmed=await ask(deleting?{title:'Eliminar noticia definitivamente',description:'Se eliminará «'+n.title+'». No hay papelera en este panel. Para retirarla del sitio sin perderla, cancela y elige «Archivar».',label:'Eliminar definitivamente',danger:true}:{title:n.published?'¿Archivar esta noticia?':'¿Publicar esta noticia?',description:'«'+n.title+'» '+(n.published?'dejará de verse en el sitio, pero seguirá disponible en esta biblioteca.':'quedará visible para los visitantes de FarmaJovi.'),label:n.published?'Archivar noticia':'Publicar noticia'});if(!confirmed)return;
   const data=await api('news?id=eq.'+encodeURIComponent(n.id),{method:deleting?'DELETE':'PATCH',headers:{Prefer:'return=representation'},...(!deleting?{body:JSON.stringify({published:!n.published})}:{})});if(!Array.isArray(data)||!data.length)throw Error('El servidor no confirmó la operación. Actualiza la biblioteca y revisa los permisos.');
   if($('editingId').value===n.id){$('newsEditor').hidden=true;baseline='';}message(deleting?'Noticia eliminada definitivamente. No se puede recuperar desde este panel.':n.published?'Noticia archivada. Puedes volver a publicarla cuando quieras.':'Noticia publicada en el sitio.');await loadNews();
  }catch(error){message(error.message,'error');}finally{setBusy(false);}
 });
 window.addEventListener('beforeunload',event=>{if(dirty()){event.preventDefault();event.returnValue='';}});
 $('login').addEventListener('click',()=>{const redirect=location.origin+location.pathname;location.assign(SB+'/auth/v1/authorize?provider=github&redirect_to='+encodeURIComponent(redirect));});
 // Preserve existing local sign-out behavior; do not revoke sessions on other devices.
 $('logout').addEventListener('click',async()=>{if(busy||!await mayDiscard())return;authorized=false;token=null;baseline='';history.replaceState(null,'',location.pathname+location.search);location.reload();});
 async function authenticate(){
  const parts=(location.hash||'').split('#').filter(part=>part.includes('access_token=')),last=parts.at(-1)||location.hash.slice(1);if(parts.length>1)history.replaceState(null,'',location.pathname+location.search+'#'+last);
  const params=new URLSearchParams(last);token=params.get('access_token');if(!token){$('status').textContent=params.get('error')?'No se completó el acceso. Vuelve a entrar con GitHub.':'Inicia sesión con la cuenta administradora de GitHub.';return;}
  $('login').disabled=true;
  try{const response=await fetch(SB+'/auth/v1/user',{headers:{apikey:KEY,Authorization:'Bearer '+token},cache:'no-store',signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error('Sesión no válida o vencida. Vuelve a entrar con GitHub.');const user=await response.json();if((user.email||'').toLowerCase()!==ADMIN)throw Error('Esta cuenta no tiene permisos de administración. Ingresa con la cuenta autorizada.');
   authorized=true;$('authGate').hidden=true;$('panel').hidden=false;$('logout').hidden=false;$('sessionLabel').textContent='Sesión administradora';switchSection('overview',false);await Promise.all([loadNews(),window.loadFarmaInsights()]);
  }catch(error){authorized=false;token=null;$('panel').hidden=true;$('authGate').hidden=false;$('logout').hidden=true;$('status').textContent=error.name==='TimeoutError'?'La conexión tardó demasiado. Vuelve a entrar con GitHub.':error.name==='TypeError'?'No pudimos conectar con el acceso. Revisa tu conexión y vuelve a entrar con GitHub.':error.message;$('status').classList.add('is-error');}finally{$('login').disabled=false;}
 }
 authenticate();
})();
