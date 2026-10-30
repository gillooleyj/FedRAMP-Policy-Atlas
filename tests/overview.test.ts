import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {overviewProjection,overviewFrame} from '../src/graph/overview';
import {placeLabels} from '../src/graph/navigation';
import type {Position} from '../src/graph/model';
describe('overview locator geometry',()=>{
 it('round-trips world positions while keeping a fixed full-map frame',()=>{
  const points:Position[]=[[-300,-100,-40],[400,200,60],[10,20,30]],map=overviewProjection(points);
  for(const p of points){const [x,y]=map.project(p);expect(x).toBeGreaterThanOrEqual(12);expect(x).toBeLessThanOrEqual(188);expect(y).toBeGreaterThanOrEqual(12);expect(y).toBeLessThanOrEqual(112);const back=map.unproject(x,y,p[2]);back.forEach((v,i)=>expect(v).toBeCloseTo(p[i]));}
 });
 it('returns finite coordinates for an empty or single-point dataset',()=>{
  for(const points of [[],[[0,0,0]]] as Position[][]){const p=overviewProjection(points);expect(p.project([0,0,0])).toEqual([100,62]);expect(p.unproject(100,62,3)).toEqual([0,0,3]);}
 });
 it.each([[0,0,500],[500,0,0],[150,250,-400]])('tracks the actual focal-plane rectangle while orbiting from %j',(x,y,z)=>{
  const camera=new THREE.PerspectiveCamera(45,1.6,.1,10000),target=new THREE.Vector3(12,-20,40);camera.position.copy(target).add(new THREE.Vector3(x,y,z));camera.lookAt(target);camera.updateMatrixWorld();
  const frame=overviewFrame(camera,target,700),expected=[[-1,1],[1,1],[1,-1],[-1,-1]];
  expect(frame.target).toEqual(target.toArray());expect(frame.zoom).toBeCloseTo(700/camera.position.distanceTo(target));
  frame.corners.forEach((p,i)=>{p.forEach(v=>expect(Number.isFinite(v)).toBe(true));const screen=new THREE.Vector3(...p).project(camera);expect(screen.x).toBeCloseTo(expected[i][0]);expect(screen.y).toBeCloseTo(expected[i][1]);});
 });
 it('shrinks the locator footprint proportionally as the camera zooms in',()=>{
  const c=new THREE.PerspectiveCamera(45,1.6,.1,10000),t=new THREE.Vector3();c.position.z=500;c.lookAt(t);const a=overviewFrame(c,t,500);c.position.z=100;const b=overviewFrame(c,t,500);
  expect(b.zoom).toBe(5);expect(b.corners[1][0]-b.corners[0][0]).toBeCloseTo((a.corners[1][0]-a.corners[0][0])/5);
 });
 it('finds a nearby free label anchor when a landmark sits beneath the locator',()=>{
  const reserved={left:16,top:88,width:202,height:196},placed=placeLabels([{id:'source',x:110,y:190,width:70,height:26,priority:2,scale:1,eligible:true}],400,600,20,new Map(),[reserved]);expect(placed).toHaveLength(1);expect(placed[0].anchor).toBeGreaterThanOrEqual(4);expect(placed[0].left).toBeGreaterThan(reserved.left+reserved.width);
 });
 it('does not send dense labels across the map to unrelated overlay boundaries',()=>{
  const c={x:600,y:250,width:180,height:26,priority:2,scale:1,eligible:true};const labels=placeLabels(Array.from({length:8},(_,i)=>({...c,id:String(i)})),1000,600,20,new Map(),[{left:16,top:88,width:202,height:196}]);expect(labels.every(p=>p.anchor<4)).toBe(true);
 });
 it('keeps labels outside the expanded locator without dropping a selected label unnecessarily',()=>{
  const reserved={left:16,top:88,width:202,height:196};const placed=placeLabels([{id:'selected',x:230,y:200,width:170,height:26,priority:0,scale:1,eligible:true}],800,600,20,new Map(),[reserved]);
  expect(placed).toHaveLength(1);expect(placed[0].left).toBeGreaterThan(reserved.left+reserved.width);
 });
});
