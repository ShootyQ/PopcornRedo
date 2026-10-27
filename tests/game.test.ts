import {describe,it,expect,beforeEach,vi} from 'vitest';
import {Game} from '../src/game';
import {makeBricks,levels} from '../src/levels';
import {sweep,rebound} from '../src/physics';
import {readSave,writeSave} from '../src/storage';
describe('physics',()=>{
it('sweeps through high speed brick paths',()=>{expect(sweep(50,100,0,-200,30,20,42,21)?.ny).toBe(1);expect(sweep(0,30,100,0,30,20,42,21)?.nx).toBe(-1);expect(sweep(0,0,0,10,30,20,42,21)).toBeNull();});
it('handles corners and parallel travel',()=>{expect(sweep(0,0,100,100,30,30,20,20)).not.toBeNull();expect(sweep(0,0,0,100,30,30,20,20)).toBeNull();});
it('always rebounds up, with controlled angles',()=>{for(const offset of [-2,-1,0,1,2])expect(rebound(offset,300).vy).toBeLessThanOrEqual(-135);expect(rebound(-1,300).vx).toBeLessThan(0);});
it('reflects walls and paddle',()=>{const g=new Game();g.start('classic',0,3);g.balls=[{x:8,y:400,vx:-290,vy:0,held:false}];g.update(.02);expect(g.balls[0].vx).toBeGreaterThan(0);g.balls=[{x:g.paddle+20,y:550,vx:0,vy:290,held:false}];g.update(.08);expect(g.balls[0].vy).toBeLessThan(0);expect(g.balls[0].vx).toBeGreaterThan(0);});
});
describe('campaign and rules',()=>{
let g:Game;beforeEach(()=>{g=new Game();g.start('classic',0,3);});
it('contains 15 nonempty layouts with no sealed brick rows',()=>{expect(levels).toHaveLength(15);for(let i=0;i<15;i++){const bricks=makeBricks(i);expect(bricks.some(b=>b.kind!=='#')).toBe(true);expect(levels[i].rows.every(r=>r.length===7)).toBe(true);expect(bricks.filter(b=>b.kind==='#').length).toBeLessThan(4);}});
it('tough takes two hits; obstacles never break; explosions chain',()=>{g.bricks=makeBricks(2);const b=g.bricks.find(b=>b.kind==='t')!;g.damage(b);expect(b.hp).toBe(1);g.damage(b);expect(b.hp).toBe(0);const wall={x:0,y:0,w:42,h:21,hp:Infinity,kind:'#',color:0};g.damage(wall);expect(wall.hp).toBe(Infinity);g.bricks=[{...wall,hp:1,kind:'e'},{...wall,x:48,hp:1,kind:'e'},{...wall,x:96,hp:1,kind:'s'}];g.damage(g.bricks[0]);expect(g.bricks.every(b=>b.hp===0)).toBe(true);});
it('power breaks tough bricks immediately',()=>{const b=makeBricks(2).find(b=>b.kind==='t')!;g.apply('strong');g.damage(b);expect(b.hp).toBe(0);});
it('refreshes timers and freezes them during pause and countdown',()=>{g.apply('wide');g.update(1);expect(g.effects.wide).toBe(14);g.apply('wide');expect(g.effects.wide).toBe(15);g.pause();g.update(10);expect(g.effects.wide).toBe(15);g.resume();g.update(3);expect(g.effects.wide).toBe(15);g.update(15);expect(g.effects.wide).toBeUndefined();});
it('counts last-ball loss only; caps multiball',()=>{g.action();g.apply('multi');g.apply('multi');g.apply('multi');expect(g.balls).toHaveLength(5);g.balls[0].y=700;g.update(.001);expect(g.lives).toBe(3);g.balls=[];g.update(.001);expect(g.lives).toBe(2);expect(g.balls[0].held).toBe(true);});
it('Classic retains damage, Relaxed resets bricks and replaces life',()=>{g.bricks[0].hp=0;g.balls=[];g.update(.001);expect(g.bricks[0].hp).toBe(0);g.start('relaxed',0,3);g.bricks[0].hp=0;g.balls=[];g.update(.001);expect(g.bricks[0].hp).toBe(1);g.apply('life');expect(g.effects.wide).toBe(15);expect(g.lives).toBe(3);});
it('ends a run and completes the campaign with boundary callbacks',()=>{const cb=vi.fn();g.onBoundary=cb;g.lives=1;g.balls=[];g.update(.001);expect(g.phase).toBe('over');expect(cb).toHaveBeenCalledOnce();g.start('relaxed',14,3);g.bricks.forEach(b=>{if(b.kind!=='#')b.hp=0;});g.update(.001);expect(g.phase).toBe('clear');g.next();expect(g.phase).toBe('complete');});
});
describe('storage',()=>{
it('handles invalid and blocked storage and restores separate runs',()=>{const map=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>map.get(k),setItem:(k:string,v:string)=>map.set(k,v)});const s=readSave();s.runs.classic={level:8,lives:2};s.muted=true;writeSave(s);expect(readSave()).toEqual(s);map.set('butter-pop-v1','bad');expect(readSave().runs.classic.level).toBe(0);vi.stubGlobal('localStorage',{getItem:()=>{throw Error();},setItem:()=>{throw Error();}});expect(()=>writeSave(readSave())).not.toThrow();vi.unstubAllGlobals();});
});
describe('full layouts',()=>{it('can clear every level with paddle movement and normal game rules',()=>{vi.spyOn(Math,'random').mockReturnValue(.5);try{for(let level=0;level<15;level++){const g=new Game();g.start('relaxed',level,3);for(let step=0;step<120*600&&g.phase==='playing';step++){const ball=g.balls.find(b=>!b.held)||g.balls[0];g.move(ball.x+Math.sin(step/180)*24);if(g.balls.some(b=>b.held))g.action();g.update(1/120);}expect(g.phase,`level ${level+1} should be reachable`).toBe('clear');}}finally{vi.restoreAllMocks();}},15000);});
