import type {Brick,Level} from './types';
export const levels:Level[] = [
{name:'Fresh batch',rows:['.......','sssssss','sssssss','.......','..sss..']},
{name:'Butterfly',rows:['s.....s','ss...ss','sss.sss','ss...ss','s.....s']},
{name:'Extra crunchy',rows:['..ttt..','.sssss.','sssssss','.sssss.','..sss..']},
{name:'On the cob',rows:['.ststs.','.sssss.','.ststs.','.sssss.','..sss..']},
{name:'Pop reaction',rows:['sssssss','sse sess'.replaceAll(' ',''),'sssssss','..ses..']},
{name:'The marquee',rows:['tststst','s.....s','s..e..s','s.....s','sssssss']},
{name:'Little detour',rows:['sssssss','tt...tt','..###..','ss...ss','..ses..']},
{name:'Sweet & salty',rows:['stststs','tstetst','stststs','.......','.s.s.s.']},
{name:'Chain reaction',rows:['ssesess','setttes','ssesess','.......','ss...ss']},
{name:'Balcony seats',rows:['ttttttt','sssssss','.#...#.','s..e..s','.sssss.']},
{name:'Zig & zag',rows:['ss...tt','.ss.tt.','..ses..','.tt.ss.','tt...ss']},
{name:'Double feature',rows:['tte.ett','sss.sss','.#...#.','sss.sss','tte.ett']},
{name:'Golden hour',rows:['..ttt..','.tssst.','tse.est','.tssst.','..ttt..']},
{name:'Almost famous',rows:['tettett','sssssss','..#.#..','tse.est','ss...ss','..ttt..']},
{name:'The big pop',rows:['tttettt','tsssstt','eseeses','.#...#.','tstetst','sssssss']}
];
export function makeBricks(index:number):Brick[] {
 return levels[index].rows.flatMap((row,r)=>[...row].flatMap((kind,c)=>kind==='.'?[]:[{x:23+c*48,y:100+r*29,w:42,h:21,hp:kind==='t'?2:kind==='#'?Infinity:1,kind,color:(r+index)%4}]));
}
