export class Sound {
 ctx:AudioContext|null=null;
 unlock(){try {this.ctx??=new AudioContext();void this.ctx.resume().catch(()=>{});}catch{}}
 play(muted:boolean,high=false){if(muted||!this.ctx)return;try{const o=this.ctx.createOscillator(),g=this.ctx.createGain(),t=this.ctx.currentTime;o.type='sine';o.frequency.setValueAtTime(high?780:420,t);o.frequency.exponentialRampToValueAtTime(high?1100:180,t+.09);g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g);g.connect(this.ctx.destination);o.start();o.stop(t+.13);}catch{}}
}
