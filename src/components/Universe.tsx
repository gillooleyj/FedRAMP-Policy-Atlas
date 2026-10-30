import {useEffect,useRef,useState} from 'react';
import {ArrowLeft,Focus,Hand,Maximize2,Minus,Plus,Rotate3D,RotateCcw} from 'lucide-react';
import type {Entity,Edge} from '../data/types';
import type {Position} from '../graph/model';
import {UniverseEngine} from '../graph/universe-engine';
interface Props {nodes:Entity[];allNodes:Entity[];positions:Map<string,Position>;edges:Edge[];selected?:string;activeEdge:string;onSelect:(id:string)=>void;onEdge:(edge:Edge)=>void;focus:boolean;flyTo:number;reduced:boolean;labels:boolean;onFallback:()=>void}
export default function Universe({nodes,allNodes,positions,edges,selected,activeEdge,onSelect,onEdge,focus,flyTo,reduced,labels,onFallback}:Props){
 const host=useRef<HTMLDivElement>(null),engine=useRef<UniverseEngine|null>(null),latest=useRef({onSelect,onEdge});latest.current={onSelect,onEdge};
 const [failed,setFailed]=useState(false),[mode,setMode]=useState<'pan'|'orbit'>('pan'),[backAvailable,setBackAvailable]=useState(false);
 useEffect(()=>{let instance:UniverseEngine;try{instance=new UniverseEngine(host.current!,positions,allNodes,id=>latest.current.onSelect(id),edge=>latest.current.onEdge(edge),setBackAvailable,()=>setFailed(true));engine.current=instance;}catch{setFailed(true);return;}return()=>{instance.dispose();engine.current=null;};},[positions,allNodes]);
 useEffect(()=>engine.current?.setData(nodes,edges,selected,activeEdge),[nodes,edges,selected,activeEdge]);
 useEffect(()=>engine.current?.setOptions(labels,reduced),[labels,reduced]);
 useEffect(()=>engine.current?.setMode(mode),[mode]);
 useEffect(()=>{if(focus||flyTo)engine.current?.fitConnections();},[focus,flyTo]);
 return <><div className="universe" ref={host}>{failed&&<div className="webgl-fallback"><h2>Explore without WebGL</h2><p>Your browser could not render the 3D graph. Every imported entity and citation is available in the table.</p><button onClick={onFallback}>Open accessible table</button></div>}</div>
 {!failed&&<><div className="navigation-toolbar" aria-label="Map navigation"><div className="navigation-modes"><button aria-label="Pan map" aria-pressed={mode==='pan'} onClick={()=>setMode('pan')}><Hand size={14}/>Pan</button><button aria-label="Orbit map" aria-pressed={mode==='orbit'} onClick={()=>setMode('orbit')}><Rotate3D size={14}/>Orbit</button></div><button aria-label="Fit connections" title="Fit selection and connections (F)" onClick={()=>engine.current?.fitConnections()}><Focus size={14}/><span>Fit connections</span></button><button aria-label="Back view" disabled={!backAvailable} title="Previous camera view (Escape)" onClick={()=>engine.current?.back()}><ArrowLeft size={14}/><span>Back</span></button></div>
 <div className="graph-help"><span>DRAG <small>to {mode}</small></span><b>·</b><span>SCROLL <small>toward pointer</small></span><b>·</b><span>CLICK <small>to inspect</small></span></div>
 <div className="graph-controls"><button aria-label="Zoom in" onClick={()=>engine.current?.zoom(.8)}><Plus size={17}/></button><button aria-label="Zoom out" onClick={()=>engine.current?.zoom(1.25)}><Minus size={17}/></button><span/><button aria-label="Fit all entities" title="Fit all visible entities; keep the current angle (Home)" onClick={()=>engine.current?.fitAll()}><Maximize2 size={17}/></button><button aria-label="Reset view" title="Restore starting orientation, center, zoom and Pan mode" onClick={()=>{setMode('pan');engine.current?.resetView();}}><RotateCcw size={17}/></button></div></>}
 </>;
}
