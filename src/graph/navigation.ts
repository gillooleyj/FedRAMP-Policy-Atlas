import type {Kind} from '../data/types';
import type {Position} from './model';
export const hubKinds=new Set<Kind>(['source','family','ruleset','theme','class']);
export const relationshipNames:Record<string,string>={PUBLISHED_CONTROL_MAPPING:'Published mappings',DEFINED_BY:'Definitions',APPLIES_TO:'Class applicability',CONTAINS:'Containment'};
export function fittedBounds(points:Position[],aspect:number,fov=45){
 if(!points.length)return null;
 const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];
 for(const p of points)for(let i=0;i<3;i++){min[i]=Math.min(min[i],p[i]);max[i]=Math.max(max[i],p[i]);}
 const center=min.map((v,i)=>(v+max[i])/2) as Position;
 const radius=Math.max(8,...points.map(p=>Math.hypot(...p.map((v,i)=>v-center[i]))));
 const vertical=fov*Math.PI/360,horizontal=Math.atan(Math.tan(vertical)*Math.max(.1,aspect));
 return {center,radius,distance:radius/Math.sin(Math.min(vertical,horizontal)) *1.2};
}
export interface LabelCandidate {id:string;x:number;y:number;width:number;height:number;priority:number;scale:number;eligible:boolean}
export interface PlacedLabel {id:string;left:number;top:number;width:number;height:number;anchor:number}
export function placeLabels(candidates:LabelCandidate[],width:number,height:number,budget=65,previousAnchors:Map<string,number>=new Map()):PlacedLabel[]{
 const placed:PlacedLabel[]=[];
 const sorted=candidates.filter(c=>c.eligible).sort((a,b)=>a.priority-b.priority||b.scale-a.scale||a.id.localeCompare(b.id));
 for(const c of sorted){if(placed.length>=budget)break;
  const anchors=[[c.x+12,c.y-c.height/2],[c.x-c.width-12,c.y-c.height/2],[c.x-c.width/2,c.y-c.height-12],[c.x-c.width/2,c.y+12]];
  if(c.priority===0)anchors.push([Math.max(8,Math.min(width-c.width-8,c.x-c.width/2)),Math.max(66,Math.min(height-125-c.height,c.y-c.height-12))]);
  const previous=previousAnchors.get(c.id);const order=anchors.map((_,i)=>i);if(previous!==undefined&&previous<anchors.length)order.sort((a,b)=>(a===previous?-1:b===previous?1:a-b));
  for(const anchor of order){const [left,top]=anchors[anchor];if(left<8||top<66||left+c.width>width-8||top+c.height>height-125)continue;
   const box={id:c.id,left,top,width:c.width,height:c.height,anchor};
   if(placed.some(p=>left<p.left+p.width+5&&left+c.width+5>p.left&&top<p.top+p.height+4&&top+c.height+4>p.top))continue;
   placed.push(box);break;
  }
 }
 return placed;
}
/** Hover never changes layout priority: it must not displace the label under the pointer. */
export function labelPriority(id:string,kind:Kind,selected:string|undefined,related:Set<string>|null){
 return id===selected?0:related?.has(id)?1:hubKinds.has(kind)?2:3;
}
export type LabelLevel='sources'|'groups'|'details';
/** Distinct zoom bands with hysteresis; fast zooms can cross multiple levels. */
export function labelLevel(distance:number,overviewDistance:number,previous:LabelLevel):LabelLevel{
 const ratio=distance/overviewDistance;
 if(ratio<(previous==='details'?.56:.46))return 'details';
 if(ratio<(previous==='sources'?.84:.94))return 'groups';
 return 'sources';
}
export function labelKindVisible(kind:Kind,level:LabelLevel){
 return level==='sources'?kind==='source':level==='groups'?hubKinds.has(kind)&&kind!=='source':!hubKinds.has(kind);
}
export function labelBudget(level:LabelLevel,mobile:boolean,selected:boolean){
 return selected?(mobile?12:24):level==='sources'?2:level==='groups'?(mobile?5:10):(mobile?8:18);
}
export function canonicalView(points:Position[],aspect:number){
 const bounds=fittedBounds(points,aspect);if(!bounds)return null;
 return {target:bounds.center,position:[bounds.center[0],bounds.center[1],bounds.center[2]+bounds.distance] as Position};
}
