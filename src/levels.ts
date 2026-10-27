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
 'ss#sssss#ss','stststststs','sssesesesss','sssssssssss','tststststst','sssssssssss']},
{name:'Encore',rows:[
 'sssssssssss','stststststs','sssssssssss','sssesesesss','sssssssssss',
 'stststststs','sssssssssss','sssesesesss','sssssssssss','stststststs']},
{name:'Caramel ribbons',rows:[
 'ttsssssssss','sttssssssss','ssttsssssss','sssttssssss','ssssttsssss',
 'sssssttssss','ssssssttsss','sssssssttss','sssssssstts','ssssssssstt']},
{name:'Popcorn plaza',rows:[
 'ttttttttttt','sssssssssss','ss.sssss.ss','ss.seses.ss','ss.sssss.ss',
 'ss.sssss.ss','ss.seses.ss','ss.sssss.ss','sssssssssss','ttttttttttt']},
{name:'Pinball picnic',rows:[
 'sssssssssss','tststststst','sssssssssss','ss#sssss#ss','sssssssssss',
 'sssesesesss','sssssssssss','stststststs','sssssssssss','sssss.sssss']},
{name:'Firecracker',rows:[
 'tststststst','seseseseses','sssssssssss','stesesesets','sssssssssss',
 'esesesesese','sssssssssss','stesesesets','sssssssssss','tststststst']},
{name:'Diamond dozen',rows:[
 'sssstttssss','ssstssstsss','sstssssstss','stsssesssts','tssssssssst',
 'tsssesessst','stsssssssts','sstssssstss','ssstssstsss','sssstttssss']},
{name:'Intermission',rows:[
 'sssssssssss','sssssssssss','sssesesesss','sssssssssss','tttsssssttt',
 'sss..#..sss','sssssssssss','sssesesesss','sssssssssss','sssssssssss']},
{name:'Butter braids',rows:[
 'ststssststs','sststststss','ssstststsss','sssststssss','ssssstsssss',
 'sssststssss','ssstststsss','sststststss','ststssststs','tstssssstst']},
{name:'Crackle tower',rows:[
 'tttssessstt','stsssesssts','sssssesssss','sssssesssss','ss#ssess#ss',
 'sssssesssss','stsssesssts','sssssesssss','tttssessstt','sssssesssss']},
{name:'Moonlight matinee',rows:[
 'ssstttttsss','sstssssstss','stsssssssts','tssssssssst','tsss...ssst',
 'tsssesessst','tssssssssst','stsssssssts','sstssssstss','ssstttttsss']},
{name:'Salt & sparkle',rows:[
 'tststststst','seseseseses','stststststs','esesesesese','tststststst',
 'ss#sssss#ss','stststststs','seseseseses','sssssssssss','tststststst']},
{name:'The royal box',rows:[
 'ttttttttttt','tssssssssst','tsstttttsst','tsssesessst','tss.....sst',
 'tss..#..sst','tsssesessst','tsstttttsst','tssssssssst','ttttttttttt']},
{name:'Confetti cannon',rows:[
 'sssssssssss','setstststes','ssesesssess','sssssssssss','stststststs',
 'seseseseses','sssssssssss','ttesttstett','ssesesssess','sssssssssss']},
{name:'Standing ovation',rows:[
 'ttstttttstt','ssstssstsss','ssstssstsss','seseseseses','sssssssssss',
 'ss#sssss#ss','ttstttttstt','ssstssstsss','seseseseses','sssssssssss']},
{name:'The grand finale',rows:[
 'ttetttttett','stststststs','esesesesese','ttssssssstt','sss#sss#sss',
 'sssesesesss','tststststst','sssssssssss','setstststes','sssssssssss']}
];
export const BRICK_GRID={columns:11,x:19,y:120,pitchX:31,pitchY:22,width:27,height:16};
export function makeBricks(index:number):Brick[] {
 const grid=BRICK_GRID;
 return levels[index].rows.flatMap((row,r)=>[...row].flatMap((kind,c)=>kind==='.'?[]:[{x:grid.x+c*grid.pitchX,y:grid.y+r*grid.pitchY,w:grid.width,h:grid.height,hp:kind==='t'?2:kind==='#'?Infinity:1,kind,color:(r+index)%4}]));
}
