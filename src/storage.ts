import {levels} from './levels';
import type {Save,SavedRun,Phase} from './types';
const KEY='butter-pop-v1',BACKUP='butter-pop-v1-backup';
const fresh=():Save=>({version:1,muted:false,autoFireLasers:false,seen:false,lastMode:'relaxed',runs:{relaxed:{level:0,lives:3},classic:{level:0,lives:3}}});
function read(key:string):any {try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}
function validRun(run:any):run is SavedRun{return !!run&&Number.isInteger(run.level)&&run.level>=0&&run.level<levels.length&&Number.isInteger(run.lives)&&run.lives>=1;}
export function readSave():Save {
 const primary=read(KEY),backup=read(BACKUP),sources=[primary,backup].filter(s=>s?.version===1),save=fresh();
 for(const mode of ['relaxed','classic'] as const){const run=sources.map(s=>s.runs?.[mode]).find(validRun);if(run)save.runs[mode]={level:run.level,lives:run.lives};}
 const settings=sources[0];save.muted=!!settings?.muted;save.autoFireLasers=settings?.autoFireLasers===true;save.seen=!!settings?.seen;
 // Older builds always opened Relaxed, hiding a player's saved Classic run.
 save.lastMode=settings?.lastMode==='classic'||settings?.lastMode==='relaxed'?settings.lastMode:save.runs.classic.level>save.runs.relaxed.level?'classic':'relaxed';
 return save;
}
export function writeSave(save:Save):boolean {
 const json=JSON.stringify(save);let saved=false;
 for(const key of [KEY,BACKUP])try{localStorage.setItem(key,json);saved=localStorage.getItem(key)===json||saved;}catch{/* Keep the in-memory run and report that storage is unavailable. */}
 return saved;
}
// Checkpoint the next unplayed level immediately, even on the clear screen.
export function checkpointRun(level:number,lives:number,phase:Phase):SavedRun {
 if(phase==='over'||phase==='complete'||(phase==='clear'&&level===levels.length-1))return {level:0,lives:3};
 return {level:phase==='clear'?level+1:level,lives};
}
