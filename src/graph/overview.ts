import * as THREE from 'three';
import type {Position} from './model';

export interface OverviewFrame {target:Position;corners:Position[];zoom:number;level:string;region?:string}
/** A fixed front projection of the actual layout, independent of camera orbit. */
export function overviewProjection(points:Position[],width=200,height=124,padding=12){
 let minX=0,maxX=0,minY=0,maxY=0;
 for(const [x,y] of points){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
 const scale=Math.min((width-padding*2)/Math.max(1,maxX-minX),(height-padding*2)/Math.max(1,maxY-minY));
 const center=[(minX+maxX)/2,(minY+maxY)/2];
 return {project:(p:Position)=>[width/2+(p[0]-center[0])*scale,height/2-(p[1]-center[1])*scale],unproject:(x:number,y:number,z:number):Position=>[(x-width/2)/scale+center[0],-(y-height/2)/scale+center[1],z]};
}
/** Project the view's rectangle on the plane through the orbit target, not on z=0.
 * This stays finite while orbiting; the locator explicitly labels its front projection. */
export function overviewFrame(camera:THREE.PerspectiveCamera,target:THREE.Vector3,overviewDistance:number):Omit<OverviewFrame,'level'|'region'>{
 camera.updateMatrixWorld();
 const normal=camera.getWorldDirection(new THREE.Vector3()),plane=new THREE.Plane().setFromNormalAndCoplanarPoint(normal,target),ray=new THREE.Raycaster();
 const corners=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([x,y])=>{ray.setFromCamera(new THREE.Vector2(x,y),camera);return (ray.ray.intersectPlane(plane,new THREE.Vector3())??target).toArray() as Position;});
 return {target:target.toArray() as Position,corners,zoom:overviewDistance/Math.max(.01,camera.position.distanceTo(target))};
}
