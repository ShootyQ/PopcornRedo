import {test,expect} from '@playwright/test';
for(const size of [{width:390,height:844},{width:768,height:1024},{width:844,height:390},{width:1440,height:1000}])test(`play and resume at ${size.width}`,async({page})=>{
 await page.setViewportSize(size);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByRole('heading',{name:'Butter Pop!'})).toBeVisible();await expect(page.locator('#action')).toBeHidden();await page.getByRole('button',{name:'Let’s get popping'}).click();const bounds=(await page.locator('#action').boundingBox())!,field=(await page.locator('.playfield').boundingBox())!;expect(bounds.y).toBeGreaterThan(field.y);expect(bounds.y+bounds.height).toBeLessThanOrEqual(field.y+field.height);await expect(page.locator('#action')).toHaveText('Launch ↑');await page.locator('#action').click();await expect(page.locator('#action')).toBeHidden();const canvas=page.locator('canvas'),box=(await canvas.boundingBox())!;await page.mouse.move(box.x+box.width/2,box.y+box.height*.8);await page.mouse.down();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.8);await page.mouse.up();await page.locator('#pause').click();await expect(page.getByText('Your fresh batch can wait.')).toBeVisible();await expect(page.locator('#action')).toBeHidden();await page.getByRole('button',{name:'Back to the bounce'}).click();await expect(page.locator('#overlay')).toBeHidden();await page.waitForTimeout(3200);await expect(page.locator('canvas')).toBeVisible();await page.screenshot({path:`test-results/play-${size.width}.png`});expect(errors).toEqual([]);
});
test('restores Classic level and sound, shows guide, and supports touch',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const page=await context.newPage();await page.goto('/');await page.evaluate(()=>localStorage.setItem('butter-pop-v1',JSON.stringify({version:1,muted:true,seen:true,runs:{relaxed:{level:2,lives:3},classic:{level:8,lives:2}}})));await page.reload();await expect(page.locator('#mute')).toHaveText('♪ OFF');await page.getByRole('button',{name:'Classic',exact:false}).click();await page.getByRole('button',{name:'Continue batch 9'}).tap();await expect(page.locator('#level-name')).toHaveText('CHAIN REACTION');await page.locator('#action').tap();const box=(await page.locator('canvas').boundingBox())!;const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height*.8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width*.8,y:box.y+box.height*.8}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect.poll(()=>page.locator('canvas').evaluate(c=>{const ctx=c.getContext('2d')!;const scale=c.width/376;const row=ctx.getImageData(0,Math.round(575*scale),c.width,1).data;let sum=0,n=0;for(let x=0;x<c.width;x++){const i=x*4;if(row[i]>190&&row[i+1]<150&&row[i+2]<120){sum+=x/scale;n++;}}return n?sum/n:0;})).toBeGreaterThan(230);await page.locator('#pause').click();await page.getByRole('button',{name:'Upgrade guide',exact:true}).click();await expect(page.getByText('Crunch tough bricks in one hit.')).toBeVisible();await page.getByRole('button',{name:'Got it'}).click();await page.reload();await page.getByRole('button',{name:'Classic',exact:false}).click();await expect(page.getByRole('button',{name:'Continue batch 9'})).toBeVisible();await context.close();
});
test('restores batch 30 and shows Launch only while ready to launch',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.evaluate(()=>localStorage.setItem('butter-pop-v1',JSON.stringify({version:1,muted:false,seen:true,runs:{relaxed:{level:29,lives:3},classic:{level:14,lives:2}}})));
 await page.reload();await expect(page.locator('#action')).toBeHidden();await page.getByRole('button',{name:'Continue batch 30'}).click();await expect(page.locator('#level-name')).toHaveText('THE GRAND FINALE');await expect(page.getByRole('button',{name:'Launch ↑',exact:true})).toBeVisible();await page.locator('#pause').click();await expect(page.locator('#action')).toBeHidden();await page.getByRole('button',{name:'Back to the bounce'}).click();await expect(page.locator('#action')).toBeHidden();await expect(page.locator('#action')).toBeVisible({timeout:5000});await page.locator('#action').click();await expect(page.locator('#action')).toBeHidden();
});
test('keeps the entire playfield centered through tablet play, edge drags, and rotation',async({browser})=>{
 const context=await browser.newContext({viewport:{width:768,height:1024},hasTouch:true,isMobile:true});const page=await context.newPage();await page.goto('/');await page.getByRole('button',{name:'Let’s get popping'}).tap();
 async function checkFrame(){const layout=await page.locator('canvas').evaluate(c=>{const r=c.getBoundingClientRect();return {left:r.left,right:r.right,center:(r.left+r.right)/2,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scrollX:window.scrollX};});expect(layout.left).toBeGreaterThanOrEqual(0);expect(layout.right).toBeLessThanOrEqual(layout.width);expect(Math.abs(layout.center-layout.width/2)).toBeLessThan(2);expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width);expect(layout.scrollX).toBe(0);}
 await checkFrame();const cdp=await context.newCDPSession(page);
 for(const viewport of [{width:768,height:1024},{width:1024,height:768},{width:390,height:844},{width:844,height:390},{width:320,height:568}]){
  await page.setViewportSize(viewport);await checkFrame();const box=(await page.locator('canvas').boundingBox())!;
  for(const direction of [-1,1]){
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height*.8}]});
   for(let step=1;step<=5;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:Math.max(1,Math.min(viewport.width-1,box.x+box.width/2+direction*box.width*step/6)),y:box.y+box.height*.8}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await checkFrame();
  }
 }
 await context.close();
});
test('remembers level 3 completion before Next is tapped or the page reloads',async({page})=>{
 await page.goto('/');await page.evaluate(()=>localStorage.setItem('butter-pop-v1',JSON.stringify({version:1,muted:true,seen:true,runs:{relaxed:{level:2,lives:3},classic:{level:2,lives:2}}})));await page.reload();
 // Fixture: enter the actual completion flow with no breakable bricks left.
 // This changes only this browser session, with no production test hook.
 await page.evaluate(async()=>{const path=performance.getEntriesByType('resource').map(entry=>entry.name).find(url=>new URL(url).pathname==='/src/game.ts')!;const {Game}=await import(path);const load=Game.prototype.load;Game.prototype.load=function(){load.call(this);for(const brick of this.bricks)if(brick.kind!=='#')brick.hp=0;};});
 await page.getByRole('button',{name:'Classic',exact:false}).click();await page.getByRole('button',{name:'Continue batch 3'}).click();await expect(page.getByRole('heading',{name:/Batch 3.*complete!/})).toBeVisible();await expect(page.getByRole('button',{name:'Start batch 4'})).toBeVisible();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('butter-pop-v1')!).runs.classic)).toEqual({level:3,lives:2});
 await page.getByRole('button',{name:'Back to menu'}).click();await expect(page.getByRole('button',{name:'Continue batch 4'})).toBeVisible();await page.reload();await page.getByRole('button',{name:'Classic',exact:false}).click();await page.getByRole('button',{name:'Continue batch 4'}).click();await expect(page.locator('#level-name')).toHaveText('ON THE COB');await expect(page.locator('#action')).toBeVisible();
});
test('outside-the-box long presses do not select text or strand touch controls',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();await page.goto('/');await page.getByRole('button',{name:'Let’s get popping'}).tap();
 const caption=page.locator('#level-name');await expect(caption).toHaveCSS('user-select','none');await expect(page.locator('#app')).toHaveCSS('touch-action','pinch-zoom');
 const box=(await caption.boundingBox())!,cdp=await context.newCDPSession(page);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});await page.waitForTimeout(800);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 expect(await page.evaluate(()=>getSelection()?.toString())).toBe('');
 expect(await caption.evaluate(el=>!el.dispatchEvent(new Event('contextmenu',{bubbles:true,cancelable:true})))).toBe(true);
 // Also recover from a selection left over before the new version loaded.
 await caption.evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);getSelection()?.addRange(range);});
 const canvas=(await page.locator('canvas').boundingBox())!;
 // Begin outside the left edge of the canvas, below the paddle.
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:5,y:canvas.y+canvas.height*.88}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:100,y:canvas.y+canvas.height*.88}]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect.poll(()=>page.locator('canvas').evaluate(c=>{const ctx=c.getContext('2d')!,scale=c.width/376,row=ctx.getImageData(0,Math.round(575*scale),c.width,1).data;let sum=0,n=0;for(let x=0;x<c.width;x++){const i=x*4;if(row[i]>190&&row[i+1]<150&&row[i+2]<120){sum+=x/scale;n++;}}return n?sum/n:0;})).toBeGreaterThan(240);
 expect(await page.evaluate(()=>getSelection()?.toString())).toBe('');
 const frame=await page.locator('canvas').boundingBox();expect(frame!.x).toBeGreaterThanOrEqual(0);expect(frame!.x+frame!.width).toBeLessThanOrEqual(390);expect(await page.evaluate(()=>scrollX)).toBe(0);
 await page.locator('#pause').click();await page.getByRole('button',{name:'Upgrade guide',exact:true}).click();await expect(page.getByRole('button',{name:'Got it'})).toBeVisible();await page.getByRole('button',{name:'Got it'}).click();await expect(page.getByRole('button',{name:'Back to the bounce'})).toBeVisible();await context.close();
});
test('build number stays visible on menu, during play, and while paused on phones',async({page})=>{
 for(const viewport of [{width:390,height:844},{width:844,height:390},{width:320,height:568}]){
  await page.setViewportSize(viewport);await page.goto('/');const label=page.getByLabel('Game build');await expect(label).toHaveText('Build DEV');await expect(label).toBeVisible();
  await page.getByRole('button',{name:'Let’s get popping'}).click();await expect(label).toBeVisible();const bounds=(await label.boundingBox())!;expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(viewport.width);
  await page.locator('#pause').click();await expect(label).toHaveText('Build DEV');await expect(label).toBeVisible();
 }
});
test('Fire accepts paddle drags, clean taps, and touch cancellation',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage();await page.goto('/');
 await page.evaluate(async()=>{const path=performance.getEntriesByType('resource').map(entry=>entry.name).find(url=>new URL(url).pathname==='/src/game.ts')!;const {Game}=await import(path);const start=Game.prototype.start;Game.prototype.start=function(...args:unknown[]){start.apply(this,args);this.apply('laser');this.action();this.shots=[];this.cooldown=0;(window as any).testGame=this;(window as any).testActions=0;};const action=Game.prototype.action;Game.prototype.action=function(){if((window as any).testGame===this)(window as any).testActions++;action.call(this);};});
 await page.getByRole('button',{name:'Let’s get popping'}).tap();await expect(page.locator('#action')).toHaveText('Fire ✦');const box=(await page.locator('#action').boundingBox())!,x=box.x+box.width/2,y=box.y+box.height/2,cdp=await context.newCDPSession(page);
 async function touch(type:string,px=x){await cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'||type==='touchCancel'?[]:[{x:px,y}]});}
 await touch('touchStart');await touch('touchMove',x+95);await touch('touchEnd');
 await expect.poll(()=>page.evaluate(()=>(window as any).testGame.paddle)).toBeGreaterThan(260);expect(await page.evaluate(()=>(window as any).testActions)).toBe(0);
 // A fresh touch can immediately move left from the very same button.
 await touch('touchStart');await touch('touchMove',x-90);await touch('touchEnd');await expect.poll(()=>page.evaluate(()=>(window as any).testGame.paddle)).toBeLessThan(220);expect(await page.evaluate(()=>(window as any).testActions)).toBe(0);
 await touch('touchStart');await touch('touchEnd');await expect.poll(()=>page.evaluate(()=>(window as any).testActions)).toBe(1);expect(await page.evaluate(()=>(window as any).testGame.shots.length)).toBe(2);
 await page.locator('#action').click();expect(await page.evaluate(()=>(window as any).testActions)).toBe(2);
 await touch('touchStart');await touch('touchMove',x+25);await touch('touchCancel');await touch('touchStart');await touch('touchMove',x+90);await touch('touchEnd');await expect.poll(()=>page.evaluate(()=>(window as any).testGame.paddle)).toBeGreaterThan(260);
 await page.locator('#action').focus();await page.keyboard.press('Space');expect(await page.evaluate(()=>(window as any).testActions)).toBe(3);await context.close();
});
test('starts fullscreen, exits from pause, and pauses when fullscreen is dismissed',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Let’s get popping'}).click();await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('app');
 await page.locator('#pause').click();await page.getByRole('button',{name:'Exit fullscreen',exact:true}).click();await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(false);await expect(page.getByRole('button',{name:'Back to the bounce'})).toBeVisible();
 await page.getByRole('button',{name:'Enter fullscreen',exact:true}).click();await expect.poll(()=>page.evaluate(()=>!!document.fullscreenElement)).toBe(true);await page.getByRole('button',{name:'Back to the bounce'}).click();await expect(page.locator('#overlay')).toBeHidden();await page.evaluate(()=>document.exitFullscreen());await expect(page.getByRole('button',{name:'Back to the bounce'})).toBeVisible();await page.getByRole('button',{name:'Back to menu'}).click();await expect(page.getByRole('heading',{name:'Butter Pop!'})).toBeVisible();expect(await page.evaluate(()=>!!document.fullscreenElement)).toBe(false);
});
test('fits all screens and menus without scrolling when fullscreen is unavailable',async({browser})=>{
 const context=await browser.newContext();await context.addInitScript(()=>{Object.defineProperty(Element.prototype,'requestFullscreen',{value:undefined,configurable:true});Object.defineProperty(Element.prototype,'webkitRequestFullscreen',{value:undefined,configurable:true});Object.defineProperty(document,'fullscreenEnabled',{value:false,configurable:true});});const page=await context.newPage();
 async function noScroll(){const layout=await page.evaluate(()=>{const body=document.body,root=document.documentElement;const elements=[...document.querySelectorAll<HTMLElement>('#app,main,#overlay')];const canvas=document.querySelector('canvas')!.getBoundingClientRect();return {width:innerWidth,height:innerHeight,pageWidth:Math.max(body.scrollWidth,root.scrollWidth),pageHeight:Math.max(body.scrollHeight,root.scrollHeight),scrollable:elements.some(el=>el.scrollHeight>el.clientHeight+1||el.scrollWidth>el.clientWidth+1),left:canvas.left,right:canvas.right,top:canvas.top,bottom:canvas.bottom};});expect(layout.pageWidth).toBeLessThanOrEqual(layout.width);expect(layout.pageHeight).toBeLessThanOrEqual(layout.height);expect(layout.scrollable).toBe(false);expect(layout.left).toBeGreaterThanOrEqual(0);expect(layout.right).toBeLessThanOrEqual(layout.width);expect(layout.top).toBeGreaterThanOrEqual(0);expect(layout.bottom).toBeLessThanOrEqual(layout.height);}
 for(const viewport of [{width:320,height:568},{width:390,height:664},{width:844,height:390},{width:568,height:320},{width:768,height:1024},{width:1024,height:768},{width:1440,height:900}]){
  await page.setViewportSize(viewport);await page.goto('/');await expect(page.getByRole('heading',{name:'Butter Pop!'})).toBeVisible();await noScroll();await page.getByRole('button',{name:'Let’s get popping'}).click();await expect(page.locator('#action')).toBeVisible();await noScroll();await page.mouse.wheel(100,300);await page.evaluate(()=>window.scrollTo(100,300));expect(await page.evaluate(()=>[scrollX,scrollY])).toEqual([0,0]);
  await page.locator('#pause').click();await noScroll();await page.getByRole('button',{name:'Upgrade guide',exact:true}).click();await expect(page.getByRole('button',{name:'Got it'})).toBeInViewport();await noScroll();await page.getByRole('button',{name:'Got it'}).click();await expect(page.getByRole('button',{name:'Back to menu'})).toBeInViewport();
 }
 await context.close();
});
test('a denied fullscreen request leaves the game usable',async({page})=>{
 await page.addInitScript(()=>{Element.prototype.requestFullscreen=()=>Promise.reject(new Error('Fullscreen denied'));});await page.goto('/');await page.getByRole('button',{name:'Let’s get popping'}).click();await expect(page.locator('#action')).toBeVisible();await page.locator('#action').click();await expect(page.locator('#action')).toBeHidden();await page.locator('#pause').click();await expect(page.getByRole('button',{name:'Back to the bounce'})).toBeVisible();
});
