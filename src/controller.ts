export interface ControllerPad {
 index:number;connected:boolean;mapping:string;axes:readonly number[];
 buttons:readonly {pressed:boolean;value?:number}[];
}
export type ControllerStatus='connected'|'disconnected'|'unmapped'|'unavailable';
export interface ControllerFrame {status:ControllerStatus;move:number;confirm:boolean;actionHeld:boolean;pause:boolean;nav:number;lost:boolean}
const idle=(status:ControllerStatus,lost=false):ControllerFrame=>({status,move:0,confirm:false,actionHeld:false,pause:false,nav:0,lost});
const down=(pad:ControllerPad,index:number)=>!!pad.buttons[index]?.pressed;
export function stick(value:number){if(!Number.isFinite(value)||Math.abs(value)<=.18)return 0;return Math.sign(value)*Math.min(1,(Math.abs(value)-.18)/.82);}
export class ControllerInput {
 private index:number|null=null;private primed=false;private confirm=false;private pause=false;private direction=0;private nextNav=0;
 poll(pads:readonly (ControllerPad|null)[]|null,now:number,enabled=true):ControllerFrame {
  const candidates=pads?.filter((pad):pad is ControllerPad=>!!pad?.connected)??[];
  const pad=candidates.find(p=>p.index===this.index&&p.mapping==='standard')??candidates.find(p=>p.mapping==='standard');
  const lost=this.index!==null&&pad?.index!==this.index;
  if(!pad){this.index=null;this.primed=false;return idle(pads===null?'unavailable':candidates.length?'unmapped':'disconnected',lost);}
  const changed=pad.index!==this.index;this.index=pad.index;
  // Standard mappings differ in Nintendo face-button labels. Accept both A/B
  // (right/bottom) so the physical A button works across browser mappings.
  const confirm=down(pad,0)||down(pad,1),pause=down(pad,9);
  const horizontal=Number(down(pad,15))-Number(down(pad,14));
  const axis=stick(pad.axes[0]??0),vertical=Number(down(pad,13))-Number(down(pad,12));
  const navDirection=vertical||horizontal||((pad.axes[1]??0)>.55?1:(pad.axes[1]??0)<-.55?-1:axis>.55?1:axis<-.55?-1:0);
  if(changed||!this.primed||!enabled){this.primed=enabled;this.confirm=confirm;this.pause=pause;this.direction=navDirection;this.nextNav=now+350;return idle('connected',lost);}
  let nav=0;
  if(navDirection&&navDirection!==this.direction){nav=navDirection;this.nextNav=now+350;}
  else if(navDirection&&now>=this.nextNav){nav=navDirection;this.nextNav=now+160;}
  this.direction=navDirection;
  const result:ControllerFrame={status:'connected',move:horizontal||axis,confirm:confirm&&!this.confirm,actionHeld:confirm,pause:pause&&!this.pause,nav,lost};
  this.confirm=confirm;this.pause=pause;return result;
 }
}
