import {useEffect,useRef,useState,type RefObject} from 'react';
import {ArrowLeft,Focus,Hand,Maximize2,Minus,Plus,Rotate3D,RotateCcw} from 'lucide-react';
import type {Entity,Edge} from '../data/types';
import type {Position} from '../graph/model';
import {regions} from '../graph/exploration';
import type {MapView,ViewReader} from '../graph/journey';
import {UniverseEngine} from '../graph/universe-engine';
interface Props {viewReader:RefObject<ViewReader<MapView>|null>;restoredView?:MapView;overviewVersion:number;onOverview:()=>void;nodes:Entity[];allNodes:Entity[];destinations:Entity[];distances:Map<string,number>;connectionDepth:number;positions:Map<string,Position>;edges:Edge[];selected?:string;activeEdge:string;onSelect:(id:string)=>void;onExplore:()=>void;onEdge:(edge:Edge)=>void;focus:boolean;flyTo:number;reduced:boolean;labels:boolean;onFallback:()=>void}
export default function Universe({viewReader,restoredView,overviewVersion,onOverview,nodes,allNodes,destinations,distances,connectionDepth,positions,edges,selected,activeEdge,onSelect,onExplore,onEdge,focus,flyTo,reduced,labels,onFallback}:Props){
 const host=useRef<HTMLDivElement>(null),engine=useRef<UniverseEngine|null>(null),latest=useRef({onSelect,onEdge});latest.current={onSelect,onEdge};
 const previousDepth=useRef(connectionDepth);
 const [travel,setTravel]=useState('');
 const [failed,setFailed]=useState(false),[mode,setMode]=useState<'pan'|'orbit'>('pan'),[backAvailable,setBackAvailable]=useState(false);
 useEffect(()=>{let instance:UniverseEngine;try{instance=new UniverseEngine(host.current!,positions,allNodes,id=>latest.current.onSelect(id),edge=>latest.current.onEdge(edge),setBackAvailable,()=>setFailed(true));engine.current=instance;viewReader.current={capture:()=>instance.captureView()};}catch{setFailed(true);return;}return()=>{instance.dispose();engine.current=null;viewReader.current=null;};},[positions,allNodes,viewReader]);
 useEffect(()=>{engine.current?.setData(nodes,edges,selected,activeEdge,distances,connectionDepth);if(previousDepth.current!==connectionDepth&&selected)engine.current?.fitConnections();previousDepth.current=connectionDepth;},[nodes,edges,selected,activeEdge,distances,connectionDepth]);
 useEffect(()=>engine.current?.setOptions(labels,reduced),[labels,reduced]);
 useEffect(()=>engine.current?.setMode(mode),[mode]);
 useEffect(()=>{if(focus||flyTo)engine.current?.fitConnections();},[focus,flyTo]);
 useEffect(()=>{if(travel){if(travel.startsWith('region:'))engine.current?.openRegion(travel.slice(7));else engine.current?.fitConnections();setTravel('');}},[travel,nodes]);
 useEffect(()=>{if(overviewVersion)engine.current?.resetView(false);},[overviewVersion]);
 useEffect(()=>{if(restoredView)engine.current?.restoreView(restoredView);},[restoredView]);
 return <><div className="universe" ref={host}>{failed&&<div className="webgl-fallback"><h2>Explore without WebGL</h2><p>Your browser could not render the 3D graph. Every imported entity and citation is available in the table.</p><button onClick={onFallback}>Open accessible table</button></div>}</div>
 {!failed&&<><div className="group-directory"><label>Explore groups <select aria-label="Explore groups" value="" onChange={e=>{const value=e.target.value;if(value.startsWith('region:'))onExplore();else onSelect(value);setTravel(value);}}><option value="">Choose a destination…</option>{regions.map(region=><optgroup key={region.id} label={region.title}>{destinations.some(n=>region.kinds.includes(n.kind))&&<option value={'region:'+region.id}>{region.title} · whole region</option>}{destinations.filter(n=>n.kind===region.groupKind).sort((a,b)=>a.title.localeCompare(b.title)).map(n=><option key={n.id} value={n.id}>{n.title}</option>)}</optgroup>)}</select></label></div><div className="navigation-toolbar" aria-label="Map navigation"><div className="navigation-modes"><button aria-label="Pan map" aria-pressed={mode==='pan'} onClick={()=>setMode('pan')}><Hand size={14}/>Pan</button><button aria-label="Orbit map" aria-pressed={mode==='orbit'} onClick={()=>setMode('orbit')}><Rotate3D size={14}/>Orbit</button></div><button aria-label="Fit connections" title="Fit selection and connections (F)" onClick={()=>engine.current?.fitConnections()}><Focus size={14}/><span>Fit connections</span></button><button aria-label="Back view" disabled={!backAvailable} title="Previous camera view (Escape)" onClick={()=>engine.current?.back()}><ArrowLeft size={14}/><span>Camera back</span></button></div>
 <div className="graph-help"><span>DRAG <small>to {mode}</small></span><b>·</b><span>SCROLL <small>toward pointer</small></span><b>·</b><span>CLICK <small>to inspect</small></span></div>
 <div className="graph-controls"><button aria-label="Zoom in" onClick={()=>engine.current?.zoom(.8)}><Plus size={17}/></button><button aria-label="Zoom out" onClick={()=>engine.current?.zoom(1.25)}><Minus size={17}/></button><span/><button aria-label="Fit all entities" title="Fit all visible entities; keep the current angle (Home)" onClick={()=>engine.current?.fitAll()}><Maximize2 size={17}/></button><button aria-label="Reset view" title="Restore starting orientation, center, zoom and Pan mode" onClick={()=>{setMode('pan');onOverview();engine.current?.resetView();}}><RotateCcw size={17}/></button></div></>}
 </>;
}
