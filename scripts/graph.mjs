import { createHash } from 'node:crypto';
export const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
export const pointer = (...parts) => '/' + parts.map(p => String(p).replaceAll('~','~0').replaceAll('/','~1')).join('/');
export function buildGraph(rules, catalog, sources) {
 const nodes=[], edges=[], omissions=[]; const ids=new Set();
 const source = id => sources.find(s=>s.id===id);
 function node(id,title,kind,sourceId,locator,raw={},context={}) {
  if(ids.has(id)) throw new Error(`Duplicate node ${id}`); ids.add(id);
  const s=source(sourceId);
  const n={id,title,kind,sourceId,sourceVersion:s.version,sourceCommit:s.commit,sourceUrl:s.url,sourceLocator:locator,retrievedAt:s.retrievedAt,contentHash:hash(raw),status:context.status??'unknown',raw,...context};nodes.push(n);return n;
 }
 function edge(from,to,type,sourceId,locator,extra={}) {
  const s=source(sourceId); const e={from,to,type,provenanceStatus:'verified',sourceId,sourceVersion:s.version,sourceCommit:s.commit,sourceUrl:s.url,sourceLocator:locator,extractionMethod:'Explicit JSON structure',...extra};
  e.id=hash(e).slice(0,24); if(edges.some(x=>x.id===e.id)) throw new Error('Duplicate relationship'); edges.push(e);
 }
 node('fedramp',rules.info.title,'source','fedramp','/info',rules.info);
 node('nist',catalog.metadata.title,'source','nist','/catalog/metadata',catalog.metadata);
 function controls(list,parent,path) { for(let i=0;i<(list??[]).length;i++) { const c=list[i],p=path+'/'+i;
  node('nist:'+c.id,c.title,c.id.includes('.')?'enhancement':'control','nist',p,c,{sourceIdentifier:c.id,group:c.id.split('-')[0].toUpperCase()});
  edge(parent,'nist:'+c.id,'CONTAINS','nist',p); controls(c.controls,'nist:'+c.id,p+'/controls');
 }}
 for(const [i,g] of (catalog.groups??[]).entries()) {const id='nist:'+g.id;node(id,g.title,'family','nist',`/catalog/groups/${i}`,{id:g.id,title:g.title},{group:g.id.toUpperCase()});edge('nist',id,'CONTAINS','nist',`/catalog/groups/${i}`);controls(g.controls,id,`/catalog/groups/${i}/controls`);}
 for(const [bucket,defs] of Object.entries(rules.FRD.data)) for(const [id,v] of Object.entries(defs)) {
  const p=pointer('FRD','data',bucket,id); node('fr:'+id,v.term,'definition','fedramp',p,v,{sourceIdentifier:id,framework:bucket,group:'Definitions',status:rules.FRD.info.status,effective:rules.FRD.info.effective});edge('fedramp','fr:'+id,'CONTAINS','fedramp',p);
 }
 for(const cls of ['A','B','C','D']) {node('class:'+cls,'Class '+cls,'class','fedramp','/FRD/data/all/FRD-CCL',rules.FRD.data.all['FRD-CCL'],{group:'Certification classes',sourceIdentifier:cls,description:'Named certification class. Availability and applicability must be checked against process status and dates.'});edge('class:'+cls,'fr:FRD-CCL','DEFINED_BY','fedramp','/FRD/data/all/FRD-CCL/definition',{extractionMethod:'Class name explicitly enumerated in definition'});}
 for(const [process,doc] of Object.entries(rules.FRR)) {
  const parent='ruleset:'+process;node(parent,doc.info.name,'ruleset','fedramp',pointer('FRR',process,'info'),doc.info,{group:'FedRAMP rules',status:doc.info.status,effective:doc.info.effective});edge('fedramp',parent,'CONTAINS','fedramp',pointer('FRR',process));
  for(const [bucket,subsets] of Object.entries(doc.data)) for(const [subset,entries] of Object.entries(subsets)) {
   const meta=doc.info[bucket]?.subsets?.[subset]??doc.info.subsets?.[subset]??{};
   const effective=doc.info[bucket]?.effective??doc.info.effective;
   const sid=`subset:${process}:${bucket}:${subset}`,sp=pointer('FRR',process,'data',bucket,subset);
   node(sid,meta.name??subset,'subset','fedramp',sp,meta,{framework:bucket,group:process,applicability:meta.applicability,status:doc.info.status,effective});edge(parent,sid,'CONTAINS','fedramp',sp);
   for(const [id,v] of Object.entries(entries)) {
    const p=pointer('FRR',process,'data',bucket,subset,id); const classes=meta.applicability?.classes??[];
    node('fr:'+id,v.name,'rule','fedramp',p,v,{sourceIdentifier:id,group:process,framework:bucket,status:doc.info.status,applicability:meta.applicability,effective,classes});edge(sid,'fr:'+id,'CONTAINS','fedramp',p);
    for(const cls of classes) {
     const specific=doc.info[bucket]?.subsets?.[subset] ? ['FRR',process,'info',bucket,'subsets',subset] : ['FRR',process,'info','subsets',subset];
     edge('fr:'+id,'class:'+cls,'APPLIES_TO','fedramp',pointer(...specific,'applicability','classes'),{applicability:{...meta.applicability,framework:bucket},extractionMethod:'Inherited explicit subset applicability; entry and class wording retained'});
    }
   }
  }
 }
 for(const [theme,v] of Object.entries(rules.KSI)) {
  const parent='theme:'+theme;node(parent,v.name,'theme','fedramp',pointer('KSI',theme),{...v,indicators:undefined},{group:'Key Security Indicators',status:v.status});edge('fedramp',parent,'CONTAINS','fedramp',pointer('KSI',theme));
  for(const [id,k] of Object.entries(v.indicators)) {
   const p=pointer('KSI',theme,'indicators',id);node('fr:'+id,k.name,'ksi','fedramp',p,k,{sourceIdentifier:id,group:theme,status:v.status,framework:'20x',classes:Object.keys(k.varies_by_class??{}).map(x=>x.toUpperCase())});edge(parent,'fr:'+id,'CONTAINS','fedramp',p);
   function mappings(cs,path,cls) {for(const [i,c] of (cs??[]).entries()) {if(!ids.has('nist:'+c)) {omissions.push({id,control:c,locator:path+'/'+i,reason:'Control not found in pinned NIST catalog'});continue;}edge('fr:'+id,'nist:'+c,'PUBLISHED_CONTROL_MAPPING','fedramp',path+'/'+i,{extractionMethod:'Exact published OSCAL control identifier',applicability:cls?{classes:[cls.toUpperCase()]}:{scope:'Common indicator mapping; no class scope inferred'}});}}
   mappings(k.controls,p+'/controls');for(const [cls,variant] of Object.entries(k.varies_by_class??{})) mappings(variant.controls,p+'/varies_by_class/'+cls+'/controls',cls);
  }
 }
 const terms=new Map();for(const n of nodes.filter(n=>n.kind==='definition')) for(const t of [n.raw.term,...(n.raw.alts??[])]) {if(!terms.has(t)) terms.set(t,[]);if(!terms.get(t).includes(n)) terms.get(t).push(n);}
 for(const n of nodes.filter(n=>['rule','ksi'].includes(n.kind))) for(const [i,t] of (n.raw.terms??[]).entries()) {const matches=(terms.get(t)??[]).filter(x=>x.framework==='all'||x.framework===n.framework);if(matches.length===1)edge(n.id,matches[0].id,'DEFINED_BY','fedramp',n.sourceLocator+'/terms/'+i,{extractionMethod:'Exact unique controlled term match'});else omissions.push({id:n.id,term:t,reason:'Missing or ambiguous controlled term'});}
 for(const e of edges) if(!ids.has(e.from)||!ids.has(e.to)) throw new Error('Dangling relationship');
 return {schemaVersion:1,sources,nodes,edges,omissions,coverage:{CTL:'Not imported: FedRAMP control guidance is distinct from the NIST catalog',baselines:'Not imported',history:'Source snapshots retained; legal chronology not imported',classes:'Names and explicit rule applicability only; no certification availability inferred'}};
}
