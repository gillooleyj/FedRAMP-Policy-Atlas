import {chromium} from 'playwright';import {writeFile} from 'node:fs/promises';
const dir='docs/qa-flow-structure-2026-10-30',base='http://127.0.0.1:4187/FedRAMP-Policy-Atlas/';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1680,height:1246}}),states=[],errors=[];page.on('pageerror',e=>errors.push(String(e)));const wait=()=>page.waitForTimeout(700),fit=()=>page.getByRole('button',{name:'Fit chart to view',exact:true}).click();
async function capture(name){await wait();await page.screenshot({path:`${dir}/ux-${name}.png`,fullPage:true});const data=await page.locator('.react-flow__node').evaluateAll(es=>es.map(e=>{const xy=e.style.transform.match(/translate\(([-\d.]+)px, ([-\d.]+)px\)/);return {id:e.dataset.id,x:Number(xy?.[1]),y:Number(xy?.[2]),text:e.textContent};}));const xs=data.map(n=>n.x),ys=data.map(n=>n.y),unique=[...new Set(xs)].sort((a,b)=>a-b);states.push({name,url:page.url(),count:data.length,width:Math.max(...xs)-Math.min(...xs)+224,height:Math.max(...ys)-Math.min(...ys)+112,maxColumnGap:Math.max(0,...unique.slice(1).map((x,i)=>x-unique[i]-224)),viewport:await page.locator('.react-flow__viewport').getAttribute('style'),toggle:{checked:await page.getByRole('checkbox',{name:'Include mapped NIST controls'}).isChecked(),disabled:await page.getByRole('checkbox',{name:'Include mapped NIST controls'}).isDisabled()},nodes:data,footer:await page.locator('.flow-chart-count').innerText()});console.log(name,states.at(-1).width,states.at(-1).maxColumnGap);await writeFile(`${dir}/ux-baseline.json`,JSON.stringify({browser:await browser.version(),asset:await page.locator('script[type=module]').getAttribute('src'),states,errors},null,2));}
async function search(text){const q=page.getByRole('textbox',{name:'Search entities'});await q.fill(text);await q.press('Enter');await wait();}
try{
 await page.goto(base+'?mode=flow');await page.locator('.flow-entity').first().waitFor();await capture('01-full-fedramp');
 await page.getByRole('button',{name:'Inspect D',exact:true}).click();await capture('02-class-d-selected');await fit();await capture('03-class-d-fit');
 await search('Class B');await fit();await capture('04-class-b-search-definition');
 await search('AGU-AGC-AIP');await fit();await capture('05-rule-fit');
 await search('FRD-CCL');await fit();await capture('06-definition-fit');
 await page.getByRole('button',{name:'Back to previous selection',exact:true}).click();await capture('07-back-rule');
 await search('KSI-CNA-EIS');await fit();await capture('08-ksi-nist-off');
 await page.getByRole('button',{name:'Overview',exact:true}).click();await page.getByRole('checkbox',{name:'Include mapped NIST controls'}).check();await wait();await search('KSI-CNA-EIS');await fit();await capture('09-ksi-nist-on-disabled');
 await page.getByRole('button',{name:'Up one level',exact:true}).click();await page.getByRole('button',{name:'Up one level',exact:true}).click();await fit();await capture('10-fedramp-source-fit');
 await page.setViewportSize({width:390,height:844});await capture('11-source-mobile');
}finally{await browser.close();}
