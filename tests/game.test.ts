import {ControllerInput,stick} from '../src/controller';
import type {ControllerPad} from '../src/controller';
import {describe,it,expect,beforeEach,vi} from 'vitest';
import {Game,PICKUP_DROP_CHANCE,chooseUpgrade,NET_Y,PICKUP_DROP_GAP} from '../src/game';
import {makeBricks,levels,BRICK_GRID} from '../src/levels';
import {sweep,rebound} from '../src/physics';
import {readSave,writeSave,checkpointRun} from '../src/storage';
describe('physics',()=>{
it('sweeps through high speed brick paths',()=>{expect(sweep(50,100,0,-200,30,20,42,21)?.ny).toBe(1);expect(sweep(0,30,100,0,30,20,42,21)?.nx).toBe(-1);expect(sweep(0,0,0,10,30,20,42,21)).toBeNull();});
it('handles corners and parallel travel',()=>{expect(sweep(0,0,100,100,30,30,20,20)).not.toBeNull();expect(sweep(0,0,0,100,30,30,20,20)).toBeNull();});
it('always rebounds up, with controlled angles',()=>{for(const offset of [-2,-1,0,1,2])expect(rebound(offset,300).vy).toBeLessThanOrEqual(-135);expect(rebound(-1,300).vx).toBeLessThan(0);});
it('reflects walls and paddle',()=>{const g=new Game();g.start('classic',0,3);g.balls=[{x:8,y:400,vx:-290,vy:0,held:false}];g.update(.02);expect(g.balls[0].vx).toBeGreaterThan(0);g.balls=[{x:g.paddle+20,y:550,vx:0,vy:290,held:false}];g.update(.08);expect(g.balls[0].vy).toBeLessThan(0);expect(g.balls[0].vx).toBeGreaterThan(0);});
});
describe('campaign and rules',()=>{
let g:Game;beforeEach(()=>{g=new Game();g.start('classic',0,3);});
it('contains 30 nonempty layouts with no sealed brick rows',()=>{expect(levels).toHaveLength(30);for(let i=0;i<levels.length;i++){const bricks=makeBricks(i);expect(bricks.some(b=>b.kind!=='#')).toBe(true);expect(levels[i].rows.every(r=>r.length===BRICK_GRID.columns)).toBe(true);expect(bricks.filter(b=>b.kind==='#').length).toBeLessThan(4);}});
it('tough takes two hits; obstacles never break; explosions chain',()=>{g.bricks=makeBricks(2);const b=g.bricks.find(b=>b.kind==='t')!;g.damage(b);expect(b.hp).toBe(1);g.damage(b);expect(b.hp).toBe(0);const wall={x:0,y:0,w:42,h:21,hp:Infinity,kind:'#',color:0};g.damage(wall);expect(wall.hp).toBe(Infinity);g.bricks=[{...wall,hp:1,kind:'e'},{...wall,x:31,hp:1,kind:'e'},{...wall,x:62,hp:1,kind:'s'}];g.damage(g.bricks[0]);expect(g.bricks.every(b=>b.hp===0)).toBe(true);});
it('power breaks tough bricks immediately',()=>{const b=makeBricks(2).find(b=>b.kind==='t')!;g.apply('strong');g.damage(b);expect(b.hp).toBe(0);});
it('refreshes timers and freezes them during pause and countdown',()=>{g.apply('wide');g.update(1);expect(g.effects.wide).toBe(14);g.apply('wide');expect(g.effects.wide).toBe(15);g.pause();g.update(10);expect(g.effects.wide).toBe(15);g.resume();g.update(3);expect(g.effects.wide).toBe(15);g.update(15);expect(g.effects.wide).toBeUndefined();});
it('counts last-ball loss only; caps multiball',()=>{g.action();g.apply('multi');g.apply('multi');g.apply('multi');expect(g.balls).toHaveLength(5);g.balls[0].y=700;g.update(.001);expect(g.lives).toBe(3);g.balls=[];g.update(.001);expect(g.lives).toBe(2);expect(g.balls[0].held).toBe(true);});
it('Classic retains damage, Relaxed resets bricks and replaces life',()=>{g.bricks[0].hp=0;g.balls=[];g.update(.001);expect(g.bricks[0].hp).toBe(0);g.start('relaxed',0,3);g.bricks[0].hp=0;g.balls=[];g.update(.001);expect(g.bricks[0].hp).toBe(1);g.apply('life');expect(g.effects.wide).toBe(15);expect(g.lives).toBe(3);});
it('ends a run and completes the campaign with boundary callbacks',()=>{const cb=vi.fn();g.onBoundary=cb;g.lives=1;g.balls=[];g.update(.001);expect(g.phase).toBe('over');expect(cb).toHaveBeenCalledOnce();g.start('relaxed',levels.length-1,3);g.bricks.forEach(b=>{if(b.kind!=='#')b.hp=0;});g.update(.001);expect(g.phase).toBe('clear');g.next();expect(g.phase).toBe('complete');});
});
describe('storage',()=>{
it('handles invalid and blocked storage and restores separate runs',()=>{const map=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>map.get(k),setItem:(k:string,v:string)=>map.set(k,v)});const s=readSave();s.runs.classic={level:8,lives:2};s.muted=true;writeSave(s);expect(readSave()).toEqual(s);map.set('butter-pop-v1','bad');expect(readSave().runs.classic.level).toBe(8);vi.stubGlobal('localStorage',{getItem:()=>{throw Error();},setItem:()=>{throw Error();}});expect(()=>writeSave(readSave())).not.toThrow();vi.unstubAllGlobals();});
});
describe('full layouts',()=>{it('can clear every level with paddle movement and normal game rules',()=>{vi.spyOn(Math,'random').mockReturnValue(.5);try{for(let level=0;level<levels.length;level++){const g=new Game();g.start('relaxed',level,3);for(let step=0;step<120*600&&g.phase==='playing';step++){const ball=g.balls.find(b=>!b.held)||g.balls[0];g.move(ball.x+Math.sin(step/180)*24);if(g.balls.some(b=>b.held))g.action();g.update(1/120);}expect(g.phase,`level ${level+1} should be reachable`).toBe('clear');}}finally{vi.restoreAllMocks();}},15000);});

describe('sticky contact and launch',()=>{
 it.each([-28,0,28])('holds contact offset %s and launches from that side',offset=>{
  const g=new Game();g.start('classic',0,3);g.apply('sticky');
  g.balls=[{x:g.paddle+offset,y:550,vx:0,vy:290,held:false}];
  const changed=vi.fn();g.onChange=changed;g.update(.08);
  const b=g.balls[0];expect(b.held).toBe(true);expect(b.heldOffset).toBeCloseTo(offset);expect(changed).toHaveBeenCalled();
  g.move(240);g.update(.01);expect(b.x).toBeCloseTo(240+offset);
  g.action();expect(b.held).toBe(false);expect(b.x).toBeCloseTo(240+offset);expect(b.vy).toBeLessThan(0);expect(Math.sign(b.vx)).toBe(Math.sign(offset));
 });
 it('keeps each sticky multiball contact independent after the effect expires',()=>{
  const g=new Game();g.start('classic',0,3);g.apply('sticky');
  g.balls=[-25,25].map(offset=>({x:g.paddle+offset,y:550,vx:0,vy:290,held:false}));g.update(.08);
  g.effects.sticky=.001;g.update(.01);expect(g.effects.sticky).toBeUndefined();g.move(210);g.action();
  expect(g.balls[0].x).toBeCloseTo(185);expect(g.balls[1].x).toBeCloseTo(235);expect(g.balls[0].vx).toBeLessThan(0);expect(g.balls[1].vx).toBeGreaterThan(0);
 });
 it('keeps edge catches inside the arena when moving to a wall',()=>{
  const g=new Game();g.start('classic',0,3);g.apply('sticky');g.balls=[{x:g.paddle+42,y:550,vx:0,vy:290,held:false}];g.update(.08);g.move(1000);g.update(.01);expect(g.balls[0].x).toBeLessThanOrEqual(369);g.action();expect(g.balls[0].vx).toBeGreaterThan(0);
 });
});

describe('dense arcade fields',()=>{
 it('starts with 88 bricks and keeps every field dense with top and side access',()=>{
  expect(makeBricks(0)).toHaveLength(88);
  for(let i=0;i<levels.length;i++){
   const bricks=makeBricks(i);expect(bricks.filter(b=>b.kind!=='#').length).toBeGreaterThanOrEqual(65);
   expect(Math.min(...bricks.map(b=>b.y))-52).toBeGreaterThanOrEqual(60);
   expect(Math.min(...bricks.map(b=>b.x))).toBeGreaterThan(12);
   expect(Math.max(...bricks.map(b=>b.x+b.w))).toBeLessThan(376-12);
   expect(Math.max(...bricks.map(b=>b.y+b.h))).toBeLessThan(360);
  }
 });
 it('lets a ball above the field ricochet off the ceiling and pop multiple bricks',()=>{
  const random=vi.spyOn(Math,'random').mockReturnValue(.5);
  try{const g=new Game();g.start('classic',0,3);g.balls=[{x:80,y:85,vx:270,vy:100,held:false}];let roofBounce=false;
   for(let i=0;i<480;i++){const b=g.balls[0];const vy=b.vy;g.update(1/120);if(vy<0&&b.vy>0&&b.y<65)roofBounce=true;}
   expect(roofBounce).toBe(true);expect(g.bricks.filter(b=>b.hp===0).length).toBeGreaterThanOrEqual(3);
  }finally{random.mockRestore();}
 });
});

describe('expanded campaign and drop tuning',()=>{
 it('continues past the old finale and only finishes after level 30',()=>{
  const g=new Game();g.start('classic',14,2);g.phase='clear';g.next();expect(g.level).toBe(15);expect(g.phase).toBe('playing');expect(g.lives).toBe(2);
  g.start('classic',29,2);g.phase='clear';g.next();expect(g.phase).toBe('complete');
 });
 it('keeps ordinary drop chance at eight percent',()=>{
  expect(PICKUP_DROP_CHANCE).toBeCloseTo(.08);
  const random=vi.spyOn(Math,'random');
  try{for(const [value,count] of [[.0799,1],[.08,0],[.14,0]]){random.mockReturnValue(value);const g=new Game();g.start('classic',0,3);g.damage(g.bricks[0]);expect(g.pickups).toHaveLength(count);}}finally{random.mockRestore();}
 });
 it('restores both old saves and new later levels',()=>{
  let raw='';vi.stubGlobal('localStorage',{getItem:()=>raw,setItem:(_k:string,v:string)=>{raw=v;}});
  try{const s=readSave();s.runs.classic={level:14,lives:2};s.runs.relaxed={level:29,lives:3};writeSave(s);expect(readSave().runs).toEqual(s.runs);s.runs.relaxed.level=30;writeSave(s);expect(readSave().runs.relaxed.level).toBe(0);}finally{vi.unstubAllGlobals();}
 });
});

describe('completion checkpoints',()=>{
 it.each(['relaxed','classic'] as const)('retains a cleared level 3 before Next is tapped in %s',mode=>{
  let raw:string|null=null;vi.stubGlobal('localStorage',{getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}});
  try{const saved=readSave(),g=new Game();g.start(mode,2,2);
   g.onBoundary=()=>{saved.runs[mode]=checkpointRun(g.level,g.lives,g.phase);writeSave(saved);};
   for(const b of g.bricks)if(b.kind!=='#')b.hp=0;g.update(.001);
   expect(g.phase).toBe('clear');expect(g.level).toBe(2);expect(readSave().runs[mode]).toEqual({level:3,lives:2});
   // Reloading and choosing Continue must start level 4.
   const continued=new Game(),run=readSave().runs[mode];continued.start(mode,run.level,run.lives);expect(continued.title).toBe(levels[3].name);
   // Taking Next also starts 4, and must not accidentally save 5.
   g.next();expect(g.level).toBe(3);expect(readSave().runs[mode].level).toBe(3);
  }finally{vi.unstubAllGlobals();}
 });
 it('only resets the campaign after the final level or game over',()=>{
  expect(checkpointRun(28,2,'clear')).toEqual({level:29,lives:2});
  expect(checkpointRun(29,2,'clear')).toEqual({level:0,lives:3});
  expect(checkpointRun(29,2,'complete')).toEqual({level:0,lives:3});
  expect(checkpointRun(2,0,'over')).toEqual({level:0,lives:3});
 });
});

describe('durable local saves',()=>{
 it('migrates old Classic progress and remembers the chosen mode',()=>{
  const map=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(key:string)=>map.get(key),setItem:(key:string,value:string)=>map.set(key,value)});
  try{map.set('butter-pop-v1',JSON.stringify({version:1,muted:true,seen:true,runs:{relaxed:{level:0,lives:3},classic:{level:5,lives:2}}}));
   const save=readSave();expect(save.lastMode).toBe('classic');save.lastMode='relaxed';expect(writeSave(save)).toBe(true);expect(readSave().lastMode).toBe('relaxed');
   // One damaged run must not erase the other mode or its settings.
   const raw=JSON.parse(map.get('butter-pop-v1')!);raw.runs.relaxed={level:-1,lives:3};map.set('butter-pop-v1',JSON.stringify(raw));expect(readSave().runs.classic).toEqual({level:5,lives:2});expect(readSave().runs.relaxed).toEqual({level:0,lives:3});expect(readSave().muted).toBe(true);
   map.set('butter-pop-v1','corrupt');expect(readSave().runs.classic.level).toBe(5);
  }finally{vi.unstubAllGlobals();}
 });
 it('reports blocked or silently discarded writes instead of claiming success',()=>{
  vi.stubGlobal('localStorage',{getItem:()=>null,setItem:()=>{throw new Error('Blocked');}});try{expect(writeSave(readSave())).toBe(false);}finally{vi.unstubAllGlobals();}
  vi.stubGlobal('localStorage',{getItem:()=>null,setItem:()=>{}});try{expect(writeSave(readSave())).toBe(false);}finally{vi.unstubAllGlobals();}
 });
});

// Gamepad state is independent of browser hardware so mappings and edge cases
// can be checked without pretending a physical Switch controller is attached.

describe('controller input',()=>{
 const pad=(pressed:number[]=[],axes=[0,0],index=0,mapping='standard'):ControllerPad=>({index,mapping,connected:true,axes,buttons:Array.from({length:16},(_,i)=>({pressed:pressed.includes(i)}))});
 it('filters drift and scales analogue movement',()=>{expect(stick(.17)).toBe(0);expect(stick(NaN)).toBe(0);expect(stick(1)).toBe(1);expect(stick(-1)).toBe(-1);expect(stick(.59)).toBeCloseTo(.5);});
 it('prioritizes D-pad and accepts both Nintendo face button mappings',()=>{const input=new ControllerInput();input.poll([pad()],0);expect(input.poll([pad([14],[1,0])],20).move).toBe(-1);expect(input.poll([pad([1])],40).confirm).toBe(true);expect(input.poll([pad([1])],50).confirm).toBe(false);input.poll([pad()],60);expect(input.poll([pad([0])],70).confirm).toBe(true);});
 it('ignores the discovery press and a held button after focus returns',()=>{const input=new ControllerInput();expect(input.poll([pad([1,9])],0).confirm).toBe(false);expect(input.poll([pad([1,9])],20).pause).toBe(false);input.poll([pad([1])],30,false);expect(input.poll([pad([1])],40).confirm).toBe(false);input.poll([pad()],50);expect(input.poll([pad([1])],60).confirm).toBe(true);});
 it('edges Pause, repeats menu navigation at a controlled rate, and releases movement on disconnect',()=>{const input=new ControllerInput();input.poll([pad()],0);expect(input.poll([pad([9])],10).pause).toBe(true);expect(input.poll([pad([9])],20).pause).toBe(false);expect(input.poll([pad([13])],30).nav).toBe(1);expect(input.poll([pad([13])],40).nav).toBe(0);expect(input.poll([pad([13])],380).nav).toBe(1);const lost=input.poll([],400);expect(lost.lost).toBe(true);expect(lost.move).toBe(0);expect(input.poll([pad([1])],420).confirm).toBe(false);});
 it('retains one active controller, handles sparse slots, and safely rejects unmapped devices',()=>{const input=new ControllerInput();input.poll([null,pad([], [0,0],1)],0);expect(input.poll([pad([1]),pad([],[-1,0],1)],10).move).toBe(-1);expect(input.poll([pad([], [0,0],0,'')],20).status).toBe('unmapped');expect(input.poll(null,30).status).toBe('unavailable');});
});

describe('optional laser autofire',()=>{
 const setup=()=>{const g=new Game();g.start('classic',0,3);g.apply('laser');g.action();g.shots=[];g.cooldown=0;return g;};
 it('defaults off and shares the manual firing cooldown',()=>{const g=setup();g.update(.01);expect(g.shots).toHaveLength(0);g.autoFireLasers=true;g.update(.01);expect(g.shots).toHaveLength(2);g.action();expect(g.shots).toHaveLength(2);g.update(.1);expect(g.shots).toHaveLength(2);g.update(.15);expect(g.shots).toHaveLength(4);});
 it('stops on pause, countdown, expiry, disabling, and loss of all balls',()=>{
  const g=setup();g.autoFireLasers=true;g.pause();g.update(1);expect(g.shots).toHaveLength(0);g.resume();g.update(3);expect(g.shots).toHaveLength(0);g.autoFireLasers=false;g.update(.01);expect(g.shots).toHaveLength(0);g.autoFireLasers=true;g.effects.laser=.001;g.update(.01);expect(g.shots).toHaveLength(0);g.apply('laser');g.balls=[];g.update(.01);expect(g.shots).toHaveLength(0);expect(g.effects.laser).toBeUndefined();
 });
 it('never launches held balls or fires while all balls are held',()=>{const g=new Game();g.start('classic',0,3);g.autoFireLasers=true;g.apply('laser');g.update(.1);expect(g.balls[0].held).toBe(true);expect(g.shots).toHaveLength(0);g.action();expect(g.balls[0].held).toBe(false);g.shots=[];g.cooldown=0;g.update(.01);expect(g.shots).toHaveLength(2);});
 it('persists the preference and defaults legacy saves to off',()=>{const map=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>map.get(k),setItem:(k:string,v:string)=>map.set(k,v)});try{const s=readSave();expect(s.autoFireLasers).toBe(false);s.autoFireLasers=true;writeSave(s);expect(readSave().autoFireLasers).toBe(true);map.clear();map.set('butter-pop-v1',JSON.stringify({version:1,runs:s.runs}));expect(readSave().autoFireLasers).toBe(false);}finally{vi.unstubAllGlobals();}});
});

describe('single campaign safety net',()=>{
 it('catches one ball without costing a life, then disappears',()=>{
  const g=new Game();g.start('classic',0,3);g.apply('net');g.balls=[{x:45,y:NET_Y-12,vx:0,vy:290,held:false}];g.update(.04);
  expect(g.safetyNet).toBe('spent');expect(g.balls[0].vy).toBeLessThan(0);expect(g.lives).toBe(3);expect(g.netFlash).toBeGreaterThan(0);
  g.apply('net');expect(g.safetyNet).toBe('spent');g.balls=[{x:45,y:NET_Y-12,vx:0,vy:290,held:false}];g.update(.15);expect(g.lives).toBe(2);expect(g.balls[0].held).toBe(true);
 });
 it('only rescues the first missed multiball and freezes while paused',()=>{
  const g=new Game();g.start('classic',0,3);g.apply('net');g.balls=[40,80].map(x=>({x,y:NET_Y-12,vx:0,vy:290,held:false}));g.pause();g.update(10);expect(g.safetyNet).toBe('armed');g.resume();g.update(3);g.update(.15);expect(g.safetyNet).toBe('spent');expect(g.balls).toHaveLength(1);expect(g.lives).toBe(3);
 });
 it('never offers another net even if the first was missed, and only resets on a new campaign',()=>{
  const g=new Game();g.start('relaxed',0,3);const random=vi.spyOn(Math,'random').mockReturnValue(.99);
  try{random.mockReturnValueOnce(0).mockReturnValueOnce(.99);g.dropFrom(g.bricks[0]);expect(g.pickups.some(p=>p.type==='net')).toBe(true);expect(g.safetyNet).toBe('offered');g.pickups=[];for(const b of g.bricks)g.damage(b,true);expect(g.pickups.some(p=>p.type==='net')).toBe(false);g.phase='clear';g.next();expect(g.safetyNet).toBe('offered');g.start('relaxed',0,3);expect(g.safetyNet).toBe('unused');}finally{random.mockRestore();}
 });
 it('keeps an armed net across levels and loses no charge while waiting for launch',()=>{const g=new Game();g.start('relaxed',0,3);g.apply('net');g.phase='clear';g.next();g.update(1);expect(g.safetyNet).toBe('armed');expect(g.balls[0].held).toBe(true);});
});
describe('Butter Bomb',()=>{
 it('loads on the next paddle hit and explodes on brick contact',()=>{
  const g=new Game();g.start('classic',0,3);g.apply('bomb');g.balls=[{x:188,y:550,vx:0,vy:290,held:false}];g.update(.08);const ball=g.balls[0];expect(ball.bomb).toBe(true);expect(g.bombReady).toBe(false);
  const target=g.bricks.find(b=>b.x===174&&b.y===186)!;ball.x=target.x+target.w/2;ball.y=target.y+target.h+9;ball.vx=0;ball.vy=-290;g.update(.03);expect(ball.bomb).toBe(false);expect(g.bricks.filter(b=>b.hp===0)).toHaveLength(9);expect(g.blasts).toHaveLength(1);
 });
 it('breaks tough neighbors, preserves obstacles, and does not affect distant bricks',()=>{
  const g=new Game();g.start('classic',2,3);const center=g.bricks.find(b=>b.x===174&&b.y===120)!;const near=g.bricks.find(b=>b.x===143&&b.y===120)!;near.kind='#';near.hp=Infinity;const far=g.bricks.find(b=>b.x===19)!;g.explode(center);expect(center.hp).toBe(0);expect(near.hp).toBe(Infinity);expect(far.hp).toBe(1);
 });
 it('works with sticky and multiball without arming every ball',()=>{const g=new Game();g.start('classic',0,3);g.apply('sticky');g.apply('bomb');g.balls=[170,205].map(x=>({x,y:550,vx:0,vy:290,held:false}));g.update(.08);expect(g.balls.filter(b=>b.bomb)).toHaveLength(1);expect(g.balls.every(b=>b.held)).toBe(true);g.action();expect(g.balls.filter(b=>b.bomb)).toHaveLength(1);g.balls=[];g.update(.001);expect(g.bombReady).toBe(false);expect(g.balls.some(b=>b.bomb)).toBe(false);});
 it('weights bomb drops at half a common upgrade and removes lives from the random pool',()=>{
  const counts=new Map<string,number>();for(let i=0;i<13500;i++){const type=chooseUpgrade(i/13500,true);counts.set(type,(counts.get(type)??0)+1);}expect(counts.get('bomb')).toBe(1000);expect(counts.get('wide')).toBe(2000);expect(counts.has('life')).toBe(false);for(let i=0;i<1000;i++)expect(chooseUpgrade(i/1000,false)).not.toBe('net');
 });
});
describe('bounded Classic life drops and persistent powerups',()=>{
 it.each([.24,.25,.9])('provides the fixed per-level life budget for random seed %s',roll=>{
  const random=vi.spyOn(Math,'random').mockReturnValue(roll);try{const g=new Game();g.start('classic',0,3);const quota=roll<.25?2:1;expect(g.lifeQuota).toBe(quota);for(const b of g.bricks)g.damage(b,true);expect(g.pickups.filter(p=>p.type==='life')).toHaveLength(quota);expect(g.lifeIssued).toBe(quota);for(const b of g.bricks)g.damage(b,true);expect(g.lifeIssued).toBe(quota);}finally{random.mockRestore();}
 });
 it('drops no extra-life pickups in Relaxed',()=>{const g=new Game();g.start('relaxed',0,3);for(const b of g.bricks)g.damage(b,true);expect(g.pickups.some(p=>p.type==='life')).toBe(false);});
 it('saves spent nets and issued life budgets so reloads cannot farm them',()=>{
  const map=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(key:string)=>map.get(key),setItem:(key:string,value:string)=>map.set(key,value)});const random=vi.spyOn(Math,'random').mockReturnValue(.9);
  try{const g=new Game();g.start('classic',0,3);for(const b of g.bricks.slice(0,40))g.damage(b,true);expect(g.lifeIssued).toBe(1);g.safetyNet='spent';const save=readSave();save.runs.classic=checkpointRun(g.level,g.lives,g.phase,{safetyNet:g.safetyNet,lifeDrops:{level:g.level,quota:g.lifeQuota,issued:g.lifeIssued,destroyed:g.bricksDestroyed}});writeSave(save);const run=readSave().runs.classic;const resumed=new Game();resumed.start('classic',run.level,run.lives,run);expect(resumed.safetyNet).toBe('spent');for(const b of resumed.bricks)resumed.damage(b,true);expect(resumed.pickups.filter(p=>p.type==='life')).toHaveLength(0);
   const next=checkpointRun(0,3,'clear',{safetyNet:'armed',lifeDrops:run.lifeDrops});expect(next.safetyNet).toBe('armed');expect(next.lifeDrops).toBeUndefined();expect(checkpointRun(0,0,'over',{safetyNet:'spent'})).toEqual({level:0,lives:3});
  }finally{random.mockRestore();vi.unstubAllGlobals();}
 });
 it('migrates old saves and safely ignores invalid powerup metadata',()=>{
  vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify({version:1,runs:{classic:{level:5,lives:2,safetyNet:'invalid',lifeDrops:{level:5,quota:9,issued:8,destroyed:0}},relaxed:{level:0,lives:3}}}),setItem:()=>{}});try{expect(readSave().runs.classic).toEqual({level:5,lives:2});}finally{vi.unstubAllGlobals();}
 });
});

describe('powerup balance and weapon feedback loops',()=>{
 it('makes laser weight one quarter of a common pickup and excludes it when unavailable',()=>{const counts=new Map<string,number>();for(let i=0;i<13500;i++){const type=chooseUpgrade(i/13500,true);counts.set(type,(counts.get(type)??0)+1);}expect(counts.get('laser')).toBe(500);expect(counts.get('wide')).toBe(2000);for(let i=0;i<1000;i++)expect(chooseUpgrade(i/1000,true,false)).not.toBe('laser');});
 it('spaces ordinary drops by active play time and never refreshes an active or falling laser',()=>{
  const g=new Game();g.start('relaxed',0,3);const random=vi.spyOn(Math,'random').mockReturnValue(0);try{g.dropFrom(g.bricks[0]);expect(g.pickups).toHaveLength(1);g.dropFrom(g.bricks[1]);expect(g.pickups).toHaveLength(1);expect(g.dropCooldown).toBe(PICKUP_DROP_GAP);g.pause();g.update(10);expect(g.dropCooldown).toBe(PICKUP_DROP_GAP);g.resume();g.update(3);g.update(2);g.dropFrom(g.bricks[1]);expect(g.pickups).toHaveLength(2);
   for(const active of [true,false]){g.dropCooldown=0;g.pickups=active?[]:[{x:20,y:100,type:'laser'}];g.effects=active?{laser:15}:{};random.mockReturnValueOnce(0).mockReturnValueOnce(.78);g.dropFrom(g.bricks[2]);expect(g.pickups.filter(p=>p.type==='laser')).toHaveLength(active?0:1);}
  }finally{random.mockRestore();}
 });
 it('prevents laser shots, bombs, and explosive chain splash from generating random drops',()=>{
  const g=new Game();g.start('relaxed',0,3);const random=vi.spyOn(Math,'random').mockReturnValue(0);try{const brick=g.bricks[g.bricks.length-1];g.shots=[{x:brick.x+brick.w/2,y:brick.y+brick.h+1}];g.update(.02);expect(brick.hp).toBe(0);expect(g.pickups).toHaveLength(0);g.explode(g.bricks[15]);expect(g.pickups).toHaveLength(0);
   g.bricks[0].kind='e';g.damage(g.bricks[0]);expect(g.pickups).toHaveLength(1);
  }finally{random.mockRestore();}
 });
 it('still issues the promised life budget when every brick is destroyed by weapons',()=>{const g=new Game();g.start('classic',0,3);g.lifeQuota=2;for(const brick of g.bricks)g.damage(brick,true,false);expect(g.pickups.map(p=>p.type)).toEqual(['life','life']);});
});
