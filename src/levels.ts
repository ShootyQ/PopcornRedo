import type {Brick,Level} from './types';
// Handcrafted silhouettes alternate dense roof runs with tunnels, islands and courtyards.
// Every field keeps the outer side lanes and top chamber open.
export const levels:Level[] = [
{name:'Fresh batch',rows:[
 'sssssssssss','sssssssssss','sssssssssss','sssssssssss','sssssssssss','sssssssssss','sssssssssss','sssssssssss']},
{name:'Butterfly',rows:[
 'ssss...ssss','sssss.sssss','sssssssssss','sssssssssss','sss..s..sss','ss...s...ss','sss..s..sss','ssss.s.ssss','sssss.sssss','ssss...ssss']},
{name:'Stairway to butter',rows:[
 'ss.........','ssss.......','sstsss.....','sssstsss...','sssssstsss.','sssssssstss','..sssssssss','....sstssss','......sstss','........sss']},
{name:'Twin silos',rows:[
 '.sss...sss.','.sts...sts.','.sss...sss.','.sss...sss.','.sts...sts.','.sss...sss.','.sss...sss.','.sss...sss.','sssss.sssss','sssss.sssss']},
{name:'Pop reaction',rows:[
 'sss.....sss','ses.....ses','sssss.sssss','..ses.ses..','..sssssss..','....ses....','..sssssss..','..ses.ses..','sssss.sssss','ses.....ses']},
{name:'The marquee',rows:[
 'tststststst','sssssssssss','ss.......ss','ss.sssss.ss','ss.sssss.ss','ss.sssss.ss','ss.......ss','sssssssssss','tststststst']},
{name:'Bowling alley',rows:[
 'sssssssssss','sssssssssss','sssss.sssss','sstss.sstss','ssss...ssss','sss..#..sss','ssss...ssss','sstss.sstss','sssss.sssss','sss.....sss']},
{name:'Butter waves',rows:[
 'sss....ssss','sssst..ssss','ssssst..sss','.ssssst..ss','..ssssst..s','s..ssssst..','ss..ssssst.','sss..ssssst','ssss..sssss','sssss..ssss']},
{name:'Domino pop',rows:[
 'ssesesssess','sssssssssss','...........','sesssessses','sssssssssss','...........','ssesesssess','sssssssssss','...........','sesssessses']},
{name:'Balcony seats',rows:[
 'stttsssttts','sssssssssss','sssssssssss','...........','ss..sss..ss','ss..sss..ss','ss#.....#ss','ss..sss..ss','sssssssssss','sss.....sss']},
{name:'Zig & zag',rows:[
 'ssss...tttt','sssss...ttt','tsssss...tt','ttsssss...t','tttsssss...','...sssssttt','t...ssssstt','tt...ssssst','ttt...sssss','tttt...ssss']},
{name:'Space invader',rows:[
 '..t.....t..','...t...t...','..sssssss..','.ssesssess.','sssssssssss','ss.sssss.ss','ss.s...s.ss','...ss.ss...','..sss.sss..','.sss...sss.']},
{name:'Golden ring',rows:[
 '..ttttttt..','.tssssssst.','tssssssssst','tss.....sst','tss.....sst','tss.....sst','tssssssssst','.tssssssst.','..ttttttt..']},
{name:'Split decision',rows:[
 'tttt...tttt','ssss...ssss','sses...sess','ssss...ssss','sss..#..sss','sss.....sss','sssss.sssss','sses...sess','ssss...ssss','tttt...tttt']},
{name:'The big pop',rows:[
 '..tttettt..','.tssssssst.','esesesesese','sssssssssss','ss#sssss#ss','sssssssssss','.seseseses.','..sssssss..','...ststs...','....sss....']},
{name:'Popcorn bucket',rows:[
 '.sssssssss.','sssesssesss','sssssssssss','.ttttttttt.','.tssssssst.','.tsstsstst.','..tssssst..','..tsstsst..','...tssst...','...ttttt...']},
{name:'Caramel switchback',rows:[
 'ttsssssssss','sttssssssss','.......ssss','sssssssstss','sssssssttss','ssss.......','ssttsssssss','sssttssssss','.......ssss','ssssssssstt']},
{name:'Courtyard',rows:[
 'ttttttttttt','sssssssssss','ss.......ss','ss..sss..ss','ss..ses..ss','ss..sss..ss','ss.......ss','ssss...ssss','ssss...ssss','tttt...tttt']},
{name:'Pinball picnic',rows:[
 'sss..t..sss','sts..s..sts','sss..s..sss','..#..s..#..','sssssssssss','sssesesesss','...........','sstss.stsst','sssss.sssss','sss.....sss']},
{name:'Firecracker fuse',rows:[
 'sssesesssss','sssssesssss','.....e.....','sssesesssss','sssesssssss','...e.......','sssesesssss','sssssesssss','.....e.....','sssesesssss']},
{name:'Diamond mine',rows:[
 '....ttt....','...tssst...','..tssssst..','.tsssessst.','tssssssssst','tsssesessst','.tssssssst.','..tssssst..','...tssst...','....ttt....']},
{name:'Snack break',rows:[
 'ssss...ssss','stss...ssts','sses...sess','ssss...ssss','...........','..sssssss..','..stststs..','..ssessss..','..sssssss..','..ttttttt..']},
{name:'Butter braids',rows:[
 'stts...stts','sstts.sttss','.ssttsstss.','..sstttss..','...sstss...','..sstttss..','.ssttsstss.','sstts.sttss','stts...stts','tts.....stt']},
{name:'Crackle castle',rows:[
 'ttt..t..ttt','sss..s..sss','sssssssssss','sssssesssss','ss#.....#ss','sss.....sss','sssesesesss','sssssssssss','tttt...tttt','ssss...ssss']},
{name:'Crescent crunch',rows:[
 '...tttttt..','..tssssssst','.tsssssssss','tssssss....','tsssss.....','tssses.....','tssssss....','.tsssssssss','..tssssssst','...tttttt..']},
{name:'Salt islands',rows:[
 'tst.....tst','ses.....ses','tst..s..tst','....ses....','sss.sss.sss','sts..#..sts','sss.sss.sss','....ses....','tst..s..tst','ses.....ses']},
{name:'The royal box',rows:[
 'ttttttttttt','tssssssssst','tsstttttsst','tss.....sst','tss..e..sst','tss.....sst','tsst...tsst','tsss...ssst','tsss...ssst','tttt...tttt']},
{name:'Confetti cannon',rows:[
 'sss.....sss','ses.....ses','ssss...ssss','ststs.ststs','.seseseses.','..sssssss..','...ttett...','..sssssss..','.seseseses.','ssss...ssss']},
{name:'Standing ovation',rows:[
 't.t.t.t.t.t','sssssssssss','ssstssstsss','seseseseses','...........','ss#sssss#ss','sssssssssss','seseseseses','ssstssstsss','ttt.....ttt']},
{name:'The grand finale',rows:[
 'ttetttttett','sssss.sssss','eses...sese','ttss...sstt','sss#...#sss','sssesesesss','tststststst','ss.......ss','setstststes','ssss...ssss']}
];
export const BRICK_GRID={columns:11,x:19,y:120,pitchX:31,pitchY:22,width:27,height:16};
export function makeBricks(index:number):Brick[] {
 const grid=BRICK_GRID;
 return levels[index].rows.flatMap((row,r)=>[...row].flatMap((kind,c)=>kind==='.'?[]:[{x:grid.x+c*grid.pitchX,y:grid.y+r*grid.pitchY,w:grid.width,h:grid.height,hp:kind==='t'?2:kind==='#'?Infinity:1,kind,color:(r+index)%4}]));
}
