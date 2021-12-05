import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
const infile = process.argv[2] || "input";

function trnum(val: string): number | string {
  let nn = Number(val);
  if (isFinite(nn)) {
    return nn;
  }
  return val;
}
function decimalToHex(d, padding) {
  var hex = Number(d).toString(16);
  padding =
    typeof padding === "undefined" || padding === null
      ? (padding = 2)
      : padding;

  while (hex.length < padding) {
    hex = "0" + hex;
  }

  return hex;
}

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => s.split(/[ \->,]+/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
function isVH(seg) {
  return seg[0] === seg[2] || seg[1] === seg[3];
}

let points = new HM();

function draw(seg) {
  if (seg[0] === seg[2]) {
    let dy = Math.sign(seg[3] - seg[1]);
    //console.log(dy);
    for (let t = seg[1]; t !== seg[3] + dy; t += dy) {
      let poi = [seg[0], t];
      //console.log(poi);
      if (points.has(poi)) {
        let v = points.get(poi) as number;
        points.set(poi, v + 1);
      } else {
        points.set(poi, 1);
      }
    }
  } else if (seg[1] === seg[3]) {
    let dy = Math.sign(seg[2] - seg[0]);
    //console.log(dy);
    for (let t = seg[0]; t !== seg[2] + dy; t += dy) {
      let poi = [t, seg[1]];
      //console.log(poi);
      if (points.has(poi)) {
        let v = points.get(poi) as number;
        points.set(poi, v + 1);
      } else {
        points.set(poi, 1);
      }
    }
  } else {
    let dy = Math.sign(seg[3] - seg[1]);
    let dx = Math.sign(seg[2] - seg[0]);
    let pv = [seg[0], seg[1]];
    for (let t = seg[0]; t !== seg[2] + dx; t += dx) {
      const poi = pv;
      if (points.has(poi)) {
        let v = points.get(poi) as number;
        points.set(poi, v + 1);
      } else {
        points.set(poi, 1);
      }
      pv = [pv[0] + dx, pv[1] + dy];
    }
  }
}

contents.filter(isVH).forEach((line) => {
  draw(line);
});
let ans1 = 0;
points.forEach((v, k) => {
  if (v > 1) {
    ans1++;
  }
});
console.log(ans1);
contents
  .filter((f) => !isVH(f))
  .forEach((line) => {
    draw(line);
  });
let ans2 = 0;
points.forEach((v, k) => {
  if (v > 1) {
    ans2++;
  }
});
console.log(ans2);
