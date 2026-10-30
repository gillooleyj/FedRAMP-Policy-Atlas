import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {fittedBounds,placeLabels,labelPriority,type LabelCandidate} from '../src/graph/navigation';
import {layout,neighbors} from '../src/graph/model';
import type {Graph} from '../src/data/types';
const graph:Graph=JSON.parse(readFileSync('public/data/graph.json','utf8'));
describe('navigation camera fitting and labels',()=>{
 it.each([.65,1,1.6])('fits every actual selected-neighborhood endpoint at aspect %s',(aspect)=>{
  const positions=layout(graph.nodes),ids=neighbors('fr:KSI-CNA-EIS',graph.edges),points=[...ids].map(id=>positions.get(id)!);expect(points).toHaveLength(17);
  const bounds=fittedBounds(points,aspect)!;
  for(const direction of [new THREE.Vector3(0,0,1),new THREE.Vector3(1,.7,1).normalize()]){
   const camera=new THREE.PerspectiveCamera(45,aspect,.1,10000);camera.position.set(...bounds.center).addScaledVector(direction,bounds.distance);camera.lookAt(new THREE.Vector3(...bounds.center));camera.updateMatrixWorld();
   for(const point of points){const p=new THREE.Vector3(...point).project(camera);expect(Math.abs(p.x)).toBeLessThan(.84);expect(Math.abs(p.y)).toBeLessThan(.84);expect(p.z).toBeLessThan(1);}
  }
 });
 it('handles empty and single-entity views without invalid bounds',()=>{expect(fittedBounds([],1)).toBeNull();const fit=fittedBounds([[1,2,3]],1)!;expect(fit.center).toEqual([1,2,3]);expect(fit.distance).toBeGreaterThan(8);expect(Number.isFinite(fit.distance)).toBe(true);});
 it('prioritizes selection, hover and direct neighbors before context labels',()=>{expect(labelPriority('selected','ksi','selected','hovered',new Set())).toBe(0);expect(labelPriority('hovered','control','selected','hovered',null)).toBe(1);expect(labelPriority('neighbor','enhancement','selected',undefined,new Set(['neighbor']))).toBe(2);expect(labelPriority('hub','family',undefined,undefined,null)).toBe(3);expect(labelPriority('leaf','rule',undefined,undefined,null)).toBe(4);});
 it('measures collisions, tries alternative anchors, and retains selected labels before hubs',()=>{const base={x:240,y:200,width:140,height:39,scale:8,eligible:true};const candidates:LabelCandidate[]=[{...base,id:'hub',priority:3},{...base,id:'selected',priority:0}];const placed=placeLabels(candidates,800,560);expect(placed.map(x=>x.id)).toEqual(['selected','hub']);expect(placed[0].left).not.toBe(placed[1].left);});
 it('does not overlap labels or place them over reserved navigation regions',()=>{const candidates=Array.from({length:100},(_,i)=>({id:String(i),x:130+(i%10)*25,y:140+Math.floor(i/10)*25,width:100,height:39,priority:i?4:0,scale:8,eligible:true}));const labels=placeLabels(candidates,800,560,30);expect(labels.length).toBeGreaterThan(2);expect(labels.length).toBeLessThanOrEqual(30);expect(labels[0].id).toBe('0');for(let i=0;i<labels.length;i++){const a=labels[i];expect(a.top).toBeGreaterThanOrEqual(42);expect(a.top+a.height).toBeLessThanOrEqual(435);for(const b of labels.slice(i+1)){expect(a.left<b.left+b.width&&a.left+a.width>b.left&&a.top<b.top+b.height&&a.top+a.height>b.top).toBe(false);}}});
 it('keeps a selected label clear of navigation controls even near the lower edge',()=>{const labels=placeLabels([{id:'selected',x:300,y:505,width:140,height:39,priority:0,scale:8,eligible:true}],800,560);expect(labels).toHaveLength(1);expect(labels[0].top+labels[0].height).toBeLessThanOrEqual(435);});
 it('only places eligible labels and breaks ties deterministically',()=>{const base={x:300,y:200,width:140,height:39,scale:8,priority:4,eligible:true};expect(placeLabels([{...base,id:'hidden',eligible:false}],800,560)).toEqual([]);const a=[{...base,id:'b'},{...base,id:'a'}];expect(placeLabels(a,800,560)).toEqual(placeLabels([...a].reverse(),800,560));});
});
