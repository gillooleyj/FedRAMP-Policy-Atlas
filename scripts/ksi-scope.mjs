// Scope comes from governing process rules, never from the mere presence of wording variants.
export function ksiScopes(rules) {
 const aPath='/FRR/FRC/data/all/CLA/FRC-CLA-MFR', allPath='/FRR/FRC/data/20x/CSX/FRC-CSX-MAS';
 const a=rules.FRR?.FRC?.data?.all?.CLA?.['FRC-CLA-MFR'], all=rules.FRR?.FRC?.data?.['20x']?.CSX?.['FRC-CSX-MAS'];
 const expectedA='Providers seeking a Class A FedRAMP Certification MUST address all rules in this FedRAMP Class A Certification subset (FRC-CLA) AND the following additional FedRAMP Class A rules; the appropriate artifacts or information mapping for all rules MUST be supplied in the FedRAMP Certification Package.';
 const expectedAll='Providers SHOULD apply ALL Key Security Indicators to ALL aspects of their cloud service offering that are within the FedRAMP Minimum Assessment Scope.';
 if(a?.statement!==expectedA||a.force!=='MUST'||all?.statement!==expectedAll||all.force!=='SHOULD')throw new Error('KSI class-scope governing wording changed; review extraction before promotion');
 const aMeta=rules.FRR.FRC.info.subsets.CLA.applicability, allMeta=rules.FRR.FRC.info['20x'].subsets.CSX.applicability;
 if(JSON.stringify(aMeta.classes)!=='["A"]'||JSON.stringify(allMeta.classes)!=='["B","C","D"]')throw new Error('KSI governing class scope changed; review extraction');
 const indicators=new Map(Object.values(rules.KSI).flatMap(t=>Object.entries(t.indicators)));
 const named=new Map();
 for(const [i,text] of a.following_information.entries())if(text.startsWith('Key Security Indicators:')){
  const id=/^Key Security Indicators: (KSI-[A-Z]+-[A-Z]+) \(/.exec(text)?.[1];
  if(!id||!indicators.has(id)||!a.related.includes(id)||named.has(id))throw new Error('Unresolved or duplicate named Class A KSI');
  named.set(id,{locator:aPath+'/following_information/'+i,quote:text});
 }
 if(!named.size)throw new Error('No explicit Class A KSI references');
 const evidence=(label,locator,value)=>({label,locator,value});
 return (id,k,p)=>[...(named.has(id)?['A']:[]),...allMeta.classes].map(cls=>{
  const isA=cls==='A', rule=isA?a:all, path=isA?aPath:allPath, meta=isA?aMeta:allMeta;
  const variant=k.varies_by_class?.[cls.toLowerCase()];
  const statementKind=k.varies_by_class?(variant?.statement?'class-specific':'missing-class-specific'):'common';
  const statement=variant?.statement??(!k.varies_by_class?k.statement:undefined);
  const effective=rules.FRR.FRC.info['20x'].effective;
  return {cls,locator:isA?named.get(id).locator:path+'/statement',applicability:{...meta,classes:[cls],framework:'20x',processRule:isA?'FRC-CLA-MFR':'FRC-CSX-MAS',processForce:rule.force,scope:isA?'Explicitly named Class A indicator':'All KSIs within Minimum Assessment Scope',statementKind,...(statement?.startsWith('**Optional:**')?{statementQualifier:'Optional'}:{}),effective},supportingEvidence:[
   ...(isA?[evidence('Named indicator',named.get(id).locator,named.get(id).quote)]:[]),
   evidence('Governing process statement',path+'/statement',rule.statement),evidence('Process force (not an indicator force)',path+'/force',rule.force),
   evidence('Process applicability',isA?'/FRR/FRC/info/subsets/CLA/applicability':'/FRR/FRC/info/20x/subsets/CSX/applicability',meta),
   evidence('Inherited 20x effective metadata','/FRR/FRC/info/20x/effective',effective),
   ...(isA?[evidence('Class A scope note',aPath+'/notes/2',a.notes[2])]:[]),
   ...(statement?[evidence('Indicator wording',p+(statementKind==='common'?'/statement':'/varies_by_class/'+cls.toLowerCase()+'/statement'),statement)]:[])
  ]};
 });
}
