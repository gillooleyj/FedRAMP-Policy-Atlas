import {readFile,writeFile,mkdir,rename,open,rm} from 'node:fs/promises';
import {dirname,join} from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import {buildGraph,hash} from './graph.mjs';
export const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.entries(v).sort(([a],[b])=>a.localeCompare(b))):v);
export async function json(path){return JSON.parse(await readFile(path,'utf8'));}
export async function atomic(path,value){await mkdir(dirname(path),{recursive:true});const tmp=path+'.'+process.pid+'.tmp';await writeFile(tmp,typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');await rename(tmp,path);}
export function validateSource(id,data,schema){const validate=addFormats(new (id==='fedramp'?Ajv2020:Ajv)({strict:false,allErrors:true})).compile(schema);if(!validate(data))throw new Error(`${id} schema validation failed: ${JSON.stringify(validate.errors).slice(0,1800)}`);}
const nodeValue=n=>({title:n.title,kind:n.kind,raw:n.raw,framework:n.framework,classes:n.classes,applicability:n.applicability,effective:n.effective,status:n.status});
const edgeKey=e=>canonical({from:e.from,to:e.to,type:e.type,applicability:e.applicability});
export function diffGraphs(before,after){
 function diff(a,b,key,value){const old=new Map(a.map(x=>[key(x),x])),next=new Map(b.map(x=>[key(x),x]));return {added:b.filter(x=>!old.has(key(x))),removed:a.filter(x=>!next.has(key(x))),changed:b.filter(x=>old.has(key(x))&&canonical(value(old.get(key(x))))!==canonical(value(x))).map(x=>({id:key(x),before:old.get(key(x)),after:x}))};}
 const nodes=diff(before.nodes,after.nodes,n=>n.id,nodeValue),edges=diff(before.edges,after.edges,edgeKey,e=>({sourceLocator:e.sourceLocator,extractionMethod:e.extractionMethod,supportingEvidence:e.supportingEvidence}));
 return {summary:{nodesAdded:nodes.added.length,nodesRemoved:nodes.removed.length,nodesChanged:nodes.changed.length,edgesAdded:edges.added.length,edgesRemoved:edges.removed.length,edgeEvidenceChanged:edges.changed.length,mappingsAdded:edges.added.filter(e=>e.type==='PUBLISHED_CONTROL_MAPPING').length,mappingsRemoved:edges.removed.filter(e=>e.type==='PUBLISHED_CONTROL_MAPPING').length},nodes,edges};
}
export function assertGraph(graph){const ids=new Set(graph.nodes.map(n=>n.id));if(!ids.size||ids.size!==graph.nodes.length)throw new Error('Empty or duplicate graph entities');if(graph.omissions.length)throw new Error(`Unresolved references (${graph.omissions.length}); review importer before promotion`);const edgeIds=new Set();for(const e of graph.edges){if(edgeIds.has(e.id)||!ids.has(e.from)||!ids.has(e.to)||e.provenanceStatus!=='verified'||!e.sourceCommit||!e.sourceLocator||!e.extractionMethod)throw new Error('Invalid graph relationship');edgeIds.add(e.id);}}
export async function withLock(root,task){const path=join(root,'public/data/.update-lock');await mkdir(dirname(path),{recursive:true});let handle;try{handle=await open(path,'wx');}catch{throw new Error('Another data operation is running; inspect .update-lock before clearing a stale lock');}try{return await task();}finally{await handle.close();await rm(path);}}
export async function activeGraph(root){let pointer;try{pointer=await json(join(root,'public/data/active.json'));}catch(e){if(e.code!=='ENOENT')throw e;return await json(join(root,'public/data/graph.json'));}if(!/^[a-f0-9]{16}$/.test(pointer.version))throw new Error('Invalid active graph pointer');const raw=await readFile(join(root,`public/data/graphs/${pointer.version}.json`),'utf8');if(hash(raw).slice(0,16)!==pointer.version)throw new Error('Active graph integrity failure');return JSON.parse(raw);}
export async function initialize(root){const graph=await activeGraph(root),encoded=JSON.stringify(graph),version=hash(encoded).slice(0,16);await atomic(join(root,`public/data/graphs/${version}.json`),encoded);try{await readFile(join(root,'public/data/active.json'));}catch(e){if(e.code!=='ENOENT')throw e;await atomic(join(root,'public/data/active.json'),{version,promotedAt:null});}try{await readFile(join(root,'public/data/updates/status.json'));}catch(e){if(e.code!=='ENOENT')throw e;await atomic(join(root,'public/data/updates/status.json'),{state:'not-checked',lastAttemptAt:null,lastSuccessfulCheckAt:null,activeVersion:version,pendingCandidate:null,schedule:'Daily workflow supplied; activation and deployment not verified'});}return {graph,version};}
export async function checkUpdates(root,{resolve,download,now=()=>new Date().toISOString()}){return withLock(root,async()=>{
 const {graph:active,version}=await initialize(root);const statusPath=join(root,'public/data/updates/status.json'),previous=await json(statusPath),checkedAt=now();
 try{
  const sources=[],datasets=[];const observed=[];
  for(const old of active.sources){
   const commit=await resolve(old.repo);if(!/^[a-f0-9]{40}$/.test(commit))throw new Error('Invalid upstream commit');observed.push({id:old.id,commit});
   if(commit===old.commit){const dir=join(root,`public/data/snapshots/${old.id}/${commit}`),bytes=await readFile(join(dir,'source.json')),schema=await readFile(join(dir,'schema.json'));if(hash(bytes)!==old.contentHash||hash(schema)!==old.schemaHash)throw new Error('Retained snapshot integrity failure');const data=JSON.parse(bytes);validateSource(old.id,data,JSON.parse(schema));sources.push(old);datasets.push(data);continue;}
   const url=`https://raw.githubusercontent.com/${old.repo}/${commit}/${old.file}`;
   // Retain upstream guidance for review; never execute remotely supplied code.
   const agent=old.id==='fedramp'?await download(`https://raw.githubusercontent.com/${old.repo}/${commit}/AGENTS.md`):null;
   const bytes=await download(url),data=JSON.parse(bytes);
   const oscal=data.catalog?.metadata?.['oscal-version'];if(old.id==='nist'&&!/^\d+\.\d+\.\d+$/.test(oscal??''))throw new Error('Missing or unsupported OSCAL version');
   const schemaUrl=old.id==='fedramp'?`https://raw.githubusercontent.com/${old.repo}/${commit}/${old.schema}`:`https://github.com/usnistgov/OSCAL/releases/download/v${oscal}/oscal_catalog_schema.json`;
   const schemaBytes=await download(schemaUrl);validateSource(old.id,data,JSON.parse(schemaBytes));
   const source={...old,commit,schemaCommit:old.id==='fedramp'?commit:undefined,url,schemaUrl,version:old.id==='fedramp'?data.info.version:data.catalog.metadata.version,retrievedAt:checkedAt,contentHash:hash(bytes),schemaHash:hash(schemaBytes),validation:'passed',...(agent?{guidanceHash:hash(agent)}:{})};
   const dir=join(root,`public/data/snapshots/${old.id}/${commit}`);await mkdir(dir,{recursive:true});
   for(const [file,content] of [['source.json',bytes],['schema.json',schemaBytes],...(agent?[['AGENTS.md',agent]]:[])]){try{const existing=await readFile(join(dir,file));if(hash(existing)!==hash(content))throw new Error('Immutable upstream snapshot changed');}catch(e){if(e.code!=='ENOENT')throw e;await writeFile(join(dir,file),content);}}
   let retained=source;try{retained=await json(join(dir,'manifest.json'));if(retained.contentHash!==source.contentHash||retained.schemaHash!==source.schemaHash)throw new Error('Immutable manifest mismatch');}catch(e){if(e.code!=='ENOENT')throw e;await atomic(join(dir,'manifest.json'),source);}sources.push(retained);datasets.push(data);
  }
  if(observed.every(s=>active.sources.find(a=>a.id===s.id).commit===s.commit)){
   const status={...previous,state:'up-to-date',lastAttemptAt:checkedAt,lastSuccessfulCheckAt:checkedAt,activeVersion:version,observedSources:observed,pendingCandidate:null,lastError:null};await atomic(statusPath,status);return status;
  }
  const graph=buildGraph(datasets[0],datasets[1].catalog,sources);assertGraph(graph);
  const encoded=JSON.stringify(graph),candidate=hash(encoded).slice(0,16),diff=diffGraphs(active,graph);
  const report={candidate,baseVersion:version,checkedAt,sources,summary:diff.summary,...diff,reviewRequired:true};
  await atomic(join(root,`public/data/graphs/${candidate}.json`),encoded);
  await atomic(join(root,`public/data/updates/reports/${candidate}.json`),report);
  const status={...previous,state:'pending-review',lastAttemptAt:checkedAt,lastSuccessfulCheckAt:checkedAt,activeVersion:version,observedSources:observed,pendingCandidate:candidate,reportUrl:`/data/updates/reports/${candidate}.json`,summary:diff.summary,lastError:null};
  await atomic(statusPath,status);return status;
 }catch(error){await atomic(statusPath,{...previous,state:'failed',lastAttemptAt:checkedAt,activeVersion:version,lastError:error.message});throw error;}
});}
export async function promote(root,candidate,expected,{now=()=>new Date().toISOString()}={}){if(!/^[a-f0-9]{16}$/.test(candidate)||!/^[a-f0-9]{16}$/.test(expected??''))throw new Error('Supply candidate and expected active version (16 hex characters)');return withLock(root,async()=>{
 const {graph:current,version}=await initialize(root);if(version!==expected)throw new Error('Active graph changed; rerun check and review');
 const report=await json(join(root,`public/data/updates/reports/${candidate}.json`));if(report.baseVersion!==version||report.candidate!==candidate)throw new Error('Candidate is based on another active graph');
 const raw=await readFile(join(root,`public/data/graphs/${candidate}.json`),'utf8');if(hash(raw).slice(0,16)!==candidate)throw new Error('Candidate graph hash mismatch');const graph=JSON.parse(raw),datasets=[];
 for(const s of graph.sources){const dir=join(root,`public/data/snapshots/${s.id}/${s.commit}`),bytes=await readFile(join(dir,'source.json')),schema=await readFile(join(dir,'schema.json'));if(hash(bytes)!==s.contentHash||hash(schema)!==s.schemaHash)throw new Error('Candidate snapshot integrity failure');const data=JSON.parse(bytes);validateSource(s.id,data,JSON.parse(schema));datasets.push(data);}
 const rebuilt=buildGraph(datasets[0],datasets[1].catalog,graph.sources);assertGraph(rebuilt);if(JSON.stringify(rebuilt)!==raw)throw new Error('Candidate differs from validated source transform');
 if(canonical(diffGraphs(current,graph))!==canonical({summary:report.summary,nodes:report.nodes,edges:report.edges}))throw new Error('Review report differs from candidate');
 const promotedAt=now();await atomic(join(root,'public/data/graph.json'),raw); // Compatibility copy; active.json is the authoritative atomic switch.
 await atomic(join(root,'public/data/active.json'),{version:candidate,previousVersion:version,promotedAt});
 const previous=await json(join(root,'public/data/updates/status.json'));await atomic(join(root,'public/data/updates/status.json'),{...previous,state:'promoted',activeVersion:candidate,pendingCandidate:null,promotedAt,lastError:null});return {version:candidate,previousVersion:version,promotedAt};
});}
