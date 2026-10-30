import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import type {Entity,Edge} from '../data/types';
import {layout,palette,neighbors} from '../graph/model';
interface Props {nodes:Entity[];edges:Edge[];selected?:string;onSelect:(id:string)=>void;reset:number;zoom:number;reduced:boolean;labels:boolean;onFallback:()=>void}
export default function Universe({nodes,edges,selected,onSelect,reset,zoom,reduced,labels,onFallback}:Props){
 const host=useRef<HTMLDivElement>(null); const latest=useRef(onSelect);latest.current=onSelect;
 const controlsRef=useRef<OrbitControls|null>(null),cameraRef=useRef<THREE.PerspectiveCamera|null>(null);
 const focusRef=useRef<(id?:string)=>void>(()=>{});const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const el=host.current!;let renderer:THREE.WebGLRenderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x080d16,0);el.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive 3D policy graph. Drag to orbit, scroll to zoom, click a node to inspect. Use table view for keyboard navigation.');
  const scene=new THREE.Scene(); const camera=new THREE.PerspectiveCamera(45,1,1,2500);camera.position.set(0,15,550);cameraRef.current=camera;
  const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=!reduced;controls.dampingFactor=.075;controls.minDistance=15;controls.maxDistance=1100;controls.enablePan=true;controlsRef.current=controls;
  const positions=layout(nodes),related=selected?neighbors(selected,edges):null;
  const arr:number[]=[],colors:number[]=[],sizes:number[]=[];
  const hubs=['source','family','ruleset','theme','class'];
  for(const n of nodes){arr.push(...positions.get(n.id)!);const c=new THREE.Color(palette[n.kind]);if(related&&!related.has(n.id))c.multiplyScalar(.18);colors.push(c.r,c.g,c.b);sizes.push(n.id===selected?12:hubs.includes(n.kind)?10:n.kind==='enhancement'?3.5:5.5);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(arr,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('size',new THREE.Float32BufferAttribute(sizes,1));
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'attribute vec3 color; attribute float size; varying vec3 vColor; void main(){ vColor=color; vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=size*clamp(650.0/-mv.z,0.4,5.0);}',fragmentShader:'varying vec3 vColor; void main(){float r=length(gl_PointCoord-0.5)*2.0;if(r>1.0)discard;float a=exp(-r*r*3.5);gl_FragColor=vec4(vColor*(1.0+exp(-r*r*30.0)),a);}',blending:THREE.AdditiveBlending});
  const points=new THREE.Points(geometry,material);scene.add(points);
  const linePositions:number[]=[],lineColors:number[]=[];
  for(const e of edges){const a=positions.get(e.from),b=positions.get(e.to);if(!a||!b)continue;linePositions.push(...a,...b);const active=selected&&(e.from===selected||e.to===selected);const c=new THREE.Color(e.type==='PUBLISHED_CONTROL_MAPPING'?'#c885bb':'#657ea2').multiplyScalar(active?.9:selected?.025:.07);lineColors.push(c.r,c.g,c.b,c.r,c.g,c.b);}
  const lg=new THREE.BufferGeometry();lg.setAttribute('position',new THREE.Float32BufferAttribute(linePositions,3));lg.setAttribute('color',new THREE.Float32BufferAttribute(lineColors,3));const lm=new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.75,depthWrite:false});scene.add(new THREE.LineSegments(lg,lm));
  const labelsEl=document.createElement('div');labelsEl.className='graph-labels';el.appendChild(labelsEl);
  const labelNodes=nodes.filter(n=>hubs.includes(n.kind)).sort((a,b)=>hubs.indexOf(a.kind)-hubs.indexOf(b.kind));
  const labelObjects=labelNodes.map(n=>{const item=document.createElement('button');item.textContent=n.kind==='family'?(n.group+' · '+n.title):n.kind==='source'?(n.id==='nist'?'NIST SP 800-53':'FedRAMP 2026'):n.title;item.style.color=palette[n.kind];item.onclick=()=>latest.current(n.id);labelsEl.appendChild(item);return {n,item};});
  const raycaster=new THREE.Raycaster();raycaster.params.Points={threshold:2.8};let down=[0,0];
  const start=(e:PointerEvent)=>{down=[e.clientX,e.clientY];};
  const pick=(e:PointerEvent)=>{if(Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const rect=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),camera);const hit=raycaster.intersectObject(points)[0];if(hit?.index!==undefined)latest.current(nodes[hit.index].id);};
  renderer.domElement.addEventListener('pointerdown',start);renderer.domElement.addEventListener('pointerup',pick);
  const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;if(!selected&&controls.target.length()<1)camera.position.z=Math.max(550,620/camera.aspect);camera.updateProjectionMatrix();};const ro=new ResizeObserver(resize);ro.observe(el);resize();
  let target:THREE.Vector3|null=null;focusRef.current=(id)=>{const p=id?positions.get(id):undefined;if(p){target=new THREE.Vector3(...p);if(reduced){controls.target.copy(target);camera.position.copy(target).add(new THREE.Vector3(0,10,115));target=null;}}};
  if(selected)focusRef.current(selected);
  let frame=0;const render=()=>{frame=requestAnimationFrame(render);if(target){controls.target.lerp(target,.07);const goal=target.clone().add(new THREE.Vector3(0,10,115));camera.position.lerp(goal,.045);if(camera.position.distanceTo(goal)<.4)target=null;}controls.update();
   const occupied:{x:number;y:number}[]=[];for(const {n,item} of labelObjects){const p=new THREE.Vector3(...positions.get(n.id)!).project(camera);const x=(p.x*.5+.5)*el.clientWidth,y=(-p.y*.5+.5)*el.clientHeight;const collision=occupied.some(a=>Math.abs(a.x-x)<95&&Math.abs(a.y-y)<29);const show=!collision&&labels&&p.z<1&&Math.abs(p.x)<.96&&Math.abs(p.y)<.96&&(!related||related.has(n.id));if(show)occupied.push({x,y});item.style.display=show?'block':'none';item.style.transform=`translate(${(p.x*.5+.5)*el.clientWidth}px,${(-p.y*.5+.5)*el.clientHeight}px) translate(-50%,12px)`;}
   renderer.render(scene,camera);};render();
  const lost=(e:Event)=>{e.preventDefault();setFailed(true);};renderer.domElement.addEventListener('webglcontextlost',lost);
  return()=>{cancelAnimationFrame(frame);ro.disconnect();controls.dispose();geometry.dispose();material.dispose();lg.dispose();lm.dispose();renderer.dispose();renderer.domElement.remove();labelsEl.remove();controlsRef.current=null;cameraRef.current=null;};
 },[nodes,edges,selected,reduced,labels]);
 useEffect(()=>{if(reset&&cameraRef.current&&controlsRef.current){cameraRef.current.position.set(0,15,Math.max(550,620/cameraRef.current.aspect));controlsRef.current.target.set(0,0,0);}},[reset]);
 useEffect(()=>{if(zoom&&cameraRef.current&&controlsRef.current){const c=cameraRef.current,t=controlsRef.current.target;c.position.sub(t).multiplyScalar(zoom>0?.8:1.25).add(t);}},[zoom]);
 return <div className="universe" ref={host}>{failed&&<div className="webgl-fallback"><h2>Explore without WebGL</h2><p>Your browser could not render the 3D graph. Every imported entity and citation is available in the table.</p><button onClick={onFallback}>Open accessible table</button></div>}</div>;
}
