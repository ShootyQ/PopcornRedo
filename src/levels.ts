import type {Brick,Level} from './types';
// Dense fields leave side lanes and a roomy chamber above the bricks:
// break through, then let the ball work its way across the roof.
export const levels:Level[] = [
{name:'Fresh batch',rows:[
 'sssssssssss','sssssssssss','sssssssssss','sssssssssss',
 'sssssssssss','sssssssssss','sssssssssss','sssssssssss']},
{name:'Butterfly',rows:[
 'ssss...ssss','sssss.sssss','sssssssssss','sssssssssss',
 'sssssssssss','sssssssssss','sssss.sssss','ssss...ssss','sss.....sss']},
{name:'Extra crunchy',rows:[
 'ssstttttsss','sssssssssss','sssssssssss','stsssssssts',
 'sssssssssss','sssststssss','sssssssssss','sssssssssss','ss.sssss.ss']},
{name:'On the cob',rows:[
 '.sssssssss.','.stsstssts.','.sssssssss.','.sstsstsst.',
 '.sssssssss.','.stsstssts.','.sssssssss.','.sssssssss.','..sssssss..']},
{name:'Pop reaction',rows:[
 'sssssssssss','ssesesssess','sssssssssss','sssssssssss',
 'sesssessses','sssssssssss','sssssssssss','sssesssesss','sssssssssss']},
{name:'The marquee',rows:[
 'tststststst','sssssssssss','ss.......ss','ss.sssss.ss',
 'ss.ssess.ss','ss.sssss.ss','ss.......ss','sssssssssss','tststststst']},
{name:'Little detour',rows:[
 'sssssssssss','sssssssssss','ssttsssttss','sssssssssss',
 'ss..###..ss','ssss...ssss','sssssssssss','sssesssesss','sssssssssss']},
{name:'Sweet & salty',rows:[
 'sstsstsstss','stsstsstsst','sssssssssss','sssesesesss',
 'sstsstsstss','sssssssssss','stsstsstsst','sssssssssss','sss.sss.sss']},
{name:'Chain reaction',rows:[
 'ssesesseses','sssssssssss','setstststes','sssssssssss',
 'esesesesese','sssssssssss','setstststes','sssssssssss','ssesesseses']},
{name:'Balcony seats',rows:[
 'stttsssttts','sssssssssss','sssssssssss','sss.sss.sss',
 'ss#sssss#ss','sss.sss.sss','sssssssssss','sssesesesss','sssssssssss']},
{name:'Zig & zag',rows:[
 'sssss.ttttt','ssssss.tttt','tssssss.ttt','ttssssss.tt',
 'tttssess.tt','tt.ttssssss','ttt.ttsssss','tttt.ttssss','ttttt.sssss']},
{name:'Double feature',rows:[
 'tttse.esttt','sssss.sssss','sssss.sssss','ssses.sesss',
 'ss#ss.ss#ss','ssses.sesss','sssss.sssss','sssss.sssss','tttse.esttt']},
{name:'Golden hour',rows:[
 '..ttttttt..','.tssssssst.','tssssssssst','tssesesssst',
 'tsessssesst','tsssssessst','tssssssssst','.tssssssst.','..ttttttt..']},
{name:'Almost famous',rows:[
 'ttesttstett','sssssssssss','sstsstsstss','sssssssssss',
 'sss#sss#sss','sssssssssss','tsesssssest','sssssssssss','stststststs','sssssssssss']},
{name:'The big pop',rows:[
 'tttetttettt','tsssstsssst','esesesesese','sssssssssss',
 'ss#sssss#ss','stststststs','sssesesesss','sssssssssss','tststststst','sssssssssss']}
];
export const BRICK_GRID={columns:11,x:19,y:120,pitchX:31,pitchY:22,width:27,height:16};
export function makeBricks(index:number):Brick[] {
 const grid=BRICK_GRID;
 return levels[index].rows.flatMap((row,r)=>[...row].flatMap((kind,c)=>kind==='.'?[]:[{x:grid.x+c*grid.pitchX,y:grid.y+r*grid.pitchY,w:grid.width,h:grid.height,hp:kind==='t'?2:kind==='#'?Infinity:1,kind,color:(r+index)%4}]));
}
