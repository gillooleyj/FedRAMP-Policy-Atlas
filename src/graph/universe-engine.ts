import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import type {Entity,Edge} from '../data/types';
import {type Position} from './model';
import {fittedBounds,hubKinds,labelPriority,placeLabels,type LabelCandidate,relationshipNames,labelLevel,labelKindVisible,labelBudget,type LabelLevel,canonicalView} from './navigation';
import type {MapView} from './journey';
import {regions,regionPoints,centroid} from './exploration';
import {mapEntityColor,type Theme} from '../theme';
import {overviewFrame,type OverviewFrame} from './overview';
interface CameraFrame {position:THREE.Vector3;target:THREE.Vector3;region?:string;regionDistance?:number}
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
 private leaderLayer=document.createElementNS('http://www.w3.org/2000/svg','svg');
 private labelObjects=new Map<string,Label>();
 private regionLabels=new Map<string,{element:HTMLButtonElement;width:number;height:number}>();
 private region:string|undefined;
 private regionDistance=650;
 private distances=new Map<string,number>();
 private connectionDepth=1;
 private edgeLayer=document.createElement('div');
 private edgeLabels:{edge:Edge;element:HTMLButtonElement}[]=[];
 private returnLabel=document.createElement('button');
 private nodes:Entity[]=[];
 private edges:Edge[]=[];
 private selected?:string;
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
 private labelLayoutDirty=true;
 private lastLabelFrame:CameraFrame|null=null;
 private labelDimensions='';
 private labelAnchors=new Map<string,number>();
 private level:LabelLevel='sources';
 private levelHint=document.createElement('div');
 private overviewDistance=650;
 private resetLayoutOnAnimationEnd=false;
 private activeEdge='';
 private theme:Theme='dark';
 private lastOverviewFrame='';
 private lastOverviewDraw=0;
 private hovered='';
 constructor(private host:HTMLDivElement,private positions:Map<string,Position>,allNodes:Entity[],onSelect:(id:string)=>void,onEdge:(edge:Edge)=>void,onHistory:(available:boolean)=>void,onFailure:()=>void,private onOverview:(frame:OverviewFrame)=>void,private onIdentify:(n:Entity|null)=>void){
  this.onSelect=onSelect;this.onEdge=onEdge;this.onHistory=onHistory;
  this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.setClearColor(0x080d16,0);
  const canvas=this.renderer.domElement;canvas.tabIndex=0;canvas.dataset.keyboardFocus='false';canvas.setAttribute('aria-label','Interactive policy map. Drag to pan, right-drag to orbit, scroll to zoom. Arrow keys pan; plus and minus zoom; F fits connections; Home fits all; Escape returns to the previous view.');
  host.appendChild(canvas);this.renderer.setSize(host.clientWidth,host.clientHeight);this.camera.aspect=host.clientWidth/Math.max(1,host.clientHeight);this.camera.updateProjectionMatrix();this.camera.position.set(0,0,650);this.overviewDistance=fittedBounds([...positions.values()],this.camera.aspect)?.distance??650;
  this.controls=new OrbitControls(this.camera,canvas);this.controls.screenSpacePanning=true;this.controls.zoomToCursor=true;this.controls.enableDamping=true;this.controls.dampingFactor=.12;this.controls.minDistance=12;this.controls.maxDistance=5000;this.controls.maxPolarAngle=Math.PI*.94;this.controls.minPolarAngle=Math.PI*.06;
  this.setMode('pan');
  this.points=new THREE.Points(new THREE.BufferGeometry(),new THREE.ShaderMaterial({uniforms:{lightMode:{value:0}},transparent:true,depthWrite:false,vertexShader:'attribute vec3 color; attribute float size; varying vec3 vColor; void main(){vColor=color;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=size*clamp(650.0/-mv.z,0.4,5.0);}',fragmentShader:'uniform float lightMode; varying vec3 vColor; void main(){float r=length(gl_PointCoord-0.5)*2.0;if(r>1.0)discard;gl_FragColor=vec4(vColor*(1.0+(1.0-lightMode)*exp(-r*r*30.0)),exp(-r*r*mix(3.5,1.8,lightMode)));}',blending:THREE.AdditiveBlending}));this.scene.add(this.points);
  this.lines=new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.75,depthWrite:false}));this.scene.add(this.lines);
  this.ring=new THREE.Mesh(new THREE.RingGeometry(1,1.18,48),new THREE.MeshBasicMaterial({color:0xf4e9ff,transparent:true,opacity:.95,depthTest:false,side:THREE.DoubleSide}));this.ring.renderOrder=100;this.ring.visible=false;this.scene.add(this.ring);
  this.labelLayer.className='graph-labels adaptive-labels';this.edgeLayer.className='edge-labels';this.levelHint.className='map-level-hint';this.leaderLayer.classList.add('map-label-leaders');host.append(this.leaderLayer,this.labelLayer,this.edgeLayer,this.levelHint);
  const measure=document.createElement('canvas').getContext('2d')!;
  for(const n of allNodes){const element=document.createElement('button');element.className='map-label';element.dataset.nodeId=n.id;element.title=`${n.sourceIdentifier??n.id} · ${n.title}`;
   const text=n.kind==='source'?(n.id==='nist'?'NIST 800-53':'FedRAMP'):hubKinds.has(n.kind)?n.title:n.sourceIdentifier??n.title;
   const title=document.createElement('strong');title.textContent=text;element.append(title);element.setAttribute('aria-label',`${text} · ${n.title}`);element.style.color=mapEntityColor(n,this.theme);element.onpointerenter=()=>this.identify(n);element.onpointerleave=()=>this.identify(null);element.onclick=()=>this.onSelect(n.id);element.style.display='none';element.dataset.kind=n.kind;
   measure.font=n.kind==='source'?'600 13px system-ui':'500 11px system-ui';
   const width=Math.max(48,Math.min(190,Math.ceil(measure.measureText(text).width+12)));element.style.width=width+'px';this.labelObjects.set(n.id,{node:n,element,width,height:26});this.labelLayer.appendChild(element);
  }
  for(const region of regions){const element=document.createElement('button');element.className='map-label region-label';element.dataset.regionId=region.id;element.textContent=region.title;element.style.color=region.color;element.title=`Explore ${region.title.toLowerCase()} — navigation region`;element.setAttribute('aria-label',`Explore ${region.title}`);element.style.display='none';element.onclick=()=>this.openRegion(region.id);const width=Math.ceil(region.title.length*8+16);element.style.width=width+'px';this.regionLabels.set('region:'+region.id,{element,width,height:26});this.labelLayer.appendChild(element);}
  this.returnLabel.className='selected-return';this.returnLabel.style.display='none';this.returnLabel.onclick=()=>this.fitConnections();host.appendChild(this.returnLabel);
  const start=(e:PointerEvent)=>{this.down=[e.clientX,e.clientY];this.dragging=true;this.identify(null);canvas.dataset.keyboardFocus='false';};
  const end=(e:PointerEvent)=>{this.dragging=false;if(e.button!==0||Math.hypot(e.clientX-this.down[0],e.clientY-this.down[1])>5)return;const node=this.pick(e);if(node)this.onSelect(node.id);};
  const move=(e:PointerEvent)=>{if(this.dragging)return;const hovered=this.pick(e);this.identify(hovered??null);canvas.style.cursor=hovered?'pointer':this.mode==='pan'?'grab':'move';};
  const leave=()=>{this.dragging=false;this.identify(null);};canvas.addEventListener('pointerleave',leave);canvas.addEventListener('pointercancel',leave);
  const key=(e:KeyboardEvent)=>{
   if(e.target!==canvas)return;canvas.dataset.keyboardFocus='true';const pan:Record<string,[number,number]>={ArrowLeft:[-35,0],ArrowRight:[35,0],ArrowUp:[0,35],ArrowDown:[0,-35]};
   if(pan[e.key]){e.preventDefault();this.remember();this.animation=null;const [x,y]=pan[e.key],factor=this.camera.position.distanceTo(this.controls.target)*.0014;
    const right=new THREE.Vector3().setFromMatrixColumn(this.camera.matrix,0),up=new THREE.Vector3().setFromMatrixColumn(this.camera.matrix,1);const delta=right.multiplyScalar(x*factor).add(up.multiplyScalar(y*factor));this.camera.position.add(delta);this.controls.target.add(delta);this.controls.update();
   }else if(['+','=','-','Home','f','F','Escape'].includes(e.key)){e.preventDefault();if(e.key==='Home')this.fitAll();else if(e.key.toLowerCase()==='f')this.fitConnections();else if(e.key==='Escape')this.back();else this.zoom(e.key==='-'?1.25:.8);}
  };
  const keyboardFocus=(e:KeyboardEvent)=>{if(e.key==='Tab')canvas.dataset.keyboardFocus='true';};
  const pointerFocus=()=>{canvas.dataset.keyboardFocus='false';};document.addEventListener('keydown',keyboardFocus,true);document.addEventListener('pointerdown',pointerFocus,true);
  const interaction=()=>{this.animation=null;this.resetLayoutOnAnimationEnd=false;this.remember();};this.controls.addEventListener('start',interaction);
  canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointermove',move);canvas.addEventListener('keydown',key);
  const contextLost=(e:Event)=>{e.preventDefault();onFailure();};canvas.addEventListener('webglcontextlost',contextLost);
  this.callbacks=()=>{canvas.removeEventListener('pointerleave',leave);canvas.removeEventListener('pointercancel',leave);document.removeEventListener('keydown',keyboardFocus,true);document.removeEventListener('pointerdown',pointerFocus,true);canvas.removeEventListener('pointerdown',start);canvas.removeEventListener('pointerup',end);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('keydown',key);canvas.removeEventListener('webglcontextlost',contextLost);this.controls.removeEventListener('start',interaction);};
  this.resizeObserver=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;this.renderer.setSize(w,h);this.camera.aspect=w/Math.max(1,h);this.camera.updateProjectionMatrix();this.overviewDistance=fittedBounds([...this.positions.values()],this.camera.aspect)?.distance??650;this.labelLayoutDirty=true;if(!this.initialized&&this.nodes.length){this.resetView(false);this.initialized=true;}this.lastLabelDraw=0;});this.resizeObserver.observe(host);
  this.render();
 }
 private identify(n:Entity|null){if((n?.id??'')!==this.hovered){this.hovered=n?.id??'';this.onIdentify(n);}}
 invalidateLabels(){this.labelLayoutDirty=true;this.lastLabelDraw=0;}
 setTheme(theme:Theme){this.theme=theme;const material=this.points.material as THREE.ShaderMaterial;material.uniforms.lightMode.value=theme==='light'?1:0;material.blending=theme==='light'?THREE.NormalBlending:THREE.AdditiveBlending;material.needsUpdate=true;(this.ring.material as THREE.MeshBasicMaterial).color.set(theme==='light'?'#172b40':'#f4e9ff');for(const {node,element} of this.labelObjects.values())element.style.color=mapEntityColor(node,theme);for(const region of regions)this.regionLabels.get('region:'+region.id)!.element.style.color=mapEntityColor({kind:region.groupKind,sourceId:region.id==='nist'?'nist':'fedramp'},theme);this.setData(this.nodes,this.edges,this.selected,this.activeEdge,this.distances,this.connectionDepth);}
 travelTo(target:Position){const point=new THREE.Vector3(...target),offset=this.camera.position.clone().sub(this.controls.target);this.move({target:point,position:point.clone().add(offset)});}
 setMode(mode:'pan'|'orbit'){this.mode=mode;this.controls.mouseButtons={LEFT:mode==='pan'?THREE.MOUSE.PAN:THREE.MOUSE.ROTATE,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:mode==='pan'?THREE.MOUSE.ROTATE:THREE.MOUSE.PAN};this.controls.touches={ONE:mode==='pan'?THREE.TOUCH.PAN:THREE.TOUCH.ROTATE,TWO:THREE.TOUCH.DOLLY_PAN};this.renderer.domElement.style.cursor=mode==='pan'?'grab':'move';this.renderer.domElement.setAttribute('aria-label',`Interactive policy map. Drag to ${mode}; right-drag to ${mode==='pan'?'orbit':'pan'}; scroll toward the pointer to zoom. Arrow keys pan; plus/minus zoom; F fits connections; Home fits all; Escape restores the previous view.`);}
 setOptions(labels:boolean,reduced:boolean){this.labelLayoutDirty=true;this.labels=labels;this.reduced=reduced;this.controls.enableDamping=!reduced;if(reduced&&this.animation){this.apply(this.animation.to);this.animation=null;}this.lastLabelDraw=0;}
 setData(nodes:Entity[],edges:Edge[],selected:string|undefined,activeEdge:string,distances:Map<string,number>,connectionDepth:number){
  if(selected&&selected!==this.selected)this.region=undefined;this.distances=distances;this.connectionDepth=connectionDepth;
  if(this.hovered&&!nodes.some(n=>n.id===this.hovered))this.identify(null);
  this.nodes=nodes;this.edges=edges;this.selected=selected;this.activeEdge=activeEdge;this.related=selected?new Set(distances.keys()):null;
  const coords:number[]=[],colors:number[]=[],sizes:number[]=[];
  for(const n of nodes){coords.push(...this.positions.get(n.id)!);const color=new THREE.Color(mapEntityColor(n,this.theme));if(this.related){const strength=this.distances.has(n.id)?[1,1,.65,.4][this.distances.get(n.id)!]:.28;if(this.theme==='light')color.lerp(new THREE.Color('#f3f6f8'),1-strength);else color.multiplyScalar(strength);}colors.push(color.r,color.g,color.b);sizes.push(n.id===selected?12:hubKinds.has(n.kind)?10:n.kind==='enhancement'?3.5:5.5);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setAttribute('size',new THREE.Float32BufferAttribute(sizes,1));this.points.geometry.dispose();this.points.geometry=geometry;
  const linePositions:number[]=[],lineColors:number[]=[];
  const line=(a:THREE.Vector3,b:THREE.Vector3,c:THREE.Color)=>{linePositions.push(a.x,a.y,a.z,b.x,b.y,b.z);lineColors.push(c.r,c.g,c.b,c.r,c.g,c.b);};
  for(const e of edges){const a=new THREE.Vector3(...this.positions.get(e.from)!),b=new THREE.Vector3(...this.positions.get(e.to)!);const edgeLevel=Math.min(this.distances.get(e.from)??Infinity,this.distances.get(e.to)??Infinity)+1;const relevant=!!selected&&edgeLevel<=this.connectionDepth;const strength=e.id===activeEdge?1:relevant?.9/edgeLevel:selected?.04:.07;const c=this.theme==='light'?new THREE.Color(e.type==='PUBLISHED_CONTROL_MAPPING'?'#a43577':e.type==='DEFINED_BY'?'#246f73':'#245d84').lerp(new THREE.Color('#f3f6f8'),1-(relevant||e.id===activeEdge?strength:.13)):new THREE.Color(e.type==='PUBLISHED_CONTROL_MAPPING'?'#da91c6':e.type==='DEFINED_BY'?'#68cdd6':'#83a8e5').multiplyScalar(e.id===activeEdge?1.5:strength);line(a,b,c);
   if(relevant){const d=b.clone().sub(a),length=d.length();d.normalize();const perpendicular=new THREE.Vector3().crossVectors(d,new THREE.Vector3(0,0,1));if(perpendicular.length()<.01)perpendicular.crossVectors(d,new THREE.Vector3(0,1,0));perpendicular.normalize();const tip=a.clone().lerp(b,.72),back=tip.clone().addScaledVector(d,-Math.min(4,length*.12));line(tip,back.clone().addScaledVector(perpendicular,1.8),c);line(tip,back.clone().addScaledVector(perpendicular,-1.8),c);}
  }
  const lines=new THREE.BufferGeometry();lines.setAttribute('position',new THREE.Float32BufferAttribute(linePositions,3));lines.setAttribute('color',new THREE.Float32BufferAttribute(lineColors,3));this.lines.geometry.dispose();this.lines.geometry=lines;
  const visibleNodeIds=new Set(nodes.map(n=>n.id));for(const id of this.visibleLabelIds)if(!visibleNodeIds.has(id)){this.labelElement(id).style.display='none';this.visibleLabelIds.delete(id);this.labelAnchors.delete(id);}this.labelLayoutDirty=true;
  this.edgeLayer.replaceChildren();this.edgeLabels=[];
  for(const e of edges.filter(e=>selected&&(e.from===selected||e.to===selected)).sort((a,b)=>(a.id===activeEdge?-1:b.id===activeEdge?1:a.type===b.type?a.id.localeCompare(b.id):a.type.localeCompare(b.type))).slice(0,6)){
   const button=document.createElement('button');button.textContent='→ '+(relationshipNames[e.type]??e.type).replace('Published mappings','Published mapping');button.title=`${e.from} → ${e.to} · ${e.type} · View source evidence`;button.setAttribute('aria-label',`Inspect relationship ${e.from} to ${e.to}: ${e.type}`);button.onclick=()=>this.onEdge(e);button.style.display='none';button.dataset.edgeId=e.id;this.edgeLayer.appendChild(button);this.edgeLabels.push({edge:e,element:button});
  }
  this.lastLabelDraw=0;if(!this.initialized&&nodes.length){this.resetView(false);this.initialized=true;}if(this.fitPending){this.fitPending=false;this.fitConnections();}
 }
 captureView():MapView{const frame=this.frame();return {position:frame.position.toArray() as Position,target:frame.target.toArray() as Position,region:frame.region,regionDistance:frame.regionDistance};}
 restoreView(frame:MapView){this.labelAnchors.clear();this.lastLabelFrame=null;this.move({position:new THREE.Vector3(...frame.position),target:new THREE.Vector3(...frame.target),region:frame.region,regionDistance:frame.regionDistance},false);}
 private pick(e:PointerEvent){const rect=this.renderer.domElement.getBoundingClientRect();this.pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);this.raycaster.params.Points={threshold:Math.max(.6,this.camera.position.distanceTo(this.controls.target)*.004)};this.raycaster.setFromCamera(this.pointer,this.camera);const hits=this.raycaster.intersectObject(this.points);const index=hits[0]?.index;return index===undefined?undefined:this.nodes[index];}
 private labelElement(id:string){return this.labelObjects.get(id)?.element??this.regionLabels.get(id)!.element;}
 private frame():CameraFrame{return {position:this.camera.position.clone(),target:this.controls.target.clone(),region:this.region,regionDistance:this.regionDistance};}
 private remember(){const frame=this.frame(),last=this.history.at(-1);if(!last||last.region!==frame.region||last.position.distanceTo(frame.position)>.5||last.target.distanceTo(frame.target)>.5){this.history.push(frame);if(this.history.length>30)this.history.shift();this.onHistory(true);}}
 private apply(frame:CameraFrame){this.camera.position.copy(frame.position);this.controls.target.copy(frame.target);this.controls.update();}
 private move(frame:CameraFrame,remember=true){
  this.resetLayoutOnAnimationEnd=false;
  const samePosition=this.camera.position.distanceTo(frame.position)<.05&&this.controls.target.distanceTo(frame.target)<.05;
  if(remember&&(!samePosition||this.region!==frame.region))this.remember();
  this.region=frame.region;this.regionDistance=frame.regionDistance??650;this.labelLayoutDirty=true;this.animation=null;
  if(samePosition)return;
  const damping=this.controls.enableDamping;this.controls.enableDamping=false;this.controls.update();this.controls.enableDamping=damping;
  if(this.reduced)this.apply(frame);else this.animation={from:this.frame(),to:frame,start:performance.now()};
 }
 private fit(remember=true,ids?:Set<string>){const points=this.nodes.filter(n=>!ids||ids.has(n.id)).map(n=>this.positions.get(n.id)!);const bounds=fittedBounds(points,this.camera.aspect);if(!bounds)return;const direction=this.camera.position.clone().sub(this.controls.target).normalize();const target=new THREE.Vector3(...bounds.center);this.move({target,position:target.clone().addScaledVector(direction,bounds.distance)},remember);}
 openRegion(id:string){const points=regionPoints(id,this.nodes,this.positions),bounds=fittedBounds(points,this.camera.aspect);if(!bounds)return;const target=new THREE.Vector3(...bounds.center),direction=this.camera.position.clone().sub(this.controls.target).normalize();this.level='groups';this.labelAnchors.clear();this.move({target,position:target.clone().addScaledVector(direction,bounds.distance),region:id,regionDistance:bounds.distance});this.labelLayoutDirty=true;}
 fitAll(){this.fit();}
 resetView(remember=true){const home=canonicalView([...this.positions.values()],this.camera.aspect);if(!home)return;this.camera.up.set(0,1,0);this.level='sources';this.labelAnchors.clear();this.lastLabelFrame=null;this.labelLayoutDirty=true;const damping=this.controls.enableDamping;this.controls.enableDamping=false;this.controls.update();this.controls.enableDamping=damping;this.move({target:new THREE.Vector3(...home.target),position:new THREE.Vector3(...home.position)},remember);this.resetLayoutOnAnimationEnd=!!this.animation;}
 fitConnections(){if(!this.nodes.length){this.fitPending=true;return;}this.fit(true,this.selected?new Set(this.distances.keys()):undefined);}
 back(){this.animation=null;const frame=this.history.pop();if(frame)this.move(frame,false);this.onHistory(this.history.length>0);}
 zoom(factor:number){this.remember();this.animation=null;const v=this.camera.position.clone().sub(this.controls.target);v.setLength(THREE.MathUtils.clamp(v.length()*factor,12,5000));this.camera.position.copy(this.controls.target).add(v);this.controls.update();}
 private drawLabels(time:number){
  if(time-this.lastLabelDraw<60)return;this.lastLabelDraw=time;
  const w=this.host.clientWidth,h=this.host.clientHeight,frame=this.frame(),dimensions=`${w}:${h}`;
  if(!this.labelLayoutDirty&&dimensions===this.labelDimensions&&this.lastLabelFrame&&frame.position.distanceTo(this.lastLabelFrame.position)<.005&&frame.target.distanceTo(this.lastLabelFrame.target)<.005)return;
  this.camera.updateMatrixWorld();this.lastLabelFrame=frame;this.labelDimensions=dimensions;this.labelLayoutDirty=false;
  const distance=this.camera.position.distanceTo(this.controls.target);
  if(this.region&&!this.animation&&distance>this.regionDistance*1.6)this.region=undefined;
  const nextLevel=this.region?(this.region==='classes'?'groups':this.region==='definitions'||distance<this.regionDistance*(this.level==='details'?.78:.65)?'details':'groups'):labelLevel(distance,this.overviewDistance,this.level);
  if(nextLevel!==this.level){this.labelAnchors.clear();}this.level=nextLevel;
  this.labelLayer.dataset.level=this.level;
  this.levelHint.textContent=this.selected?`Selection · ${this.connectionDepth} connection level${this.connectionDepth===1?'':'s'} · Dimmed context stays clickable`:this.level==='sources'?'Sources · Zoom in to explore regions':this.level==='regions'?'Regions · Select a region to travel into it':`${this.region?regions.find(r=>r.id===this.region)!.title:this.level==='groups'?'Groups':'Details'} · Labels nearest the center · Find every group in Explore groups`;
  this.levelHint.hidden=!this.labels;
  const view=new THREE.Vector3(),candidates:LabelCandidate[]=[];
  for(const n of this.nodes){const p=this.positions.get(n.id)!,label=this.labelObjects.get(n.id)!;view.set(...p).applyMatrix4(this.camera.matrixWorldInverse);const depth=-view.z;if(depth<=0)continue;const projected=new THREE.Vector3(...p).project(this.camera);if(projected.z>=1||Math.abs(projected.x)>1||Math.abs(projected.y)>1)continue;
   const scale=-Math.hypot(projected.x,projected.y),priority=(n.kind==='source'&&this.selected&&n.id!==this.selected ? .5 : labelPriority(n.id,n.kind,this.selected,this.related))+(this.related?.has(n.id)&&n.id!==this.selected?(this.distances.get(n.id)??1)*.1:0);
   // Selection reveals direct neighbors; otherwise each zoom level has its own label set.
   const eligible=n.id===this.selected||(this.labels&&(this.related?(this.related.has(n.id)||n.kind==='source'||(hubKinds.has(n.kind)&&labelKindVisible(n.kind,this.level))):labelKindVisible(n.kind,this.level)&&(!this.region||regions.find(r=>r.id===this.region)!.kinds.includes(n.kind))));
   candidates.push({id:n.id,x:(projected.x*.5+.5)*w,y:(-projected.y*.5+.5)*h,width:label.width,height:label.height,priority,scale,eligible});
  }
  if(this.labels&&!this.selected&&this.level==='regions')for(const region of regions){const point=centroid(regionPoints(region.id,this.nodes,this.positions));if(!point)continue;const p=new THREE.Vector3(...point).project(this.camera);if(p.z>=1||Math.abs(p.x)>1||Math.abs(p.y)>1)continue;const label=this.regionLabels.get('region:'+region.id)!;candidates.push({id:'region:'+region.id,x:(p.x*.5+.5)*w,y:(-p.y*.5+.5)*h,width:label.width,height:label.height,priority:0,scale:0,eligible:true});}
  const hostRect=this.host.getBoundingClientRect();const reserved=[...this.host.parentElement!.querySelectorAll<HTMLElement>('.map-overview,.group-directory')].map(el=>{const r=el.getBoundingClientRect();return {left:r.left-hostRect.left,top:r.top-hostRect.top,width:r.width,height:r.height};});
  const placed=placeLabels(candidates,w,h,labelBudget(this.level,w<500,!!this.selected),this.labelAnchors,reserved);const visible=new Set(placed.map(p=>p.id));this.labelAnchors=new Map(placed.map(p=>[p.id,p.anchor]));
  for(const id of this.visibleLabelIds)if(!visible.has(id))this.labelElement(id).style.display='none';
  for(const p of placed){const item=this.labelElement(p.id);item.dataset.distance=String(this.distances.get(p.id)??'');item.classList.toggle('selected',p.id===this.selected);item.classList.toggle('neighbor',!!this.related?.has(p.id));item.classList.toggle('context',!!this.related&&!this.related.has(p.id));item.style.display='block';item.style.transform=`translate(${Math.round(p.left)}px,${Math.round(p.top)}px)`;}
  this.leaderLayer.replaceChildren();for(const p of placed){const c=candidates.find(c=>c.id===p.id)!;if(p.anchor<4)continue;const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',String(c.x));line.setAttribute('y1',String(c.y));line.setAttribute('x2',String(Math.max(p.left,Math.min(p.left+p.width,c.x))));line.setAttribute('y2',String(Math.max(p.top,Math.min(p.top+p.height,c.y))));this.leaderLayer.append(line);}
  this.visibleLabelIds=visible;
  const selectedPosition=this.selected&&this.nodes.some(n=>n.id===this.selected)?this.positions.get(this.selected):null;
  this.returnLabel.style.display=selectedPosition&&!visible.has(this.selected!)?'block':'none';if(selectedPosition){this.returnLabel.textContent=`↗ Return to ${this.labelObjects.get(this.selected!)!.node.sourceIdentifier??this.selected}`;}
  const occupied=[...placed,...reserved].map(p=>({x:p.left,y:p.top,w:p.width,h:p.height}));
  for(const {edge,element} of this.edgeLabels){const a=new THREE.Vector3(...this.positions.get(edge.from)!),b=new THREE.Vector3(...this.positions.get(edge.to)!);const p=a.lerp(b,.5).project(this.camera),x=(p.x*.5+.5)*w,y=(-p.y*.5+.5)*h;const width=142,height=24,left=x-width/2;
   const show=this.labels&&p.z<1&&left>8&&left+width<w-8&&y>48&&y+height<h-125&&!occupied.some(r=>left<r.x+r.w+5&&left+width+5>r.x&&y<r.y+r.h+4&&y+height+4>r.y);
   element.style.display=show?'block':'none';if(show){element.style.transform=`translate(${Math.round(left)}px,${Math.round(y)}px)`;occupied.push({x:left,y,w:width,h:height});}
  }
 }
 private render=()=>{this.raf=requestAnimationFrame(this.render);const now=performance.now();if(this.animation){const t=Math.min(1,(now-this.animation.start)/500),ease=1-Math.pow(1-t,3);this.camera.position.lerpVectors(this.animation.from.position,this.animation.to.position,ease);this.controls.target.lerpVectors(this.animation.from.target,this.animation.to.target,ease);if(t===1){this.animation=null;if(this.resetLayoutOnAnimationEnd){this.labelAnchors.clear();this.labelLayoutDirty=true;this.resetLayoutOnAnimationEnd=false;}}}this.controls.update();
  if(this.selected&&this.nodes.some(n=>n.id===this.selected)){const p=this.positions.get(this.selected)!;this.ring.visible=true;this.ring.position.set(...p);this.ring.quaternion.copy(this.camera.quaternion);const size=this.camera.position.distanceTo(this.ring.position)*Math.tan(this.camera.fov*Math.PI/360)/Math.max(1,this.host.clientHeight)*18;this.ring.scale.setScalar(size);}else this.ring.visible=false;
  this.drawLabels(now);if(now-this.lastOverviewDraw>100){this.lastOverviewDraw=now;const key=[...this.camera.position.toArray(),...this.controls.target.toArray(),this.camera.aspect].map(v=>v.toFixed(3)).join(':')+this.level+this.region;if(key!==this.lastOverviewFrame){this.lastOverviewFrame=key;this.onOverview({...overviewFrame(this.camera,this.controls.target,this.overviewDistance),level:this.level,region:regions.find(r=>r.id===this.region)?.title});}}this.renderer.render(this.scene,this.camera);
 };
 dispose(){cancelAnimationFrame(this.raf);this.resizeObserver.disconnect();this.callbacks();this.controls.dispose();this.points.geometry.dispose();(this.points.material as THREE.Material).dispose();this.lines.geometry.dispose();(this.lines.material as THREE.Material).dispose();this.ring.geometry.dispose();(this.ring.material as THREE.Material).dispose();this.renderer.dispose();this.renderer.domElement.remove();this.labelLayer.remove();this.leaderLayer.remove();this.edgeLayer.remove();this.returnLabel.remove();this.levelHint.remove();}
}
