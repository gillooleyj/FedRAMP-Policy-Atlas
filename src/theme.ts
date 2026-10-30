import {useEffect,useLayoutEffect,useState} from 'react';
import type {Entity} from './data/types';
import {entityColor} from './graph/model';

export type Theme='light'|'dark';
type SitePreference=Theme|'system';
type MapPreference=Theme|'site';
export function storedPreference<T extends string>(key:string,allowed:readonly T[],fallback:T):T{
 try{const value=localStorage.getItem(key);return allowed.includes(value as T)?value as T:fallback;}catch{return fallback;}
}
export function useAppearance(){
 const [site,setSite]=useState(()=>storedPreference('atlas-site-theme',['light','dark','system'] as const,'system'));
 const [map,setMap]=useState(()=>storedPreference('atlas-map-theme',['light','dark','site'] as const,'dark'));
 const [system,setSystem]=useState<Theme>(()=>matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
 useEffect(()=>{const media=matchMedia('(prefers-color-scheme: dark)'),change=()=>setSystem(media.matches?'dark':'light');media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 const theme=site==='system'?system:site,mapTheme=map==='site'?theme:map;
 useLayoutEffect(()=>{document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#101820':'#fafaf6');},[theme]);
 useEffect(()=>{try{localStorage.setItem('atlas-site-theme',site);localStorage.setItem('atlas-map-theme',map);}catch{/* In-memory preferences still work when storage is unavailable. */}},[site,map]);
 return {site,setSite:(v:SitePreference)=>setSite(v),map,setMap:(v:MapPreference)=>setMap(v),theme,mapTheme};
}
export function mapEntityColor(n:Pick<Entity,'kind'|'sourceId'>,theme:Theme){
 if(theme==='dark')return entityColor(n);
 return n.sourceId==='nist'?'#8c5b12':['ksi','theme'].includes(n.kind)?'#a43577':n.kind==='class'?'#74519e':n.kind==='definition'?'#246f73':'#245d84';
}
