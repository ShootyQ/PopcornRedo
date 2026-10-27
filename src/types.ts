export type Mode = 'relaxed' | 'classic';
export type Upgrade = 'wide' | 'sticky' | 'multi' | 'slow' | 'laser' | 'strong' | 'life';
export type Phase = 'home' | 'playing' | 'paused' | 'countdown' | 'clear' | 'over' | 'complete';
export interface Brick { x:number; y:number; w:number; h:number; hp:number; kind:string; color:number }
export interface Ball { x:number; y:number; vx:number; vy:number; held:boolean; heldOffset?:number }
export interface Pickup { x:number; y:number; type:Upgrade }
export interface SavedRun { level:number; lives:number }
export interface Save { version:1; muted:boolean; autoFireLasers?:boolean; seen:boolean; lastMode?:Mode; runs:Record<Mode,SavedRun> }
export interface Level { name:string; rows:string[] }
