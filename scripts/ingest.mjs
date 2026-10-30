import {readFile,mkdir,writeFile,access} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {atomic,withLock} from './update-core.mjs';
import {execFileSync} from 'node:child_process';
import Ajv2020 from 'ajv/dist/2020.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {sources as initialPins} from './sources.mjs';
import {buildGraph,hash} from './graph.mjs';
const root=new URL('../',import.meta.url);
await withLock(fileURLToPath(root),async()=>{
let pins=initialPins;
try {const active=JSON.parse(await readFile(new URL('public/data/active.json',root),'utf8'));if(!/^[a-f0-9]{16}$/.test(active.version))throw new Error('Invalid active version');const raw=await readFile(new URL(`public/data/graphs/${active.version}.json`,root),'utf8');if(hash(raw).slice(0,16)!==active.version)throw new Error('Active graph integrity failure');pins=JSON.parse(raw).sources;} catch(error){if(error.code!=='ENOENT')throw error;}
const fetchMode=process.argv.includes('--fetch');
const sources=[];const datasets=[];
for(const pin of pins) {
 const dir=new URL(`public/data/snapshots/${pin.id}/${pin.commit}/`,root);await mkdir(dir,{recursive:true});
 const url=`https://raw.githubusercontent.com/${pin.repo}/${pin.commit}/${pin.file}`;
 const schemaUrl=pin.schemaUrl??`https://raw.githubusercontent.com/${pin.schemaRepo}/${pin.schemaCommit}/${pin.schema}`;
 let manifest;try {manifest=JSON.parse(await readFile(new URL('manifest.json',dir),'utf8'));}catch{/* Initial fetch requires explicit flag. */}
 for(const [file,remote] of [['source.json',url],['schema.json',schemaUrl]]) {
  const path=new URL(file,dir);if(fetchMode) {const bytes=execFileSync('curl',['--fail','--location','--silent','--show-error',remote],{maxBuffer:50*1024*1024}); if(manifest && hash(bytes)!==manifest[file==='source.json'?'contentHash':'schemaHash'])throw new Error('Immutable snapshot hash mismatch');await writeFile(path,bytes);} else await access(path);
 }
 const bytes=await readFile(new URL('source.json',dir)),schemaBytes=await readFile(new URL('schema.json',dir));
 if(manifest&&(hash(bytes)!==manifest.contentHash||hash(schemaBytes)!==manifest.schemaHash))throw new Error('Snapshot integrity failure');
 const data=JSON.parse(bytes),schema=JSON.parse(schemaBytes);
 const ajv=addFormats(new (pin.id==='fedramp'?Ajv2020:Ajv)({strict:false,allErrors:true}));
 const validate=ajv.compile(schema);if(!validate(data)) {await writeFile(new URL('validation-errors.json',dir),JSON.stringify(validate.errors,null,2));throw new Error(`${pin.id} schema validation failed`);}
 const s={...pin,url,schemaUrl,version:pin.id==='fedramp'?data.info.version:data.catalog.metadata.version,retrievedAt:manifest?.retrievedAt??new Date().toISOString(),contentHash:hash(bytes),schemaHash:hash(schemaBytes),validation:'passed'};
 await writeFile(new URL('manifest.json',dir),JSON.stringify(s,null,2)+'\n');sources.push(s);datasets.push(data);
}
const graph=buildGraph(datasets[0],datasets[1].catalog,sources);
const encoded=JSON.stringify(graph);const version=hash(encoded).slice(0,16);
await mkdir(new URL('public/data/graphs/',root),{recursive:true});
await atomic(fileURLToPath(new URL(`public/data/graphs/${version}.json`,root)),encoded);
await atomic(fileURLToPath(new URL('public/data/graph.json',root)),encoded);
const counts=field=>Object.fromEntries([...new Set(field.map(x=>x[0]))].sort().map(k=>[k,field.filter(x=>x[0]===k).length]));
const report={graphVersion:version,sources,nodeCount:graph.nodes.length,edgeCount:graph.edges.length,nodesByKind:counts(graph.nodes.map(n=>[n.kind])),edgesByType:counts(graph.edges.map(e=>[e.type])),omissions:graph.omissions,coverage:graph.coverage};
await mkdir(new URL('docs/',root),{recursive:true});await writeFile(new URL('docs/import-report.json',root),JSON.stringify(report,null,2)+'\n');
await writeFile(new URL('docs/import-report.md',root),`# Import report\n\nGraph snapshot: ${version}\n\n${sources.map(s=>`- ${s.id}: ${s.version}, commit ${s.commit}, retrieved ${s.retrievedAt}; JSON Schema validation passed. [Source](${s.url})`).join('\n')}\n\n${report.nodeCount} nodes; ${report.edgeCount} verified relationships.\n\n\`\`\`json\n${JSON.stringify({nodesByKind:report.nodesByKind,edgesByType:report.edgesByType},null,2)}\n\`\`\`\n\n${graph.omissions.length} unresolved references retained in import-report.json.\n\n${Object.entries(graph.coverage).map(([k,v])=>`- ${k}: ${v}`).join('\n')}\n\nPublished mappings indicate associations, never equivalence or compliance satisfaction. No legal, OMB, historical, or publication-reference edges are inferred. Source update logs are retained, but do not substitute for importing historical revisions.\n`);
console.log(JSON.stringify({version,nodes:graph.nodes.length,edges:graph.edges.length,omissions:graph.omissions.length}));

});
