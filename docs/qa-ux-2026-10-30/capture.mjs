import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const dir='docs/qa-ux-2026-10-30';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1680,height:1246}}),base='http://127.0.0.1:4187/FedRAMP-Policy-Atlas/',states=[],errors=[];page.on('pageerror',e=>errors.push(String(e)));
async function capture(name){await page.waitForTimeout(850);await page.screenshot({path:`${dir}/${name}.png`,fullPage:true});states.push({name,url:page.url(),labels:await page.locator('.map-label:visible').allTextContents(),inspector:await page.locator('.entity-id').allTextContents(),footer:await page.locator('.graph-footer').innerText(),canvas:await page.locator('canvas').evaluateAll(es=>es.map(e=>({...e.dataset}))),flow:await page.locator('.react-flow__node').evaluateAll(es=>es.map(e=>({id:e.dataset.id,transform:e.style.transform}))),buttons:await page.locator('button:visible').evaluateAll(es=>es.map(e=>({text:e.textContent,label:e.getAttribute('aria-label'),disabled:e.disabled})))});console.log(name);}
try{
 await page.goto(base);await page.locator('canvas').waitFor();await capture('01-desktop-initial');
 await page.setViewportSize({width:1280,height:900});await capture('02-laptop-initial');
 await page.getByRole('combobox',{name:'Explore groups'}).selectOption('theme:CNA');await capture('03-group-selected');
 const search=page.getByRole('textbox',{name:'Search entities'});await search.fill('KSI-CNA-EIS');await page.locator('.search-results [role=option]').first().click();await capture('04-ksi-selected');
 await page.getByRole('button',{name:'Back view',exact:true}).click();await capture('05-camera-back-selection-persists');
 await page.getByRole('button',{name:'Focus neighborhood',exact:true}).click();await capture('06-focus-hidden-context');
 await page.getByRole('button',{name:'Close inspector',exact:true}).click();await capture('07-close-to-return');
 await page.goto(base+'?mode=flow&branch=classes');await page.locator('.flow-entity').first().waitFor();await page.setViewportSize({width:1680,height:1246});await capture('08-flow-classes');
 await page.getByRole('button',{name:'Inspect B',exact:true}).click();await capture('09-class-selected-moves');
 await page.getByRole('button',{name:'Show chart overview',exact:true}).click();await capture('10-chart-overview-return');
 await page.setViewportSize({width:390,height:844});await page.goto(base);await page.locator('canvas').waitFor();await capture('11-mobile-initial');
 await page.getByRole('textbox',{name:'Search entities'}).fill('KSI-CNA-EIS');await page.locator('.search-results [role=option]').first().click();await capture('12-mobile-selected');
 await page.getByRole('button',{name:'Flow chart',exact:true}).click();await page.locator('.flow-entity').first().waitFor();await capture('13-mobile-flow-selected');
 await page.getByRole('button',{name:'Close inspector',exact:true}).click();await page.getByRole('combobox',{name:'Flow chart branch'}).selectOption('theme:CNA');await capture('14-mobile-branch');
 await page.setViewportSize({width:768,height:1024});await capture('15-tablet-branch');
 await writeFile(`${dir}/baseline.json`,JSON.stringify({time:new Date().toISOString(),browser:await browser.version(),errors,states},null,2));
}finally{await browser.close();}
