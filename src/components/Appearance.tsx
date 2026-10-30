import {useEffect,useRef} from 'react';
import {Palette} from 'lucide-react';
import type {useAppearance} from '../theme';

export default function Appearance({appearance:a}:{appearance:ReturnType<typeof useAppearance>}){
 const ref=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{const outside=(e:PointerEvent)=>{if(ref.current&&!ref.current.contains(e.target as Node))ref.current.open=false;},key=(e:KeyboardEvent)=>{if(e.key==='Escape'&&ref.current?.open){ref.current.open=false;ref.current.querySelector('summary')?.focus();}};document.addEventListener('pointerdown',outside);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',key);};},[]);
 return <details className="appearance" ref={ref}><summary aria-label="Appearance" title="Appearance"><Palette size={16}/><span>Appearance</span></summary><div className="appearance-panel"><strong>Make it comfortable</strong><label>Site theme<select aria-label="Site theme" value={a.site} onChange={e=>a.setSite(e.target.value as typeof a.site)}><option value="system">Use device setting</option><option value="light">Light</option><option value="dark">Dark</option></select></label><label>Map theme<select aria-label="Map theme" value={a.map} onChange={e=>a.setMap(e.target.value as typeof a.map)}><option value="site">Follow site theme</option><option value="light">Light</option><option value="dark">Dark</option></select></label><p>Saved on this device. Your map position and filters stay in place.</p></div></details>;
}
