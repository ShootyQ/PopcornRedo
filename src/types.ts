export type Mode = 'relaxed' | 'classic';
export type Upgrade = 'wide' | 'sticky' | 'multi' | 'slow' | 'laser' | 'strong' | 'life' | 'net' | 'bomb';
export type Phase = 'home' | 'playing' | 'paused' | 'countdown' | 'clear' | 'over' | 'complete';
export interface Brick { x:number; y:number; w:number; h:number; hp:number; kind:string; color:number }
export interface Ball { x:number; y:number; vx:number; vy:number; held:boolean; heldOffset?:number; bomb?:boolean }
export interface Pickup { x:number; y:number; type:Upgrade }
export type SafetyNetState='unused'|'offered'|'armed'|'spent';
export interface LifeDrops {level:number;quota:1|2;issued:number;destroyed:number}
export interface SpecialDrops {level:number;laserQuota:2|3;laserIssued:number;netQuota:1|2;netIssued:number;destroyed:number}
export interface RunProgress {safetyNet?:SafetyNetState;netCharges?:number;lifeDrops?:LifeDrops;specialDrops?:SpecialDrops}
export interface SavedRun extends RunProgress { level:number; lives:number }
export interface Save { version:1; muted:boolean; autoFireLasers?:boolean; seen:boolean; lastMode?:Mode; runs:Record<Mode,SavedRun> }
export interface Level { name:string; rows:string[] }
