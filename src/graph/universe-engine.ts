import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import type {Entity,Edge} from '../data/types';
import {palette,neighbors,type Position} from './model';
import {fittedBounds,hubKinds,labelPriority,placeLabels,type LabelCandidate,relationshipNames} from './navigation';
interface CameraFrame {position:THREE.Vector3;target:THREE.Vector3}
interface Label {node:Entity;element:HTMLButtonElement;width:number;height:number}
export class UniverseEngine {
 private renderer:THREE.WebGLRenderer;
 private scene=new THREE.Scene();
 private camera=new THREE.PerspectiveCamera(45,1,.1,10000);
 private controls:OrbitControls;
 private points:THREE.Points;
 private lines:THREE.LineSegments;
 private ring:THREE.Mesh;
 private labelLayer=document.createElement('div');
 private labelObjects=new Map<string,Label>();
 private edgeLayer=document.createElement('div');
 private edgeLabels:{edge:Edge;element:HTMLButtonElement}[]=[];
 private returnLabel=document.createElement('button');
 private nodes:Entity[]=[];
 private edges:Edge[]=[];
 private selected?:string;
 private hovered?:string;
 private related:Set<string>|null=null;
 private labels=true;
 private reduced=false;
 private mode:'pan'|'orbit'='pan';
 private visibleLabelIds=new Set<string>();
 private raf=0;
 private resizeObserver:ResizeObserver;
 private pointer=new THREE.Vector2();
 private raycaster=new THREE.Raycaster();
 private down:[number,number]=[0,0];
 private dragging=false;
 private history:CameraFrame[]=[];
 private animation:{from:CameraFrame;to:CameraFrame;start:number}|null=null;
 private onHistory:(available:boolean)=>void;
 private onSelect:(id:string)=>void;
 private onEdge:(edge:Edge)=>void;
 private callbacks:()=>void;
 private lastLabelDraw=0;
 private fitPending=false;
 private initialized=false;
 private activeEdge='';
 constructor(private host:HTMLDivElement,private positions:Map<string,Position>,allNodes:Entity[],onSelect:(id:string)=>void,onEdge:(edge:Edge)=>void,onHistory:(available:boolean)=>void,onFailure:()=>void){
  this.onSelect=onSelect;this.onEdge=onEdge;this.onHistory=onHistory;
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.setClearColor(0x080d16,0);
  const canvas=this.renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','Interactive policy map. Drag to pan, right-drag to orbit, scroll to zoom. Arrow keys pan; plus and minus zoom; F fits connections; Home fits all; Escape returns to the previous view.');
  host.appendChild(canvas);this.renderer.setSize(host.clientWidth,host.clientHeight);this.camera.aspect=host.clientWidth/Math.max(1,host.clientHeight);this.camera.updateProjectionMatrix();this.camera.position.set(0,0,650);
  this.controls=new OrbitControls(this.camera,canvas);this.controls.screenSpacePanning=true;this.controls.zoomToCursor=true;this.controls.enableDamping=true;this.controls.dampingFactor=.12;this.controls.minDistance=12;this.controls.maxDistance=5000;this.controls.maxPolarAngle=Math.PI*.94;this.controls.minPolarAngle=Math.PI*.06;
  this.setMode('pan');
  this.points=new THREE.Points(new THREE.BufferGeometry(),new THREE.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'attribute vec3 color; attribute float size; varying vec3 vColor; void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=size*clamp(650.0/-mv.z,0.4,5.0);}',fragmentShader:'varying vec3 vColor; void main(){float r=length(gl_PointCoord-0.5)*2.0;if(r>1.0)discard;gl_FragColor=vec4(vColor*(1.0+exp(-r*r*30.0)),exp(-r*r*3.5));}',blending:THREE.AdditiveBlending}));this.scene.add(this.points);
  this.lines=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.75,depthWrite:false}));this.scene.add(this.lines);
  this.ring=new THREE.Mesh(new THREE.RingGeometry(1,1.18,48),new THREE.MeshBasicMaterial({color:0xf4e9ff,transparent:true,opacity:.95,depthTest:false,side:THREE.DoubleSide}));this.ring.renderOrder=100;this.ring.visible=false;this.scene.add(this.ring);
  this.labelLayer.className='graph-labels adaptive-labels';this.edgeLayer.className='edge-labels';host.append(this.labelLayer,this.edgeLayer);
  const measure=document.createElement('canvas').getContext('2d')!;measure.font='11px system-ui';
  for(const n of allNodes){const element=document.createElement('button');element.className='map-label';element.dataset.nodeId=n.id;element.title=`${n.sourceIdentifier??n.id} · ${n.title}`;
   const id=document.createElement('strong');id.textContent=n.kind==='source'?(n.id==='nist'?'NIST SP 800-53':'FedRAMP 2026'):n.sourceIdentifier??(hubKinds.has(n.kind)?n.id.split(':').at(-1)!.toUpperCase():n.id);
   const title=document.createElement('span');title.textContent=n.title;element.append(id,title);element.style.color=palette[n.kind];element.onclick=()=>this.onSelect(n.id);element.style.display='none';element.onpointerenter=()=>{this.hovered=n.id;this.lastLabelDraw=0;};element.onpointerleave=()=>{if(this.hovered===n.id)this.hovered=undefined;};element.dataset.kind=n.kind;
   const width=Math.max(88,Math.min(168,Math.ceil(Math.max(measure.measureText(id.textContent).width,measure.measureText(n.title).width)+18)));element.style.width=width+'px';this.labelObjects.set(n.id,{node:n,element,width,height:39});this.labelLayer.appendChild(element);
  }
  this.returnLabel.className='selected-return';this.returnLabel.style.display='none';this.returnLabel.onclick=()=>this.fitConnections();host.appendChild(this.returnLabel);
  const start=(e:PointerEvent)=>{this.down=[e.clientX,e.clientY];this.dragging=true;this.hovered=undefined;};
  const end=(e:PointerEvent)=>{this.dragging=false;if(e.button!==0||Math.hypot(e.clientX-this.down[0],e.clientY-this.down[1])>5)return;const node=this.pick(e);if(node)this.onSelect(node.id);};
  const move=(e:PointerEvent)=>{if(this.dragging)return;this.hovered=this.pick(e)?.id;canvas.style.cursor=this.hovered?'pointer':this.mode==='pan'?'grab':'move';};
  const leave=(event:PointerEvent)=>{if(event.relatedTarget instanceof HTMLElement&&event.relatedTarget.closest('.map-label'))return;this.hovered=undefined;};
  const key=(e:KeyboardEvent)=>{
   if(e.target!==canvas)return;const pan:Record<string,[number,number]>={ArrowLeft:[-35,0],ArrowRight:[35,0],ArrowUp:[0,35],ArrowDown:[0,-35]};
   if(pan[e.key]){e.preventDefault();this.remember();this.animation=null;const [x,y]=pan[e.key],factor=this.camera.position.distanceTo(this.controls.target)*.0014;
    const right=new THREE.Vector3().setFromMatrixColumn(this.camera.matrix,0),up=new THREE.Vector3().setFromMatrixColumn(this.camera.matrix,1);const delta=right.multiplyScalar(x*factor).add(up.multiplyScalar(y*factor));this.camera.position.add(delta);this.controls.target.add(delta);this.controls.update();
   }else if(['+','=','-','Home','f','F','Escape'].includes(e.key)){e.preventDefault();if(e.key==='Home')this.fitAll();else if(e.key.toLowerCase()==='f')this.fitConnections();else if(e.key==='Escape')this.back();else this.zoom(e.key==='-'?1.25:.8);}
  };
  const interaction=()=>{this.animation=null;this.remember();};this.controls.addEventListener('start',interaction);
  canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerleave',leave);canvas.addEventListener('keydown',key);
  const contextLost=(e:Event)=>{e.preventDefault();onFailure();};canvas.addEventListener('webglcontextlost',contextLost);
  this.callbacks=()=>{canvas.removeEventListener('pointerdown',start);canvas.removeEventListener('pointerup',end);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerleave',leave);canvas.removeEventListener('keydown',key);canvas.removeEventListener('webglcontextlost',contextLost);this.controls.removeEventListener('start',interaction);};
  this.resizeObserver=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;this.renderer.setSize(w,h);this.camera.aspect=w/Math.max(1,h);this.camera.updateProjectionMatrix();if(!this.initialized&&this.nodes.length){this.fit(false);this.initialized=true;}this.lastLabelDraw=0;});this.resizeObserver.observe(host);
  this.render();
 }
 setMode(mode:'pan'|'orbit'){this.mode=mode;this.controls.mouseButtons={LEFT:mode==='pan'?THREE.MOUSE.PAN:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:mode==='pan'?THREE.MOUSE.ROTATE:THREE.MOUSE.PAN};this.controls.touches={ONE:mode==='pan'?THREE.TOUCH.PAN:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};this.renderer.domElement.style.cursor=mode==='pan'?'grab':'move';this.renderer.domElement.setAttribute('aria-label',`Interactive policy map. Drag to ${mode}; right-drag to ${mode==='pan'?'orbit':'pan'}; scroll toward the pointer to zoom. Arrow keys pan; plus/minus zoom; F fits connections; Home fits all; Escape restores the previous view.`);}
 setOptions(labels:boolean,reduced:boolean){this.labels=labels;this.reduced=reduced;this.controls.enableDamping=!reduced;if(reduced&&this.animation){this.apply(this.animation.to);this.animation=null;}this.lastLabelDraw=0;}
 setData(nodes:Entity[],edges:Edge[],selected:string|undefined,activeEdge:string){
  this.nodes=nodes;this.edges=edges;this.selected=selected;this.activeEdge=activeEdge;this.related=selected?neighbors(selected,edges):null;
  const coords:number[]=[],colors:number[]=[],sizes:number[]=[];
  for(const n of nodes){coords.push(...this.positions.get(n.id)!);const color=new THREE.Color(palette[n.kind]);if(this.related&&!this.related.has(n.id))color.multiplyScalar(.18);colors.push(color.r,color.g,color.b);sizes.push(n.id===selected?12:hubKinds.has(n.kind)?10:n.kind==='enhancement'?3.5:5.5);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('size',new THREE.Float32BufferAttribute(sizes,1));this.points.geometry.dispose();this.points.geometry=geometry;
  const linePositions:number[]=[],lineColors:number[]=[];
  const line=(a:THREE.Vector3,b:THREE.Vector3,c:THREE.Color)=>{linePositions.push(a.x,a.y,a.z,b.x,b.y,b.z);lineColors.push(c.r,c.g,c.b,c.r,c.g,c.b);};
  for(const e of edges){const a=new THREE.Vector3(...this.positions.get(e.from)!),b=new THREE.Vector3(...this.positions.get(e.to)!);const relevant=selected&&(e.from===selected||e.to===selected);const c=new THREE.Color(e.type==='PUBLISHED_CONTROL_MAPPING'?'#da91c6':e.type==='DEFINED_BY'?'#68cdd6':'#83a8e5').multiplyScalar(e.id===activeEdge?1.5:relevant?.85:selected?.04:.07);line(a,b,c);
   if(relevant){const d=b.clone().sub(a),length=d.length();d.normalize();const perpendicular=new THREE.Vector3().crossVectors(d,new THREE.Vector3(0,0,1));if(perpendicular.length()<.01)perpendicular.crossVectors(d,new THREE.Vector3(0,1,0));perpendicular.normalize();const tip=a.clone().lerp(b,.72),back=tip.clone().addScaledVector(d,-Math.min(4,length*.12));line(tip,back.clone().addScaledVector(perpendicular,1.8),c);line(tip,back.clone().addScaledVector(perpendicular,-1.8),c);}
  }
  const lines=new THREE.BufferGeometry();lines.setAttribute('position',new THREE.Float32BufferAttribute(linePositions,3));lines.setAttribute('color',new THREE.Float32BufferAttribute(lineColors,3));this.lines.geometry.dispose();this.lines.geometry=lines;
  for(const l of this.labelObjects.values())l.element.style.display='none';this.visibleLabelIds.clear();
  this.edgeLayer.replaceChildren();this.edgeLabels=[];
  for(const e of edges.filter(e=>selected&&(e.from===selected||e.to===selected)).sort((a,b)=>(a.id===activeEdge?-1:b.id===activeEdge?1:a.type===b.type?a.id.localeCompare(b.id):a.type.localeCompare(b.type))).slice(0,6)){
   const button=document.createElement('button');button.textContent='→ '+(relationshipNames[e.type]??e.type).replace('Published mappings','Published mapping');button.title=`${e.from} → ${e.to} · ${e.type} · View source evidence`;button.setAttribute('aria-label',`Inspect relationship ${e.from} to ${e.to}: ${e.type}`);button.onclick=()=>this.onEdge(e);button.style.display='none';button.dataset.edgeId=e.id;this.edgeLayer.appendChild(button);this.edgeLabels.push({edge:e,element:button});
  }
  this.lastLabelDraw=0;if(!this.initialized&&nodes.length){this.fit(false);this.initialized=true;}if(this.fitPending){this.fitPending=false;this.fitConnections();}
 }
 private pick(e:PointerEvent){const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.raycaster.params.Points={threshold:Math.max(.6,this.camera.position.distanceTo(this.controls.target)*.004)};this.raycaster.setFromCamera(this.pointer,this.camera);const hits=this.raycaster.intersectObject(this.points);const index=hits[0]?.index;return index===undefined?undefined:this.nodes[index];}
 private frame():CameraFrame{return {position:this.camera.position.clone(),target:this.controls.target.clone()};}
 private remember(){const frame=this.frame(),last=this.history.at(-1);if(!last||last.position.distanceTo(frame.position)>.5||last.target.distanceTo(frame.target)>.5){this.history.push(frame);if(this.history.length>30)this.history.shift();this.onHistory(true);}}
 private apply(frame:CameraFrame){this.camera.position.copy(frame.position);this.controls.target.copy(frame.target);this.controls.update();}
 private move(frame:CameraFrame,remember=true){if(this.camera.position.distanceTo(frame.position)<.05&&this.controls.target.distanceTo(frame.target)<.05){this.animation=null;return;}if(remember)this.remember();this.animation=null;this.controls.enabled=false;this.controls.update();this.controls.enabled=true;if(this.reduced)this.apply(frame);else this.animation={from:this.frame(),to:frame,start:performance.now()};}
 private fit(remember=true,ids?:Set<string>){const points=this.nodes.filter(n=>!ids||ids.has(n.id)).map(n=>this.positions.get(n.id)!);const bounds=fittedBounds(points,this.camera.aspect);if(!bounds)return;const direction=this.camera.position.clone().sub(this.controls.target).normalize();const target=new THREE.Vector3(...bounds.center);this.move({target,position:target.clone().addScaledVector(direction,bounds.distance)},remember);}
 fitAll(){this.fit();}
 fitConnections(){if(!this.nodes.length){this.fitPending=true;return;}this.fit(true,this.selected?neighbors(this.selected,this.edges):undefined);}
 back(){this.animation=null;const frame=this.history.pop();if(frame)this.move(frame,false);this.onHistory(this.history.length>0);}
 zoom(factor:number){this.remember();this.animation=null;const v=this.camera.position.clone().sub(this.controls.target);v.setLength(THREE.MathUtils.clamp(v.length()*factor,12,5000));this.camera.position.copy(this.controls.target).add(v);this.controls.update();}
 private drawLabels(time:number){
  if(time-this.lastLabelDraw<60)return;this.lastLabelDraw=time;
  const w=this.host.clientWidth,h=this.host.clientHeight,view=new THREE.Vector3();const candidates:LabelCandidate[]=[];
  for(const n of this.nodes){const p=this.positions.get(n.id)!,label=this.labelObjects.get(n.id)!;view.set(...p).applyMatrix4(this.camera.matrixWorldInverse);const depth=-view.z;if(depth<=0)continue;const projected=new THREE.Vector3(...p).project(this.camera);if(projected.z>=1||Math.abs(projected.x)>1||Math.abs(projected.y)>1)continue;const scale=(n.kind==='enhancement'?3.5:5.5)*650/depth;const priority=labelPriority(n.id,n.kind,this.selected,this.hovered,this.related);const threshold=this.visibleLabelIds.has(n.id)?6:7.5;const eligible=priority<2||(this.labels&&(priority<4||scale>threshold));candidates.push({id:n.id,x:(projected.x*.5+.5)*w,y:(-projected.y*.5+.5)*h,width:label.width,height:label.height,priority,scale,eligible});}
  const placed=placeLabels(candidates,w,h,w<500?25:65);const visible=new Set(placed.map(p=>p.id));
  for(const id of this.visibleLabelIds)if(!visible.has(id))this.labelObjects.get(id)!.element.style.display='none';
  for(const p of placed){const item=this.labelObjects.get(p.id)!.element;item.classList.toggle('selected',p.id===this.selected);item.classList.toggle('neighbor',!!this.related?.has(p.id));item.style.display='block';item.style.transform=`translate(${Math.round(p.left)}px,${Math.round(p.top)}px)`;}
  this.visibleLabelIds=visible;
  const selectedPosition=this.selected&&this.nodes.some(n=>n.id===this.selected)?this.positions.get(this.selected):null;
  this.returnLabel.style.display=selectedPosition&&!visible.has(this.selected!)?'block':'none';if(selectedPosition){this.returnLabel.textContent=`↗ Return to ${this.labelObjects.get(this.selected!)!.node.sourceIdentifier??this.selected}`;}
  const occupied=placed.map(p=>({x:p.left,y:p.top,w:p.width,h:p.height}));
  for(const {edge,element} of this.edgeLabels){const a=new THREE.Vector3(...this.positions.get(edge.from)!),b=new THREE.Vector3(...this.positions.get(edge.to)!);const p=a.lerp(b,.5).project(this.camera),x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;const width=142,height=24,left=x-width/2;
   const show=this.labels&&p.z<1&&left>8&&left+width<w-8&&y>48&&y+height<h-125&&!occupied.some(r=>left<r.x+r.w+5&&left+width+5>r.x&&y<r.y+r.h+4&&y+height+4>r.y);
   element.style.display=show?'block':'none';if(show){element.style.transform=`translate(${Math.round(left)}px,${Math.round(y)}px)`;occupied.push({x:left,y,w:width,h:height});}
  }
 }
 private render=()=>{this.raf=requestAnimationFrame(this.render);const now=performance.now();if(this.animation){const t=Math.min(1,(now-this.animation.start)/500),ease=1-Math.pow(1-t,3);this.camera.position.lerpVectors(this.animation.from.position,this.animation.to.position,ease);this.controls.target.lerpVectors(this.animation.from.target,this.animation.to.target,ease);if(t===1)this.animation=null;}this.controls.update();
  if(this.selected&&this.nodes.some(n=>n.id===this.selected)){const p=this.positions.get(this.selected)!;this.ring.visible=true;this.ring.position.set(...p);this.ring.quaternion.copy(this.camera.quaternion);const size=this.camera.position.distanceTo(this.ring.position)*Math.tan(this.camera.fov*Math.PI/360)/Math.max(1,this.host.clientHeight)*18;this.ring.scale.setScalar(size);}else this.ring.visible=false;
  this.drawLabels(now);this.renderer.render(this.scene,this.camera);
 };
 dispose(){cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.callbacks();this.controls.dispose();this.points.geometry.dispose();(this.points.material as THREE.Material).dispose();this.lines.geometry.dispose();(this.lines.material as THREE.Material).dispose();this.ring.geometry.dispose();(this.ring.material as THREE.Material).dispose();this.renderer.dispose();this.renderer.domElement.remove();this.labelLayer.remove();this.edgeLayer.remove();this.returnLabel.remove();}
}
