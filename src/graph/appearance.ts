import {Color} from 'three';
import type {Theme} from '../theme';

// CSS-sized solid cores and an antialiased annulus; a separated, faint outer halo
// is retained only in dark mode. Large hubs never grow into blurred discs.
export const pointVertexShader=`
attribute vec3 color;
attribute float size;
uniform float pixelRatio;
varying vec3 vColor;
varying float vDiameter;
void main(){
 vColor=color;
 vec4 mv=modelViewMatrix*vec4(position,1.0);
 gl_Position=projectionMatrix*mv;
 vDiameter=clamp(size*clamp(650.0/-mv.z,0.4,5.0),3.0,24.0);
 gl_PointSize=vDiameter*pixelRatio;
}`;
export const pointFragmentShader=`
uniform float lightMode;
varying vec3 vColor;
varying float vDiameter;
void main(){
 float r=length(gl_PointCoord-0.5)*vDiameter;
 float aa=max(fwidth(r),0.35);
 float ringRadius=vDiameter*0.35;
 float coreRadius=clamp(vDiameter*0.12,0.85,2.5);
 float core=1.0-smoothstep(coreRadius-aa*0.5,coreRadius+aa*0.5,r);
 float ring=(1.0-smoothstep(0.35,0.35+aa,abs(r-ringRadius)))*smoothstep(6.0,10.0,vDiameter)*0.8;
 float glow=(1.0-lightMode)*0.09*exp(-pow((r-coreRadius)/2.0,2.0));
 float alpha=max(core,max(ring,glow));
 if(alpha<0.015)discard;
 gl_FragColor=vec4(vColor,alpha);
 #include <colorspace_fragment>
}`;

export function mapEdgeColor(theme:Theme,type:string,selected:boolean,relevant:boolean,level:number,active:boolean){
 if(theme==='light'){
  const color=new Color(type==='PUBLISHED_CONTROL_MAPPING'?'#97346e':type==='DEFINED_BY'?'#276c71':'#375e7c');
  const strength=active?1:relevant?Math.max(.65,.95/level):selected?.22:.60;
  // Background interpolation is in linear light, matching Three's output conversion.
  return color.lerp(new Color('#f3f6f8'),1-strength);
 }
 const strength=active?1.5:relevant?.9/level:selected?.04:.10;
 return new Color(type==='PUBLISHED_CONTROL_MAPPING'?'#da91c6':type==='DEFINED_BY'?'#68cdd6':'#83a8e5').multiplyScalar(strength);
}
