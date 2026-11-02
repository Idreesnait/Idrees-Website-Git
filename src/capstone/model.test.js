import test from 'node:test';
import assert from 'node:assert/strict';
import { scaleFromLine, seriesFor, summarize, makeTrial, trialStats, toCSV, sessionCSV, graphSVG } from './model.js';
import { dictionary, markerSVG, makeDetector, dedupeDetections } from './markers.js';

const marker = (x, y, angle = 0, id = 0) => {
  const a = -angle * Math.PI / 180;
  return { id, corners: [[-10,-10],[10,-10],[10,10],[-10,10]].map(([dx,dy]) => ({ x: x + dx*Math.cos(a)-dy*Math.sin(a), y: y+dx*Math.sin(a)+dy*Math.cos(a) })) };
};
const frames = Array.from({ length: 11 }, (_, i) => ({ t: i / 10, markers: [marker(30 + i * 20, 40)] }));
const trial = overrides => makeTrial({ frames, id: 0, scale: .1, height: 360, actual: 20, tolerance: 1, minCoverage: 90, source: 'video', complete: true, ...overrides });

test('20 cm ruler calibration and endpoint movement retain independent units', () => {
  const scale = scaleFromLine({x:10,y:20}, {x:210,y:20}, 20);
  const rows = seriesFor(frames, 0, scale, 360);
  assert.equal(scale, .1); assert.equal(rows.at(-1).displacement, 20);
  assert.equal(rows.at(-1).dx, 20); assert.equal(rows.at(-1).dy, 0);
  assert.equal(rows.at(-1).xPx, 230); assert.equal(rows.at(-1).y, 32);
  assert.throws(() => scaleFromLine({x:0,y:0}, {x:0,y:0}, 20));
  assert.throws(() => scaleFromLine({x:0,y:0}, {x:200,y:0}, -20));
});
test('rotation unwraps across ±180 degrees without a 360 degree spike', () => {
  const rows = seriesFor([{t:0,markers:[marker(40,40,179)]},{t:1,markers:[marker(40,40,-179)]}],0);
  assert.ok(Math.abs(rows[1].rotation - 2) < .000001);
});
test('missing detections stay missing and do not bridge an unknown path', () => {
  const rows = seriesFor([frames[0],{t:.1,markers:[]},frames[10]],0,.1,360);
  assert.equal(rows[1].detected,false); assert.equal(rows[1].xPx,undefined);
  assert.equal(rows[2].displacement,20); assert.equal(rows[2].path,0);
  assert.ok(Math.abs(summarize(rows).coverage - 200/3) < .000001);
});
test('duplicate IDs are ambiguous and excluded from measured positions', () => {
  const rows = seriesFor([{t:0,markers:[marker(0,0),marker(100,100)]}],0);
  assert.equal(rows[0].ambiguous,true); assert.equal(rows[0].detected,false);
});
test('nested detector contours merge while separate same-ID objects stay ambiguous', () => {
  assert.equal(dedupeDetections([marker(100,100),marker(100.5,100.5),marker(200,200)]).length,2);
  assert.equal(dedupeDetections([marker(100,100),marker(100,100,0,1)]).length,2);
});
test('trial decisions require endpoints, completion, enough samples, calibration and limits', () => {
  assert.equal(trial({}).result,'PASS'); assert.equal(trial({actual:25}).result,'RETRY');
  assert.equal(trial({complete:false}).result,'INCOMPLETE');
  assert.equal(trial({frames:[...frames,{t:1.1,markers:[]}]}).result,'INCOMPLETE');
  assert.equal(trial({frames:frames.slice(0,2)}).result,'INCOMPLETE');
  assert.throws(()=>trial({scale:null})); assert.throws(()=>trial({actual:0}));
  const occluded = frames.map((f,i)=>i===4||i===5?{...f,markers:[]}:f);
  assert.equal(trial({frames:occluded}).result,'RETRY');
});
test('summary excludes demo and incomplete trials', () => {
  const stats = trialStats([trial({}),trial({actual:21}),trial({source:'demo',actual:100}),trial({complete:false,actual:100})]);
  assert.equal(stats.count,2); assert.equal(stats.mae,.5); assert.equal(stats.rmse,Math.sqrt(.5));
});
test('CSV carries missing rows, calibration and multi-marker metadata without fabricated values', () => {
  const data = sessionCSV({frames:[...frames,{t:2,markers:[marker(70,80,0,5)]}],target:0,scale:.1,width:640,height:360,source:'video',fps:10,complete:true,calibration:{method:'two-point',referenceCm:20}});
  assert.match(data,/calibration_method/); assert.match(data,/two-point,20/); assert.match(data,/,5,true,false,/);
  assert.equal(data.split('\r\n').length,25);
  const raw = sessionCSV({frames,target:0,scale:null,width:640,height:360,source:'video',fps:10});
  assert.match(raw,/,px,/); assert.match(raw,/,30,40,,,0,0,0,0,px,/);
  assert.equal(toCSV(['notes'],[['=HYPERLINK("evil")']]),'notes\r\n"\'=HYPERLINK(""evil"")"');
});
test('graph breaks paths at missing samples and exports accessible SVG', () => {
  const rows=seriesFor([frames[0],{t:.1,markers:[]},frames[2]],0,.1,360);
  const svg=graphSVG(rows);
  assert.match(svg,/aria-label=/); assert.match(svg,/M[\d.,]+ M[\d.,]+/);
  assert.ok(!svg.includes('NaN'));
});
test('dictionary has 250 unique genuine codes and SVG size includes quiet zone', () => {
  assert.equal(dictionary.codeList.length,250); assert.equal(new Set(dictionary.codeList).size,250);
  assert.ok(dictionary.codeList.every(c=>c.length===36));
  assert.match(markerSVG(0,50),/width="62.5mm" height="62.5mm"/);
  assert.match(markerSVG(249,50),/viewBox="0 0 10 10"/);
  assert.throws(()=>markerSVG(250)); assert.throws(()=>markerSVG(-1)); assert.throws(()=>markerSVG(1,0));
});

// Rasterize the actual dictionary bits independently of the browser's rendering.
// Test the complete detection pipeline, not mocked marker positions.
function raster(id, turns=0, flippedBits=[]) {
  const width=200,height=200,data=new Uint8ClampedArray(width*height*4).fill(255),code=dictionary.codeList[id];
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    let cx=Math.floor(x/16),cy=Math.floor(y/16);
    for(let t=0;t<turns;t++) [cx,cy]=[cy,7-cx];
    const inner=cx>0&&cx<7&&cy>0&&cy<7, bit=(cy-1)*6+cx-1;
    let white=inner&&code[bit]==='1'; if(inner&&flippedBits.includes(bit))white=!white;
    const index=((y+36)*width+x+36)*4;
    data[index]=data[index+1]=data[index+2]=white?255:0;
  }
  return {width,height,data};
}
test('all 250 printed marker IDs round-trip through the real detector', () => {
  const detector=makeDetector();
  for(let id=0;id<250;id++) {
    const found=detector.detect(raster(id));
    assert.equal(found.length,1,`ID ${id}: count`); assert.equal(found[0].id,id);
  }
});
test('rotated and slightly damaged real markers decode correctly; blank frame has no marker', () => {
  const detector=makeDetector();
  for(const id of [0,23,100,249])for(let rotation=0;rotation<4;rotation++) assert.equal(detector.detect(raster(id,rotation))[0]?.id,id);
  assert.equal(detector.detect(raster(23,0,[0,12]))[0]?.id,23);
  const blank={width:200,height:200,data:new Uint8ClampedArray(200*200*4).fill(255)};
  assert.equal(detector.detect(blank).length,0);
});
