import {Game,labels,NET_Y} from './game';
export const palette=['#f58268','#e8b744','#83a995','#baa0bd'];
export function render(ctx:CanvasRenderingContext2D,g:Game,reduced:boolean){
 ctx.clearRect(0,0,376,650);ctx.fillStyle='#fff9eb';ctx.fillRect(0,0,376,650);
 ctx.fillStyle='#e9dfc8';for(let x=20;x<376;x+=24)for(let y=65;y<560;y+=24){ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill();}
 ctx.fillStyle='#e8dec8';ctx.fillRect(0,46,376,1);
 ctx.font='bold 10px monospace';ctx.fillStyle='#96836e';ctx.textAlign='left';ctx.fillText('BATCH '+String(g.level+1).padStart(2,'0'),20,28);ctx.textAlign='right';ctx.fillText(g.mode==='relaxed'?'∞  TAKE YOUR TIME':'♥  '+g.lives,356,28);
 for(const b of g.bricks){if(b.hp<=0)continue;const color=b.kind==='#'?'#686b68':palette[b.color];ctx.fillStyle=b.kind==='e'?'#e7664d':color;ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,5);ctx.fill();ctx.fillStyle='#ffffff40';ctx.fillRect(b.x+5,b.y+3,b.w-10,2);ctx.fillStyle='#fff8e8';ctx.font='bold 13px monospace';ctx.textAlign='center';if(b.kind==='#')ctx.fillText('≡',b.x+b.w/2,b.y+b.h/2+4);if(b.kind==='e')ctx.fillText('✦',b.x+b.w/2,b.y+b.h/2+5);if(b.kind==='t'){ctx.fillStyle=b.hp===2?'#fff8e8':'#ffffff66';ctx.fillRect(b.x+b.w/2-5,b.y+b.h/2-1,3,3);if(b.hp===2)ctx.fillRect(b.x+b.w/2+2,b.y+b.h/2-1,3,3);}}
 if(!reduced)for(const p of g.particles){ctx.globalAlpha=p.ttl/.55;ctx.fillStyle=palette[p.color];ctx.beginPath();ctx.arc(p.x,p.y,3,0,7);ctx.fill();}ctx.globalAlpha=1;
 for(const blast of g.blasts){ctx.strokeStyle='#e5ad39';ctx.lineWidth=3;ctx.globalAlpha=Math.min(1,blast.ttl*4);ctx.beginPath();ctx.arc(blast.x,blast.y,reduced?25:20+(1-blast.ttl/.45)*32,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;
 if(g.safetyNet==='armed'||g.netFlash>0){
  ctx.save();ctx.globalAlpha=g.safetyNet==='armed'?.85:g.netFlash*2;ctx.strokeStyle='#75a68f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(8,NET_Y);ctx.quadraticCurveTo(188,NET_Y+8,368,NET_Y);ctx.stroke();
  ctx.lineWidth=1;for(let x=12;x<368;x+=12){ctx.beginPath();ctx.moveTo(x,NET_Y);ctx.lineTo(Math.min(368,x+8),NET_Y+8);ctx.moveTo(x,NET_Y+8);ctx.lineTo(Math.min(368,x+8),NET_Y);ctx.stroke();}ctx.restore();
 }
 for(const p of g.pickups){ctx.fillStyle='#fff9eb';ctx.strokeStyle='#807052';ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(p.x-26,p.y-10,52,20,7);ctx.fill();ctx.stroke();ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillStyle=p.type==='net'?'#477b62':p.type==='bomb'?'#b88019':'#594b38';ctx.fillText(labels[p.type],p.x,p.y+3);}
 for(const s of g.shots){ctx.fillStyle='#e7664d';ctx.fillRect(s.x-2,s.y,4,14);}
 ctx.fillStyle=g.bombReady?'#e8b744':g.effects.sticky?'#84aa96':'#e46f55';ctx.beginPath();ctx.roundRect(g.paddle-g.width/2,570,g.width,12,6);ctx.fill();ctx.fillStyle='#ffffff75';ctx.fillRect(g.paddle-g.width/2+8,572,g.width-16,2);
 for(const b of g.balls){if(b.bomb){ctx.strokeStyle='#e9b23d';ctx.lineWidth=2;ctx.beginPath();ctx.arc(b.x,b.y,10,0,Math.PI*2);ctx.stroke();}ctx.fillStyle='#6b4f35';ctx.beginPath();ctx.arc(b.x,b.y,7,0,7);ctx.fill();ctx.fillStyle=b.bomb?'#f4b942':g.effects.strong?'#ee9e38':'#fff2b5';ctx.beginPath();ctx.arc(b.x,b.y-1,5,0,7);ctx.fill();}
 ctx.textAlign='center';ctx.fillStyle='#ad9c83';ctx.font='10px monospace';if(!g.balls.some(b=>b.held)&&!g.effects.laser)ctx.fillText('←  DRAG HERE TO MOVE  →',188,625);
 if(g.messageTime>0){ctx.fillStyle='#65513b';ctx.font='bold 11px monospace';ctx.fillText(g.message,188,530);}
 if(g.phase==='countdown'){ctx.fillStyle='#fff9ebcc';ctx.fillRect(0,47,376,550);ctx.font='bold 68px Georgia';ctx.fillStyle='#e46f55';ctx.fillText(String(Math.ceil(g.countdown)),188,340);}
}
