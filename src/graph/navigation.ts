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
export interface PlacedLabel {id:string;left:number;top:number;width:number;height:number}
export function placeLabels(candidates:LabelCandidate[],width:number,height:number,budget=65):PlacedLabel[]{
 const placed:PlacedLabel[]=[];
 const sorted=candidates.filter(c=>c.eligible).sort((a,b)=>a.priority-b.priority||b.scale-a.scale||a.id.localeCompare(b.id));
 for(const c of sorted){if(placed.length>=budget)break;
  const anchors=[[c.x+12,c.y-c.height/2],[c.x-c.width-12,c.y-c.height/2],[c.x-c.width/2,c.y-c.height-12],[c.x-c.width/2,c.y+12]];
  if(c.priority===0)anchors.push([Math.max(8,Math.min(width-c.width-8,c.x-c.width/2)),Math.max(42,Math.min(height-125-c.height,c.y-c.height-12))]);
  for(const [left,top] of anchors){if(left<8||top<42||left+c.width>width-8||top+c.height>height-125)continue;
   const box={id:c.id,left,top,width:c.width,height:c.height};
   if(placed.some(p=>left<p.left+p.width+5&&left+c.width+5>p.left&&top<p.top+p.height+4&&top+c.height+4>p.top))continue;
   placed.push(box);break;
  }
 }
 return placed;
}
export function labelPriority(id:string,kind:Kind,selected:string|undefined,hovered:string|undefined,related:Set<string>|null){
 return id===selected?0:id===hovered?1:related?.has(id)?2:hubKinds.has(kind)?3:4;
}
