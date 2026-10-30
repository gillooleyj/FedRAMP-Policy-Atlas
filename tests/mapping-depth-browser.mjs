import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await b.newPage({viewport:{width:1440,height:1000}}),checks=[],errors=[];p.on('pageerror',e=>errors.push(String(e)));
const root=(process.env.ATLAS_URL??'http://127.0.0.1:4189/FedRAMP-Policy-Atlas').replace(/\/+$/,'')+'/',out=process.env.ATLAS_QA_DIR??'docs/qa-map-mappings-2026-10-30';
const g=JSON.parse(await readFile('public/data/graph.json','utf8'));
try{
 await p.goto(root+'?node=fr:KSI-CNA-EIS');await p.locator('.connection-depth').waitFor();
 for(const depth of [1,2,3]){
  const distances=new Map([['fr:KSI-CNA-EIS',0]]);
  for(let d=1;d<=depth;d++){const next=new Set();for(const e of g.edges){if(distances.get(e.from)===d-1)next.add(e.to);if(distances.get(e.to)===d-1)next.add(e.from);}for(const id of next)if(!distances.has(id))distances.set(id,d);}
  const edges=g.edges.filter(e=>distances.has(e.from)&&distances.has(e.to)&&Math.min(distances.get(e.from),distances.get(e.to))<depth);
  await p.getByRole('combobox',{name:'Connection levels',exact:true}).selectOption(String(depth));await p.waitForTimeout(900);
  assert.match(await p.locator('.graph-footer').innerText(),new RegExp(edges.length.toLocaleString('en-US')+' rendered edges'));
  for(let d=1;d<=depth;d++)assert.match(await p.locator('.depth-counts').innerText(),new RegExp(`Level ${d}: ${[...distances.values()].filter(v=>v===d).length.toLocaleString('en-US')}(?:\\s|$)`));
  checks.push({depth,entities:distances.size,edges:edges.length});
 }
 await p.getByRole('checkbox',{name:'All links',exact:true}).check();assert.match(await p.locator('.graph-footer').innerText(),/3,841 rendered edges/);await p.screenshot({path:`${out}/15-three-level-map.png`,fullPage:true});assert.deepEqual(errors,[]);await writeFile(`${out}/depth-results.json`,JSON.stringify({checks,allLinks:3841,errors},null,2)+'\n');console.log(JSON.stringify(checks));
}finally{await b.close();}
