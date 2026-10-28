import {makeBricks,levels,BRICK_GRID} from './levels';
import {rebound,sweep} from './physics';
import type {Ball,Brick,Mode,Phase,Pickup,Upgrade,SavedRun,SafetyNetState,LifeDrops} from './types';
export const labels:Record<Upgrade,string>={wide:'WIDE',sticky:'STICKY',multi:'MULTI',slow:'SLOW',laser:'LASER',strong:'POWER',life:'+1 LIFE',net:'NET',bomb:'BOMB'};
// Sparse ball-earned drops; weapons cannot generate their own refill loop.
export const PICKUP_DROP_CHANCE=.15;
export const PICKUP_DROP_GAP=2;
export const upgrades=Object.keys(labels) as Upgrade[];
export const NET_Y=638;
export const PADDLE_Y=570,PADDLE_HEIGHT=12,PICKUP_HALF_WIDTH=26,PICKUP_HALF_HEIGHT=10;
// Life drops have their own level budget; bombs have half the common weight.
export function chooseUpgrade(roll:number,netAvailable:boolean,laserAvailable=true):Upgrade {
 const pool:{type:Upgrade;weight:number}[]=[...(['wide','sticky','multi','slow','laser','strong'] as Upgrade[]).filter(type=>type!=='laser'||laserAvailable).map(type=>({type,weight:type==='laser'?.25:1})),{type:'bomb',weight:.5}];
 if(netAvailable)pool.push({type:'net',weight:1});
 let pick=Math.max(0,Math.min(.999999,roll))*pool.reduce((sum,item)=>sum+item.weight,0);
 for(const item of pool){pick-=item.weight;if(pick<0)return item.type;}
 return 'wide';
}
export class Game {
 autoFireLasers=false;wideExpiryPending=false;
 safetyNet:SafetyNetState='unused';netFlash=0;bombReady=false;blasts:{x:number;y:number;ttl:number}[]=[];
 lifeQuota:1|2=1;lifeIssued=0;bricksDestroyed=0;dropCooldown=0;
 phase:Phase='home';mode:Mode='relaxed';level=0;lives=3;paddle=188;balls:Ball[]=[];bricks:Brick[]=[];pickups:Pickup[]=[];shots:{x:number;y:number}[]=[];effects:Partial<Record<Upgrade,number>>={};particles:{x:number;y:number;vx:number;vy:number;ttl:number;color:number}[]=[];countdown=0;cooldown=0;message='';messageTime=0;
 onChange=()=>{};onBoundary=()=>{};onSound=(high:boolean)=>{};
 get width(){return this.effects.wide?108:76;}
 get speed(){return (290+this.level*5)*1.05*(this.effects.slow?.68:1);}
 start(mode:Mode,level:number,lives:number,progress?:SavedRun){this.mode=mode;this.level=level;this.lives=lives;this.safetyNet=progress?.safetyNet??'unused';this.load(progress?.lifeDrops);}
 resetEffects(){this.wideExpiryPending=false;this.effects={};this.pickups=[];this.shots=[];this.cooldown=0;this.bombReady=false;}
 load(progress?:LifeDrops){this.bricks=makeBricks(this.level);this.resetEffects();this.paddle=188;this.balls=[this.held()];this.phase='playing';this.particles=[];this.blasts=[];this.netFlash=0;this.dropCooldown=0;this.lifeQuota=progress?.level===this.level?progress.quota:Math.random()<.25?2:1;this.lifeIssued=progress?.level===this.level?progress.issued:0;this.bricksDestroyed=progress?.level===this.level?progress.destroyed:0;this.onChange();}
 held():Ball{return {x:this.paddle,y:557,vx:0,vy:0,held:true};}
 positionHeld(b:Ball){const offset=Math.max(-this.width/2-6,Math.min(this.width/2+6,b.heldOffset??0));b.x=Math.max(7,Math.min(369,this.paddle+offset));b.y=557;if(b.heldOffset!==undefined)b.heldOffset=b.x-this.paddle;}
 move(x:number){this.paddle=Math.max(this.width/2+8,Math.min(368-this.width/2,x));}
 action(){if(this.phase!=='playing')return;for(const b of this.balls)if(b.held){const offset=b.heldOffset;this.positionHeld(b);Object.assign(b,rebound(offset===undefined?.15:offset/(this.width/2),this.speed),{held:false});delete b.heldOffset;}this.fireLasers();this.onChange();}
 fireLasers(){if(this.phase==='playing'&&this.effects.laser&&this.cooldown<=0){this.shots.push({x:this.paddle-22,y:565},{x:this.paddle+22,y:565});this.cooldown=.25;this.onSound(true);}}
 pause(){if(this.phase==='playing'||this.phase==='countdown'){this.phase='paused';this.onChange();}}
 resume(){this.countdown=3;this.phase='countdown';this.onChange();}
 next(){if(this.level===levels.length-1){this.phase='complete';this.onBoundary();this.onChange();return;}this.level++;this.load();this.onBoundary();}
 apply(type:Upgrade){if(type==='life'&&this.mode==='relaxed')type='wide';if(type==='net'){if(this.safetyNet==='armed'||this.safetyNet==='spent')return;this.safetyNet='armed';}else if(type==='bomb')this.bombReady=true;else if(type==='life')this.lives++;else if(type==='multi'){const source=this.balls.find(b=>!b.held)||this.balls[0];if(source)for(const offset of [-.55,.55])if(this.balls.length<5)this.balls.push({x:source.x,y:source.y,...rebound(offset,this.speed),held:false});}else {this.effects[type]=15;if(type==='wide')this.wideExpiryPending=false;}this.message=labels[type];this.messageTime=2;this.onSound(true);this.onChange();}
 damage(brick:Brick,blast=false,allowRandomDrop=true){if(brick.hp<=0||brick.kind==='#')return;brick.hp-=blast?brick.hp:this.effects.strong?2:1;if(brick.hp>0){this.onSound(false);return;}this.onSound(true);for(let i=0;i<7;i++)this.particles.push({x:brick.x+brick.w/2,y:brick.y+brick.h/2,vx:(Math.random()-.5)*150,vy:-Math.random()*130,ttl:.55,color:brick.color});this.bricksDestroyed=Math.min(this.totalBricks,this.bricksDestroyed+1);this.dropFrom(brick,allowRandomDrop);if(brick.kind==='e')for(const other of this.bricks)if(other!==brick&&Math.abs(other.x-brick.x)<=Math.max(other.w,brick.w)+7&&Math.abs(other.y-brick.y)<=Math.max(other.h,brick.h)+9)this.damage(other,false,false);}
 get totalBricks(){return this.bricks.filter(brick=>brick.kind!=='#').length;}
 dropFrom(brick:Brick,allowRandomDrop=true){
  const at={x:brick.x+brick.w/2,y:brick.y};
  const milestone=Math.ceil(this.totalBricks*(this.lifeIssued===0?.35:.7));
  if(this.mode==='classic'&&this.lifeIssued<this.lifeQuota&&this.bricksDestroyed>=milestone){
   this.lifeIssued++;this.pickups.push({...at,type:'life'});this.onChange();return;
  }
  if(!allowRandomDrop||this.dropCooldown>0||Math.random()>=PICKUP_DROP_CHANCE)return;
  const type=chooseUpgrade(Math.random(),this.safetyNet==='unused',!this.effects.laser&&!this.pickups.some(pickup=>pickup.type==='laser'));
  if(type==='net'){this.safetyNet='offered';this.onChange();}
  this.pickups.push({...at,type});this.dropCooldown=PICKUP_DROP_GAP;
 }
 explode(brick:Brick){
  this.blasts.push({x:brick.x+brick.w/2,y:brick.y+brick.h/2,ttl:.45});
  for(const other of this.bricks)if(Math.abs(other.x-brick.x)<=BRICK_GRID.pitchX+1&&Math.abs(other.y-brick.y)<=BRICK_GRID.pitchY+1)this.damage(other,true,false);
  this.onSound(true);
 }
 update(dt:number){
 if(this.phase==='countdown'){this.countdown-=dt;if(this.countdown<=0){this.phase='playing';this.onChange();}return;}
 if(this.phase!=='playing')return;
 for(const type of upgrades)if(this.effects[type]){this.effects[type]!-=dt;if(this.effects[type]!<=0){if(type==='wide'&&this.balls.some(ball=>!ball.held)){this.effects.wide=Number.EPSILON;this.wideExpiryPending=true;}else {delete this.effects[type];this.onChange();}}}
 this.cooldown-=dt;this.dropCooldown=Math.max(0,this.dropCooldown-dt);this.messageTime-=dt;this.netFlash=Math.max(0,this.netFlash-dt);for(const blast of this.blasts)blast.ttl-=dt;this.blasts=this.blasts.filter(blast=>blast.ttl>0);
 if(this.autoFireLasers&&this.balls.some(ball=>!ball.held))this.fireLasers();
 for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=320*dt;p.ttl-=dt;}this.particles=this.particles.filter(p=>p.ttl>0);
 let bouncedOnPaddle=false;
 for(const b of this.balls){
 if(b.held){this.positionHeld(b);continue;}
 const speed=this.speed,mag=Math.hypot(b.vx,b.vy);b.vx=b.vx/mag*speed;b.vy=b.vy/mag*speed;
 let remaining=dt;
 for(let n=0;n<8&&remaining>1e-7;n++){
 let best={t:1.01,nx:0,ny:0},target:Brick|undefined,paddleHit=false,netHit=false;
 const consider=(hit:ReturnType<typeof sweep>,brick?:Brick,isPaddle=false,isNet=false)=>{if(hit&&hit.t<best.t){best=hit;target=brick;paddleHit=isPaddle;netHit=isNet;}};
 const dx=b.vx*remaining,dy=b.vy*remaining;
 if(dx<0)consider({t:(7-b.x)/dx,nx:1,ny:0});if(dx>0)consider({t:(369-b.x)/dx,nx:-1,ny:0});if(dy<0)consider({t:(52-b.y)/dy,nx:0,ny:1});
 if(dy>0){consider(sweep(b.x,b.y,dx,dy,this.paddle-this.width/2,PADDLE_Y,this.width,PADDLE_HEIGHT),undefined,true);if(this.safetyNet==='armed')consider(sweep(b.x,b.y,dx,dy,7,NET_Y,362,2),undefined,false,true);}
 for(const brick of this.bricks)if(brick.hp>0)consider(sweep(b.x,b.y,dx,dy,brick.x,brick.y,brick.w,brick.h),brick);
 if(best.t>1||best.t<0){b.x+=dx;b.y+=dy;break;}
 b.x+=dx*best.t;b.y+=dy*best.t;remaining*=1-best.t;
 if(netHit){b.vy=-Math.abs(b.vy);this.safetyNet='spent';this.netFlash=.5;this.message='CAUGHT BY THE SAFETY NET!';this.messageTime=2;this.onSound(true);this.onChange();}else if(paddleHit){bouncedOnPaddle=true;if(this.bombReady){b.bomb=true;this.bombReady=false;this.onChange();}Object.assign(b,rebound((b.x-this.paddle)/(this.width/2),speed));if(this.effects.sticky){b.held=true;b.heldOffset=b.x-this.paddle;b.y=557;this.onChange();break;}this.onSound(false);}else{if(best.nx)b.vx*=-1;if(best.ny)b.vy*=-1;if(target){if(b.bomb&&target.kind!=='#'){b.bomb=false;this.explode(target);}else this.damage(target);}}
 b.x+=best.nx*.05;b.y+=best.ny*.05;
 }
 }
 this.balls=this.balls.filter(b=>b.y<655);
 for(const p of this.pickups){const oldY=p.y;p.y+=105*dt;if(p.y+PICKUP_HALF_HEIGHT>=PADDLE_Y&&oldY-PICKUP_HALF_HEIGHT<=PADDLE_Y+PADDLE_HEIGHT&&Math.abs(p.x-this.paddle)<=this.width/2+PICKUP_HALF_WIDTH){this.apply(p.type);p.y=700;}}this.pickups=this.pickups.filter(p=>p.y<660);
 if(this.wideExpiryPending&&bouncedOnPaddle){delete this.effects.wide;this.wideExpiryPending=false;this.move(this.paddle);this.onChange();}
 for(const s of this.shots){const old=s.y;s.y-=600*dt;const brick=this.bricks.filter(b=>b.hp>0&&s.x>=b.x&&s.x<=b.x+b.w&&b.y+b.h>=s.y&&b.y<=old).sort((a,b)=>b.y-a.y)[0];if(brick){this.damage(brick,false,false);s.y=-100;}}this.shots=this.shots.filter(s=>s.y>50);
 if(!this.bricks.some(b=>b.kind!=='#'&&b.hp>0)){this.phase='clear';this.resetEffects();this.onBoundary();this.onChange();return;}
 if(!this.balls.length){this.resetEffects();if(this.mode==='classic'){this.lives--;if(this.lives<=0){this.phase='over';this.onBoundary();this.onChange();return;}}else this.bricks=makeBricks(this.level);this.balls=[this.held()];this.message=this.mode==='relaxed'?'FRESH TRY. YOU’VE GOT THIS!':'BACK TO THE BOUNCE';this.messageTime=3;this.onChange();}
 }
 get title(){return levels[this.level].name;}
}
