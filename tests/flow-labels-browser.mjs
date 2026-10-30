import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1680,height:1150}}),checks=[],errors=[];
page.on('pageerror',e=>errors.push(String(e)));
const base=(process.env.ATLAS_URL??'http://127.0.0.1:4187/FedRAMP-Policy-Atlas').replace(/\/+$/,'')+'/';
const output='docs/qa-flow-labels-2026-10-30';await mkdir(output,{recursive:true});
async function inspect(name,query){
 await page.goto(base+'?mode=flow&'+query);await page.locator('.flow-entity').first().waitFor();await page.waitForTimeout(700);
 const result=await page.evaluate(()=>{
  const headings=[...document.querySelectorAll('.flow-band')].map(e=>({kind:e.dataset.kind,text:e.textContent,rect:e.getBoundingClientRect()}));
  const collisions=[];
  for(const path of document.querySelectorAll('.react-flow__edge-path')){
   const coordinates=path.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number),matrix=path.getScreenCTM(),points=[];
   for(let i=0;i<coordinates.length;i+=2)points.push(new window.DOMPoint(coordinates[i],coordinates[i+1]).matrixTransform(matrix));
   for(let i=1;i<points.length;i++)for(const h of headings){const a=points[i-1],b=points[i],r=h.rect;
    if(Math.abs(a.y-b.y)<.1&&a.y>r.top-1&&a.y<r.bottom+1&&Math.max(a.x,b.x)>r.left&&Math.min(a.x,b.x)<r.right||Math.abs(a.x-b.x)<.1&&a.x>r.left-1&&a.x<r.right+1&&Math.max(a.y,b.y)>r.top&&Math.min(a.y,b.y)<r.bottom)collisions.push({edge:path.closest('.react-flow__edge').dataset.id,heading:h.text});
   }
  }
  const cards=[...document.querySelectorAll('.flow-entity')].map(e=>({kind:e.dataset.kind,label:e.querySelector('.flow-card-type').textContent,icon:!!e.querySelector('.flow-card-type svg'),color:window.getComputedStyle(e).borderColor,radius:window.getComputedStyle(e).borderRadius}));
  return {headings:headings.map(({kind,text})=>({kind,text})),collisions,cards};
 });
 assert.deepEqual(result.collisions,[],name+': no connector crosses a heading rectangle');
 assert.ok(result.cards.every(c=>c.icon&&c.label));
 for(const h of result.headings)assert.ok(result.cards.some(c=>c.kind===h.kind),'Headings describe only present card types');
 assert.ok(result.headings.every(h=>!h.text.includes('Rule subsets · KSIs')&&!h.text.includes('Rulesets · KSI themes')));
 await page.screenshot({path:`${output}/${name}.png`,fullPage:true});checks.push({name,headingCount:result.headings.length,cardCount:result.cards.length,connectorHeadingCollisions:0});console.log('PASS '+name);return result;
}
try{
 const example=await inspect('mixed-rule-ksi-overview','branch=example&mapped=1');
 const rule=example.cards.find(c=>c.kind==='rule'),ksi=example.cards.find(c=>c.kind==='ksi');assert.equal(rule.label,'FedRAMP rule');assert.equal(ksi.label,'Key Security Indicator');assert.notEqual(rule.color,ksi.color);assert.notEqual(rule.radius,ksi.radius);
 await inspect('class-b-drilldown','node=class:B');
 await inspect('rule-drilldown','node=fr:AGU-AGC-AIP');
 await inspect('ksi-with-mappings','node=fr:KSI-CNA-EIS&mapped=1');
 await inspect('fedramp-source','node=fedramp');
 await inspect('nist-control','node=nist:ac-2&mapped=1');
 await page.setViewportSize({width:390,height:844});await inspect('mobile-ksi','node=fr:KSI-CNA-EIS&mapped=1');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),false);
 assert.deepEqual(errors,[]);await writeFile(`${output}/results.json`,JSON.stringify({testedAt:new Date().toISOString(),browser:browser.version(),checks,errors},null,2)+'\n');
}finally{await browser.close();}
