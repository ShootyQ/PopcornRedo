type FullscreenElement = HTMLElement & {webkitRequestFullscreen?:()=>void|Promise<void>};
type FullscreenDocument = Document & {webkitFullscreenElement?:Element;webkitExitFullscreen?:()=>void|Promise<void>;webkitFullscreenEnabled?:boolean};
export function inFullscreen(){const doc=document as FullscreenDocument;return !!(doc.fullscreenElement||doc.webkitFullscreenElement);}
export function fullscreenSupported(){const doc=document as FullscreenDocument;return !!(doc.fullscreenEnabled||doc.webkitFullscreenEnabled);}
export async function enterFullscreen(element:HTMLElement){
 if(inFullscreen())return;
 try{const target=element as FullscreenElement;if(target.requestFullscreen)await target.requestFullscreen();else await target.webkitRequestFullscreen?.();}catch{/* Keep the viewport-filling game when fullscreen is unsupported or denied. */}
}
export async function exitFullscreen(){
 if(!inFullscreen())return;
 try{const doc=document as FullscreenDocument;if(doc.exitFullscreen)await doc.exitFullscreen();else await doc.webkitExitFullscreen?.();}catch{/* A failed browser request must never interrupt the game. */}
}
