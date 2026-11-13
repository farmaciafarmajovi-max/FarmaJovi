const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const {chromium} = require(path.resolve(path.dirname(process.execPath),'../node_modules/playwright'));
const root = path.resolve(__dirname,'..');
const out = path.join(root,'outputs');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
  const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/FarmaJovi\//,'/');
  const target=path.resolve(root,'.'+(name==='/'?'/index.html':name));
  if(!target.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(target,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':mime[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store'});res.end(error?'Not found':data);});
});
(async()=>{
  await new Promise(resolve=>server.listen(4178,'127.0.0.1',resolve));
  const browser=await chromium.launch({executablePath:process.env.FARMAJOVI_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:4178/FarmaJovi/?fj_preview=1';
  await page.goto(url,{waitUntil:'networkidle'});
  await page.locator('.interior-photo').scrollIntoViewIfNeeded();await page.locator('.interior-photo img').evaluate(img=>img.decode());await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(out,'desktop-live.png'),fullPage:true});
  await page.screenshot({path:path.join(out,'desktop-hero.png')});
  console.log('Live sources:',await page.locator('.turnosSource').innerText(),';',await page.locator('#newsGrid').innerText());
  // Deterministic API fixtures test successful rendering and filters without modifying real data.
  await page.route('**/rest/v1/news?*',route=>route.fulfill({json:[{id:'qa-1',title:'Noticia de prueba visual',excerpt:'Contenido de prueba, no publicado.',body:'Este es el contenido completo de una noticia.\nSegunda línea de detalle.\n\nFuente: https://example.com/tramitacion?'+('documento_muy_largo='.repeat(35))+'fin-de-la-fuente',created_at:new Date().toISOString(),source_url:'https://www.sernac.cl/portal/619/alt-article-87680.html'},{id:'qa-2',title:'Segunda noticia de prueba',excerpt:'Prueba de distribución de tarjetas.',body:'Detalle completo.',created_at:new Date().toISOString()}]}));
  const date=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  await page.route('**/getLocalesTurnos.php',route=>route.fulfill({json:[{local_nombre:'FARMACIA PRUEBA LA SERENA',comuna_nombre:'LA SERENA',local_direccion:'Dirección de prueba 123',local_telefono:'512123456',funcionamiento_hora_apertura:'09:00:00',funcionamiento_hora_cierre:'08:59:00',fecha:date},{local_nombre:'FARMACIA PRUEBA COQUIMBO',comuna_nombre:'COQUIMBO',local_direccion:'Dirección de prueba 456',fecha:date},{local_nombre:'DATO ANTIGUO NO MOSTRAR',comuna_nombre:'LA SERENA',fecha:'2026-01-01'}]}));
  await page.reload({waitUntil:'networkidle'});
  await page.locator('#precioInputFijo').fill('ibuprofeno');await page.locator('#buscarPrecioFijo').click();await page.locator('#resultadoPrecioFijo table').waitFor();
  assert.match(await page.locator('#resultadoPrecioFijo').innerText(),/IBUPROFENO/i);
  await page.locator('#precioInputFijo').fill('xyzproductoausente');await page.locator('#precioInputFijo').press('Enter');await page.waitForFunction(()=>document.getElementById('resultadoPrecioFijo').textContent.includes('No encontré'));
  await page.locator('#chatBtn').click();assert.equal(await page.locator('#chatBtn').getAttribute('aria-expanded'),'true');assert.equal(await page.locator('#chatInput').evaluate(el=>el===document.activeElement),true);
  await page.locator('#chatInput').fill('paracetamol');await page.locator('#chatForm button').click();assert.match(await page.locator('#messages').innerText(),/PARACETAMOL/i);await page.locator('#closeChat').click();assert.equal(await page.locator('#chatBtn').getAttribute('aria-expanded'),'false');
  await page.locator('.newsReadRetry').first().click();assert.equal(await page.locator('.newsDetail').first().isVisible(),true);assert.match(await page.locator('.newsDetail').first().innerText(),/contenido completo/);await page.locator('.newsReadRetry').first().click();
  assert.equal(await page.locator('.turnoCard').count(),3);await page.getByRole('button',{name:'La Serena',exact:true}).click();assert.equal(await page.locator('.turnoCard').count(),2);assert.equal(await page.locator('.turnoStatus').allTextContents().then(a=>a.every(x=>x==='24 horas')),true);assert.match(await page.locator('#turnosLiveGrid').innerText(),/Cordovez 510/);assert.match(await page.locator('#turnosLiveGrid').innerText(),/Balmaceda 438/);assert.equal(await page.locator('.turnoActions a[href^="tel:"]').count(),2);assert.equal(await page.locator('.turnoActions a[href*="maps/dir/"]').count(),2);await page.getByRole('button',{name:'Coquimbo',exact:true}).click();assert.equal(await page.locator('.turnoCard').count(),1);assert.equal(await page.locator('.turnoStatus').innerText(),'De turno');await page.getByRole('button',{name:'Ambas comunas'}).click();
  await page.locator('#installAppBtn').click();assert.equal(await page.locator('#installAppHelp').isVisible(),true);await page.getByRole('button',{name:'Entendido'}).click();
  await page.locator('summary').first().click();assert.equal(await page.locator('details').first().getAttribute('open'),'');
  assert.equal(await page.locator('#precios').count(),1);assert.equal(await page.locator('#precioInputFijo').count(),1);assert.equal(await page.locator('h1').count(),1);
  const anchors=await page.locator('a[href^="#"]').evaluateAll(els=>els.map(el=>el.getAttribute('href')).filter(href=>!document.getElementById(href.slice(1))));assert.deepEqual(anchors,[]);
  await page.locator('.newsReadRetry').first().click();
  for(const width of [320,360,390,600,768,820,1024,1440]){
    await page.setViewportSize({width,height:900});
    const overflow=await page.evaluate(()=>({width:innerWidth,doc:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)&&getComputedStyle(el).position!=='fixed';}).map(el=>el.className).slice(0,12)}));
    assert.ok(overflow.doc<=width,JSON.stringify(overflow));
    const detailBounds=await page.locator('.newsDetail').first().evaluate(el=>({width:el.clientWidth,scroll:el.scrollWidth,right:el.getBoundingClientRect().right,cardRight:el.closest('.newsCard').getBoundingClientRect().right}));
    assert.ok(detailBounds.scroll<=detailBounds.width+1 && detailBounds.right<detailBounds.cardRight,JSON.stringify({width,detailBounds}));
    assert.match(await page.locator('.newsDetail').first().innerText(),/fin-de-la-fuente$/);
    console.log('Responsive and expanded news OK',width);
  }
  await page.locator('.newsReadRetry').first().click();assert.equal(await page.locator('.newsDetail').first().isVisible(),false);
  await page.locator('.newsReadRetry').first().click();assert.equal(await page.locator('.newsDetail').first().isVisible(),true);
  await page.locator('.newsReadRetry').first().click();
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.scrollTo(0,0));await page.locator('.menu-toggle').click();assert.equal(await page.locator('#mainNav').isVisible(),true);await page.locator('#mainNav a[href="#precios"]').click();assert.equal(await page.locator('#mainNav').isVisible(),false);
  await page.locator('#chatBtn').click();await page.keyboard.press('Escape');assert.equal(await page.locator('#chatBtn').getAttribute('aria-expanded'),'false');
  // Return to real API states for delivered screenshots; never present fixture content as live.
  await page.unroute('**/rest/v1/news?*');await page.unroute('**/getLocalesTurnos.php');await page.goto(url,{waitUntil:'networkidle'});
  await page.locator('.interior-photo').scrollIntoViewIfNeeded();await page.locator('.interior-photo img').evaluate(img=>img.decode());await page.evaluate(()=>window.scrollTo(0,0));
  await page.screenshot({path:path.join(out,'mobile-hero.png')});await page.screenshot({path:path.join(out,'mobile-live.png'),fullPage:true});
  await page.goto('http://127.0.0.1:4178/FarmaJovi/noticia.html?id=16ddf037-dce8-4f67-81c0-2d5cad605340&fj_preview=1',{waitUntil:'networkidle'});
  assert.match(await page.locator('#article').innerText(),/comparador/i);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(out,'article-mobile.png'),fullPage:true});
  const appContext=await browser.newContext({viewport:{width:390,height:844}});
  await appContext.addInitScript(()=>localStorage.setItem('fj-exclude-tests','1'));
  const app=await appContext.newPage();
  await app.goto('http://127.0.0.1:4178/FarmaJovi/',{waitUntil:'networkidle'});
  await app.evaluate(()=>navigator.serviceWorker.ready);
  await app.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.ok(await app.evaluate(async()=>(await caches.keys()).includes('farmajovi-v9-news-wrap-20261113')));
  await appContext.setOffline(true);await app.reload({waitUntil:'networkidle'});
  assert.equal(await app.locator('#heroTitle').innerText(),'Una farmacia\nque te escucha.');
  assert.equal(await app.locator('.heroVisual img').evaluate(el=>el.naturalWidth>0),true);
  await app.locator('#precioInputFijo').fill('ibuprofeno');await app.locator('#buscarPrecioFijo').click();await app.locator('#resultadoPrecioFijo table').waitFor();
  await app.getByRole('button',{name:'La Serena',exact:true}).click();assert.equal(await app.locator('.turnoCard').count(),2);
  await appContext.close();
  assert.deepEqual(errors,[]);console.log('PASS: search, chat, news expansion, city filters, fresh dates, menu, installation help, FAQ, anchors, eight viewport widths, article, service-worker cache and offline search, no JS errors.');
  await browser.close();server.close();
})().catch(error=>{console.error(error);server.close();process.exit(1);});

