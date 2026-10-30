// Stage a reviewed importer correction from the active immutable snapshots.
// Does not activate the candidate or claim a new upstream freshness check.
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join} from 'node:path';
import {initialize,withLock,atomic,validateSource,assertGraph,diffGraphs} from './update-core.mjs';
import {buildGraph,hash} from './graph.mjs';
const root=fileURLToPath(new URL('../',import.meta.url));
await withLock(root,async()=>{
 const {graph:active,version}=await initialize(root),datasets=[];
 for(const s of active.sources){const dir=join(root,`public/data/snapshots/${s.id}/${s.commit}`),bytes=await readFile(join(dir,'source.json')),schema=await readFile(join(dir,'schema.json'));if(hash(bytes)!==s.contentHash||hash(schema)!==s.schemaHash)throw new Error('Snapshot integrity failure');const data=JSON.parse(bytes);validateSource(s.id,data,JSON.parse(schema));datasets.push(data);}
 const graph=buildGraph(datasets[0],datasets[1].catalog,active.sources);assertGraph(graph);
 const encoded=JSON.stringify(graph),candidate=hash(encoded).slice(0,16),diff=diffGraphs(active,graph);
 if(candidate===version){console.log('Active graph already matches the importer');return;}
 await atomic(join(root,`public/data/graphs/${candidate}.json`),encoded);
 await atomic(join(root,`public/data/updates/reports/${candidate}.json`),{candidate,baseVersion:version,reason:'Importer correction using unchanged pinned sources',createdAt:new Date().toISOString(),sources:graph.sources,...diff,reviewRequired:true});
 console.log(JSON.stringify({candidate,baseVersion:version,...diff.summary},null,2));
});
