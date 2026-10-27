import {levels} from './levels';
import type {Save} from './types';
const fresh=():Save=>({version:1,muted:false,seen:false,runs:{relaxed:{level:0,lives:3},classic:{level:0,lives:3}}});
export function readSave():Save { try { const s=JSON.parse(localStorage.getItem('butter-pop-v1')||'null'); if(s?.version!==1) return fresh(); for(const mode of ['relaxed','classic']) {const r=s.runs?.[mode]; if(!r||!Number.isInteger(r.level)||r.level<0||r.level>=levels.length||!Number.isInteger(r.lives)||r.lives<1) return fresh();} return {...s,muted:!!s.muted,seen:!!s.seen}; }catch{return fresh();} }
export function writeSave(save:Save) {try{localStorage.setItem('butter-pop-v1',JSON.stringify(save));}catch{/* The in-memory save remains usable. */}}
