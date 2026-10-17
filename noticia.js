(async () => {
  'use strict';
  const article=document.getElementById('article');
  const id=new URLSearchParams(location.search).get('id')||'';
  if(!/^[a-zA-Z0-9-]{1,64}$/.test(id)){article.innerHTML='<h1>Noticias FarmaJovi</h1><p>Selecciona una noticia desde la página principal.</p><a href="./#noticias">Ver noticias</a>';return;}
  const text=(tag,value,className)=>{const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;};
  const link=(label,href)=>{
    try {const url=new URL(href);if(!['http:','https:'].includes(url.protocol))return null;const el=text('a',label);el.href=url.href;el.target='_blank';el.rel='noopener noreferrer';return el;}catch{return null;}
  };
  try{
    const query=new URLSearchParams({select:'id,created_at,title,excerpt,body,image_url,instagram_url,source_url',id:'eq.'+id,published:'is.true',limit:'1'});
    const response=await fetch('https://bwytvofvxbkdntsoipmf.supabase.co/rest/v1/news?'+query,{headers:{apikey:'sb_publishable_vAgutfClE7NUInmPJEaSYg_-o6-KMIT'},cache:'no-store'});
    if(!response.ok)throw Error('No se pudo cargar la noticia. Intenta nuevamente en unos momentos.');
    const rows=await response.json(),news=rows[0];
    if(!news){article.replaceChildren(text('h1','Noticia no disponible'),text('p','Esta noticia puede haber sido archivada o retirada.'));document.title='Noticia no disponible | FarmaJovi';const noindex=document.createElement('meta');noindex.name='robots';noindex.content='noindex';document.head.append(noindex);return;}
    document.title=news.title+' | FarmaJovi';document.querySelector('meta[name="description"]').content=news.excerpt||news.title;
    const canonical=new URL('noticia.html',location.href);canonical.searchParams.set('id',id);document.getElementById('articleCanonical').href=canonical.href;
    const date=new Date(news.created_at).toLocaleDateString('es-CL',{timeZone:'America/Santiago',day:'numeric',month:'long',year:'numeric'});
    article.replaceChildren(text('p','Publicado por FarmaJovi · '+date,'article-meta'),text('h1',news.title),text('p',news.excerpt||''));
    if(news.image_url){const imageLink=link('',news.image_url);if(imageLink){const img=document.createElement('img');img.src=imageLink.href;img.alt=news.title;img.style.borderRadius='16px';article.append(img);}}
    article.append(text('div',news.body||news.excerpt||'Consulta el detalle en la fuente enlazada.','article-body'));
    const links=document.createElement('p');links.className='article-links';
    for(const [label,url] of [['Consultar fuente ↗',news.source_url],['Ver en Instagram ↗',news.instagram_url]]){const a=link(label,url);if(a)links.append(a);}
    const share=text('button','Compartir noticia');share.type='button';share.className='btn';const status=text('p','','article-meta');status.setAttribute('role','status');
    share.addEventListener('click',async()=>{try{if(navigator.share)await navigator.share({title:news.title,url:canonical.href});else{await navigator.clipboard.writeText(canonical.href);status.textContent='Enlace copiado.';}}catch(error){if(error.name!=='AbortError')status.textContent='Puedes compartir la dirección de esta página desde el navegador.';}});
    article.append(links,share,status,text('p','Información referencial. Las noticias enlazan sus fuentes y no sustituyen una evaluación profesional.','editorial-note'));
    const schema=document.createElement('script');schema.type='application/ld+json';schema.textContent=JSON.stringify({'@context':'https://schema.org','@type':'Article',headline:news.title,description:news.excerpt,datePublished:news.created_at,author:{'@type':'Organization',name:'FarmaJovi'},publisher:{'@type':'Organization',name:'FarmaJovi'},mainEntityOfPage:canonical.href});document.head.append(schema);
  }catch(error){article.replaceChildren(text('h1','No pudimos cargar la noticia'),text('p',error.message));}
})();

