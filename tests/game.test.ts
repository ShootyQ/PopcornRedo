import {describe,it,expect,beforeEach,vi} from 'vitest';
import {Game,PICKUP_DROP_CHANCE} from '../src/game';
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
 it('reduces drop probability by 20 percent relative to the previous rate',()=>{
  expect(PICKUP_DROP_CHANCE).toBeCloseTo(.176);
  const random=vi.spyOn(Math,'random');
  try{for(const [value,count] of [[.175,1],[.176,0],[.20,0]]){random.mockReturnValue(value);const g=new Game();g.start('classic',0,3);g.damage(g.bricks[0]);expect(g.pickups).toHaveLength(count);}}finally{random.mockRestore();}
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
