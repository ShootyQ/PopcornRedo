import './style.css';
import {Game,labels,upgrades} from './game';
import {levels} from './levels';
import {render} from './render';
import {readSave,writeSave,checkpointRun} from './storage';
import {enterFullscreen,exitFullscreen,inFullscreen,fullscreenSupported} from './fullscreen';
import {ControllerInput} from './controller';
import type {ControllerStatus} from './controller';
import {Sound} from './audio';
import type {Mode} from './types';
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<header class="site-header"><a class="wordmark" href="./" aria-label="Butter Pop home"><span class="mini-pop">✿</span> butter pop<span class="wordmark-dot">✦</span></a><span class="edition">FRESHLY POPPED · VOL. 01</span><button id="mute" class="icon-button" aria-label="Toggle sound"></button></header><main><aside class="intro"><div class="eyebrow"><span></span> A LITTLE POCKET ARCADE</div><h1>A little butter.<br>A lot of <em>bounce.</em></h1><p>Clear your mind. Break some bricks.<br>There’s a fresh batch waiting for you.</p><div class="desktop-note"><span>✦</span> SMALL GAME. BIG POP.</div></aside><section class="cabinet" aria-label="Butter Pop game"><div class="cabinet-top"><span id="controller-status" role="status" aria-live="polite">PAIR A CONTROLLER · PRESS A BUTTON</span><span>✦</span></div><div class="playfield"><canvas width="376" height="650" aria-label="Brick breaker playfield"></canvas><button id="action" class="small-button primary" hidden>Launch ↑</button><div id="overlay"></div></div><div class="control-strip"><button id="pause" class="small-button">Ⅱ Pause</button><span id="level-name">MADE FOR A LITTLE BREAK</span><span id="build-label" aria-label="Game build">Build ${__BUILD_NUMBER__}</span></div><div id="effects" aria-live="polite"></div></section><aside class="recipe"><span class="recipe-star">✳</span><h2>Simple ingredients.<br>Endless good times.</h2><p>A paddle, a ball, and that<br>just-one-more-level feeling.</p><div class="recipe-line"></div><span class="recipe-caption">${levels.length} FRESH BATCHES<br>${upgrades.length} LITTLE PICK-ME-UPS<br>100% GOOD VIBES</span></aside></main><footer><span>A LOVE LETTER TO THE ARCADE DAYS.</span><span>NO COINS NEEDED <span class="footer-flower">✿</span></span></footer>`;
const canvas=document.querySelector('canvas')!,ctx=canvas.getContext('2d')!,overlay=document.querySelector<HTMLDivElement>('#overlay')!,action=document.querySelector<HTMLButtonElement>('#action')!,pause=document.querySelector<HTMLButtonElement>('#pause')!,mute=document.querySelector<HTMLButtonElement>('#mute')!;
const save=readSave(),game=new Game(),sound=new Sound();let selected:Mode=save.lastMode??'relaxed';let savingAvailable=writeSave(save);let lastSaved=savingAvailable?JSON.stringify(save):'';
game.autoFireLasers=!!save.autoFireLasers;
const controller=new ControllerInput();let controllerStatus:ControllerStatus='disconnected';let hadController=false;
function persist(){const json=JSON.stringify(save);if(savingAvailable&&json===lastSaved)return;savingAvailable=writeSave(save);if(savingAvailable)lastSaved=json;}
function remember(){save.lastMode=game.mode;save.runs[game.mode]=checkpointRun(game.level,game.lives,game.phase,{safetyNet:game.safetyNet,...(game.mode==='classic'?{lifeDrops:{level:game.level,quota:game.lifeQuota,issued:game.lifeIssued,destroyed:game.bricksDestroyed}}:{})});persist();}
function begin(){sound.unlock();void enterFullscreen(app);const run=save.runs[selected];game.start(selected,run.level,run.lives,run);save.seen=true;remember();}
function home(){if(game.phase!=='home')remember();game.phase='home';void exitFullscreen();ui();}
function button(id:string,text:string,cls='big-button'){return `<button id="${id}" class="${cls}">${text}</button>`;}
function ui(){
 app.classList.toggle('is-gameplay',game.phase!=='home');
 app.classList.toggle('is-playing',game.phase==='playing'||game.phase==='countdown');
 mute.textContent=save.muted?'♪ OFF':'♪ ON';mute.setAttribute('aria-pressed',String(save.muted));
 pause.hidden=game.phase==='home';const canLaunch=game.balls.some(b=>b.held);action.hidden=game.phase!=='playing'||(!canLaunch&&!game.effects.laser);action.textContent=canLaunch?'Launch ↑':'Fire ✦';
 document.querySelector('#level-name')!.textContent=game.phase==='home'?'MADE FOR A LITTLE BREAK':game.title.toUpperCase();
 overlay.innerHTML='';overlay.hidden=['playing','countdown'].includes(game.phase);
 if(game.phase==='home'){
 overlay.innerHTML=`<div class="home-content"><div class="batch-label">HOT & FRESH SINCE RIGHT NOW</div><div class="pop-art" aria-hidden="true"><i class="kernel k1"></i><i class="kernel k2"></i><i class="kernel k3"></i><div class="pop-bag"><span>POP<br>POP!</span></div><b class="spark s1">✦</b><b class="spark s2">✧</b></div><h2>Butter <em>Pop!</em></h2><p class="tagline">Your daily dose of happy.</p><div class="mode-picker" aria-label="Difficulty"><button data-mode="relaxed" class="${selected==='relaxed'?'selected':''}" aria-pressed="${selected==='relaxed'}">Relaxed <span>${save.runs.relaxed.level>0?'SAVED BATCH '+(save.runs.relaxed.level+1):'JUST KEEP BOUNCING'}</span></button><button data-mode="classic" class="${selected==='classic'?'selected':''}" aria-pressed="${selected==='classic'}">Classic <span>${save.runs.classic.level>0?'SAVED BATCH '+(save.runs.classic.level+1):'3 LIVES. BIG DREAMS.'}</span></button></div>${button('play',save.runs[selected].level>0?'Continue batch '+(save.runs[selected].level+1)+' →':'Let’s get popping →')}<p id="save-status" class="save-status" role="status">${savingAvailable?'Progress saves on this device.':'Saving unavailable — keep this tab open.'}</p><p class="controller-help" hidden>Stick / D-pad: move · A/B: launch & fire · +: pause<br>Pair in Bluetooth settings, then press a button.</p><p class="how">Drag below the paddle to move.<br>Catch little upgrades. Pop every brick.</p><button id="guide" class="text-button">The little upgrade guide ↗</button><button id="options" class="text-button">Options</button></div>`;
 overlay.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.onclick=()=>{selected=b.dataset.mode as Mode;save.lastMode=selected;persist();ui();});document.querySelector('#play')!.addEventListener('click',begin);document.querySelector('#guide')!.addEventListener('click',guide);document.querySelector('#options')!.addEventListener('click',options);
 }else if(game.phase==='paused'){
 overlay.innerHTML=`<div class="dialog"><span class="dialog-icon">☕</span><div class="eyebrow">TAKE A BREATHER</div><h2>On a little<br><em>break.</em></h2><p>Your fresh batch can wait.</p>${button('resume','Back to the bounce →')}${button('guide','Upgrade guide','outline-button')}${button('options','Options','outline-button')}${fullscreenSupported()?button('fullscreen',inFullscreen()?'Exit fullscreen':'Enter fullscreen','outline-button'):''}${button('sound',save.muted?'Turn sound on':'Mute sound','text-button')}${button('home','Back to menu','text-button')}<small>${savingAvailable?'Progress saves on this device.':'Saving unavailable — keep this tab open.'}</small></div>`;
 document.querySelector('#resume')!.addEventListener('click',()=>{sound.unlock();game.resume();});document.querySelector('#home')!.addEventListener('click',home);document.querySelector('#guide')!.addEventListener('click',guide);document.querySelector('#options')!.addEventListener('click',options);
 document.querySelector('#sound')?.addEventListener('click',()=>{sound.unlock();save.muted=!save.muted;persist();ui();});
 document.querySelector('#fullscreen')?.addEventListener('click',async()=>{if(inFullscreen())await exitFullscreen();else await enterFullscreen(app);ui();});
 }else if(['clear','over','complete'].includes(game.phase)){
 const clear=game.phase==='clear',complete=game.phase==='complete';overlay.innerHTML=`<div class="dialog"><span class="dialog-icon">${clear||complete?'✳':'♡'}</span><div class="eyebrow">${clear?'NICELY POPPED':complete?'THAT’S A WRAP':'EVERY BATCH IS A NEW BEGINNING'}</div><h2>${clear?`Batch ${game.level+1}<br><em>complete!</em>`:complete?'You’re the<br><em>big pop!</em>':'One more<br><em>helping?</em>'}</h2><p>${clear?(game.level===levels.length-1?'Every batch, beautifully popped.':`Up next: batch ${game.level+2}.`):complete?`All ${levels.length} batches, beautifully popped.`:'Three lives, plenty of good bounces.'}</p>${button('next',clear?(game.level===levels.length-1?'Take a bow →':`Start batch ${game.level+2} →`):'Pop again →')}${button('home','Back to menu','text-button')}</div>`;document.querySelector('#next')!.addEventListener('click',()=>{if(clear)game.next();else {void enterFullscreen(app);game.start(game.mode,0,3);remember();}});document.querySelector('#home')!.addEventListener('click',home);
 }
 updateControllerStatus();fitLayout();
}
function options(){
 overlay.hidden=false;
 overlay.innerHTML=`<div class="dialog options"><div class="eyebrow">YOUR RECIPE</div><h2>Little <em>options.</em></h2><button id="auto-fire" class="outline-button" aria-pressed="${!!save.autoFireLasers}">Auto-fire lasers: ${save.autoFireLasers?'On':'Off'}</button><p>Automatically shoots while the laser upgrade is active and a ball is in flight. Pauses with the game and never launches a held ball.</p><small>${savingAvailable?'Saved on this device.':'Saving unavailable — applies to this tab only.'}</small>${button('back','Back →')}</div>`;
 document.querySelector('#auto-fire')!.addEventListener('click',()=>{save.autoFireLasers=!save.autoFireLasers;game.autoFireLasers=!!save.autoFireLasers;persist();options();document.querySelector<HTMLButtonElement>('#auto-fire')!.focus({preventScroll:true});});
 document.querySelector('#back')!.addEventListener('click',ui);fitLayout();
}
function guide(){overlay.hidden=false;overlay.innerHTML=`<div class="dialog guide"><div class="eyebrow">CATCH A LITTLE GOOD THING</div><h2>Pick-me-<em>ups.</em></h2><dl>${upgrades.map(u=>`<div><dt>${labels[u]}</dt><dd>${({wide:'A little more paddle.',sticky:'Catch the ball. Launch when ready.',multi:'Two more balls. Up to five!',slow:'A moment to catch your breath.',laser:'Tap Fire to clear a path.',strong:'Crunch tough bricks in one hit.',life:'Classic: one per batch; sometimes two.',net:'One offer per campaign. Catch it for one save.',bomb:'Next paddle hit loads a small brick-clearing blast.'})[u]}</dd></div>`).join('')}</dl><p>Timed treats last 15 seconds.<br>Catch another to refresh. Lose a ball?<br>Net carries across batches until used.</p>${button('back','Got it →')}</div>`;document.querySelector('#back')!.addEventListener('click',ui);fitLayout();}
 game.onChange=()=>{if(game.phase!=='home')remember();ui();};game.onBoundary=remember;game.onSound=high=>sound.play(save.muted,high);
 let suppressActionClick=false;
 action.addEventListener('pointerdown',()=>{suppressActionClick=false;});
 mute.onclick=()=>{sound.unlock();save.muted=!save.muted;persist();ui();};pause.onclick=()=>game.pause();action.onclick=event=>{if(suppressActionClick&&event.detail!==0){suppressActionClick=false;return;}sound.unlock();game.action();};
// Treat the space below and beside the paddle as part of the controller.
// Selection/callout prevention also covers the surrounding labels and margins.
app.addEventListener('selectstart',event=>event.preventDefault());
app.addEventListener('contextmenu',event=>event.preventDefault());
app.addEventListener('dragstart',event=>event.preventDefault());
app.addEventListener('pointerdown',()=>{app.classList.remove('using-controller');window.getSelection()?.removeAllRanges();});
// Cancel Safari's native selection/magnifier gesture on controller surfaces,
// including Fire. Launch and menu controls retain normal button activation.
app.addEventListener('touchstart',event=>{
 const touch=event.touches[0];if(!touch||game.phase!=='playing')return;
 const target=event.target as Element;
 const fire=!!target.closest('#action')&&!!game.effects.laser&&!game.balls.some(ball=>ball.held);
 const rect=canvas.getBoundingClientRect();
 if((fire||!target.closest('button,a,#overlay'))&&(touch.clientY-rect.top)/rect.height*650>=390&&event.cancelable)event.preventDefault();
},{passive:false});
app.addEventListener('touchmove',event=>{if(drag&&event.cancelable)event.preventDefault();},{passive:false});
document.addEventListener('selectionchange',()=>{const selection=window.getSelection();if(game.phase==='playing'&&selection?.rangeCount&&selection.anchorNode&&app.contains(selection.anchorNode))selection.removeAllRanges();});
let drag:{id:number;x:number;y:number;paddle:number;fireButton:boolean;moved:boolean}|null=null;
app.addEventListener('pointerdown',e=>{
 if(game.phase!=='playing'||!e.isPrimary||e.button!==0||drag)return;
 const target=e.target as Element;
 const fireButton=!!target.closest('#action')&&!!game.effects.laser&&!game.balls.some(ball=>ball.held);
 if(target.closest('button,a,#overlay')&&!fireButton)return;
 const rect=canvas.getBoundingClientRect();if((e.clientY-rect.top)/rect.height*650<390)return;
 e.preventDefault();sound.unlock();drag={id:e.pointerId,x:e.clientX,y:e.clientY,paddle:game.paddle,fireButton,moved:false};
 // Keep the gesture captured even after the finger moves outside the button.
 (fireButton?action:app).setPointerCapture(e.pointerId);
});
app.addEventListener('pointermove',e=>{
 if(!drag||drag.id!==e.pointerId||game.phase!=='playing')return;
 if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>6)drag.moved=true;
 if(!drag.fireButton||drag.moved)game.move(drag.paddle+(e.clientX-drag.x)*376/canvas.getBoundingClientRect().width);
});
for(const event of ['pointerup','pointercancel','lostpointercapture'] as const)app.addEventListener(event,e=>{
 if(drag?.id!==e.pointerId)return;
 if(drag.fireButton){
  suppressActionClick=true;
  // Handle the tap directly; iOS may omit the click after a previous drag.
  if(event==='pointerup'&&!drag.moved&&game.phase==='playing'&&game.effects.laser&&!game.balls.some(ball=>ball.held)){sound.unlock();game.action();}
 }
 drag=null;
});
// A rotation changes the mapping between screen pixels and game coordinates.
function resetDrag(){if(drag){if(drag.fireButton)suppressActionClick=true;const owner=drag.fireButton?action:app;if(owner.hasPointerCapture(drag.id))owner.releasePointerCapture(drag.id);}drag=null;}
window.addEventListener('resize',resetDrag);window.visualViewport?.addEventListener('resize',resetDrag);
const keys=new Set<string>();window.addEventListener('keydown',e=>{if(e.code==='Escape'){game.pause();return;}if(e.target instanceof HTMLButtonElement)return;if(['ArrowLeft','ArrowRight','Space'].includes(e.code)){e.preventDefault();keys.add(e.code);if(e.code==='Space'&&!e.repeat){sound.unlock();game.action();}}});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();resetDrag();game.pause();if(game.phase!=='home')remember();});document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();resetDrag();game.pause();if(game.phase!=='home')remember();}});
window.addEventListener('pagehide',()=>{if(game.phase!=='home')remember();});
// Size the entire cabinet and each menu to the space actually available.
// No document or inner-menu scrolling is needed, including on short landscape screens.
const main=document.querySelector('main')!,cabinet=document.querySelector<HTMLElement>('.cabinet')!,playfield=document.querySelector<HTMLElement>('.playfield')!;
function fitLayout(){
 const room=main.getBoundingClientRect();
 const width=Math.max(100,Math.min(400,room.width-24,(room.height-152)*376/650+26));
 cabinet.style.width=`${width}px`;cabinet.classList.toggle('compact-cabinet',width<240);
 const menu=overlay.firstElementChild as HTMLElement|null;
 if(menu){const box=playfield.getBoundingClientRect();const scale=Math.min((box.width-2)/376,(box.height-2)/menu.scrollHeight);menu.style.setProperty('--menu-scale',String(Math.max(.01,scale)));}
}
new ResizeObserver(fitLayout).observe(main);
new ResizeObserver(fitLayout).observe(playfield);
let wasFullscreen=inFullscreen();
function fullscreenChanged(){const active=inFullscreen();resetDrag();if(wasFullscreen&&!active)game.pause();wasFullscreen=active;ui();}
document.addEventListener('fullscreenchange',fullscreenChanged);document.addEventListener('webkitfullscreenchange',fullscreenChanged);
function updateControllerStatus(){
 const text=controllerStatus==='connected'?'CONTROLLER CONNECTED · A/B + STICK':controllerStatus==='unmapped'?'CONTROLLER NEEDS STANDARD MAPPING':controllerStatus==='unavailable'?'CONTROLLER API UNAVAILABLE':hadController?'CONTROLLER DISCONNECTED · TOUCH WORKS':'PAIR A CONTROLLER · PRESS A BUTTON';
 document.querySelector('#controller-status')!.textContent=text;
 const help=document.querySelector<HTMLElement>('.controller-help');if(help)help.hidden=controllerStatus!=='connected';
}
function menuButtons(){return Array.from(overlay.querySelectorAll<HTMLButtonElement>('button')).filter(button=>!button.disabled&&button.getBoundingClientRect().width>0&&button.getBoundingClientRect().height>0);}
function controllerMenu(direction:number,confirm:boolean){
 if(overlay.hidden)return;
 const buttons=menuButtons();if(!buttons.length)return;
 const defaultButton=overlay.querySelector<HTMLButtonElement>('#play,#resume,#next,#back')??buttons[0];
 let focused=buttons.includes(document.activeElement as HTMLButtonElement)?document.activeElement as HTMLButtonElement:defaultButton;
 if(direction){focused=buttons[(buttons.indexOf(focused)+direction+buttons.length)%buttons.length];focused.focus({preventScroll:true});}
 if(confirm){sound.unlock();focused.click();}
}
function pollController(now:number){
 let pads:readonly (Gamepad|null)[]|null=null;try{pads=navigator.getGamepads?.()??null;}catch{/* Some embedded browsers block this API. */}
 const input=controller.poll(pads,now,!document.hidden&&document.hasFocus());
 if(input.status!==controllerStatus){controllerStatus=input.status;if(input.status==='connected')hadController=true;updateControllerStatus();fitLayout();}
 if(input.lost){keys.clear();resetDrag();game.pause();}
 if(input.confirm||input.pause||input.nav){app.classList.add('using-controller');}
 if(input.pause){if(game.phase==='paused'){sound.unlock();game.resume();}else game.pause();return 0;}
 if(game.phase==='playing'){
  if(input.confirm||(input.actionHeld&&game.effects.laser&&game.cooldown<=0&&!game.balls.some(ball=>ball.held))){sound.unlock();game.action();}
 }else controllerMenu(input.nav,input.confirm);
 return input.move;
}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let last=performance.now(),acc=0,lastEffects='';
function frame(now:number){const controllerMove=pollController(now);acc+=Math.min((now-last)/1000,.1);last=now;while(acc>=1/120){if(game.phase==='playing'){const movement=Math.max(-1,Math.min(1,Number(keys.has('ArrowRight'))-Number(keys.has('ArrowLeft'))+controllerMove));if(!drag&&movement)game.move(game.paddle+movement*420/120);}game.update(1/120);acc-=1/120;}const ratio=Math.min(devicePixelRatio||1,2),w=Math.round(376*ratio),h=Math.round(650*ratio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.setTransform(ratio,0,0,ratio,0,0);render(ctx,game,reduced.matches);const effects=[...upgrades.filter(u=>game.effects[u]).map(u=>`${labels[u]} ${Math.ceil(game.effects[u]!)}s`),...(game.safetyNet==='armed'?['NET READY']:[]),...(game.bombReady?['BUTTER BOMB READY']:game.balls.some(ball=>ball.bomb)?['BOMB IN PLAY']:[])].join(' · ');if(effects!==lastEffects){document.querySelector('#effects')!.textContent=effects;lastEffects=effects;}requestAnimationFrame(frame);}
ui();requestAnimationFrame(frame);
