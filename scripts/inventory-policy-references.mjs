// A review inventory of literal mentions, not a legal authority or mapping extractor.
import {readFile,writeFile} from 'node:fs/promises';
const active=JSON.parse(await readFile('public/data/active.json','utf8'));
const graph=JSON.parse(await readFile(`public/data/graphs/${active.version}.json`,'utf8'));
const source=graph.sources.find(s=>s.id==='fedramp');
const raw=JSON.parse(await readFile(`public/data/snapshots/fedramp/${source.commit}/source.json`,'utf8'));
const patterns=[['FedRAMP Authorization Act',/\bFedRAMP Authorization Act\b/i],['OMB M-24-15',/\bM-24-15\b/i],['OMB Circular A-130',/\b(?:OMB\s+(?:Circular\s+)?)?A-130\b/i],['Title 44 USC chapter/section 35 (requires resolution)',/\b44\s+USC\s+§?\s*35\b/i],['FIPS 200',/\bFIPS[- ]200\b/i],['FISMA',/\bFISMA\b/i]];
const mentions=[];
function visit(value,pointer=''){
 if(typeof value==='string')for(const [document,pattern] of patterns)if(pattern.test(value))mentions.push({document,sourceLocator:pointer,wording:value});
 if(value&&typeof value==='object')for(const [key,child] of Object.entries(value))visit(child,pointer+'/'+key.replaceAll('~','~0').replaceAll('/','~1'));
}
visit(raw);
const inventory={purpose:'Literal mentions for source-ingestion review; no verified external-document relationships emitted.',activeGraph:active.version,source,mentions};
await writeFile('docs/policy-reference-inventory.json',JSON.stringify(inventory,null,2)+'\n');
console.log(`${mentions.length} literal mentions across ${new Set(mentions.map(m=>m.document)).size} document targets. No graph data changed.`);
