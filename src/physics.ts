export interface Hit {t:number; nx:number; ny:number}
// Sweep a circle against an expanded rectangle, using the slab intersection method.
export function sweep(x:number,y:number,dx:number,dy:number,rx:number,ry:number,rw:number,rh:number,r=7):Hit|null {
 const minX=rx-r,maxX=rx+rw+r,minY=ry-r,maxY=ry+rh+r;
 let near=-Infinity,far=Infinity,nx=0,ny=0;
 for(const [p,d,min,max,axis] of [[x,dx,minX,maxX,0],[y,dy,minY,maxY,1]]) {
  if(Math.abs(d)<1e-10){if(p<min||p>max)return null;continue;}
  const a=(min-p)/d,b=(max-p)/d,entry=Math.min(a,b),exit=Math.max(a,b);
  if(entry>near){near=entry;nx=axis===0?(d>0?-1:1):0;ny=axis===1?(d>0?-1:1):0;}
  far=Math.min(far,exit);if(near>far)return null;
 }
 return near>=-1e-8&&near<=1&&far>=0?{t:Math.max(0,near),nx,ny}:null;
}
export function rebound(offset:number,speed:number){const angle=Math.max(-1,Math.min(1,offset))*1.05;return {vx:Math.sin(angle)*speed,vy:-Math.max(speed*.45,Math.cos(angle)*speed)};}
