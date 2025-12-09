import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { max } from "lodash";
const infile = process.argv[2] || "input";

function cached<T extends Function>(fn: T): T {
  const cache = new HM();
  function inner() {
    let key = [...arguments];
    if (cache.has(key)) {
      return cache.get(key)
    }
    let res = fn(...arguments)
    cache.set(key, res)
    return res;
  }
  return inner as any;
}

function trnum(val: string): number | string {
  let nn = Number(val);
  if (val !== "" && isFinite(nn)) {
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

const up = ([a,b]) => [a-1, b];
const down = ([a,b]) => [a+1, b];
const left = ([a,b]) => [a, b-1];
const right = ([a,b]) => [a, b+1];
const dirs = [up, down, left, right]

function incHM(tab: HM<unknown, number>, key: unknown, inc: number, dv = 0) {
  let ov = tab.get(key) || dv;
  tab.set(key, ov + inc);
}
let DEBUG = true;

function dbg(expression: any, message: string = ""): any {
  if (!DEBUG) {
    return expression;
  }
  if (message) {
    console.log(message, expression);
  } else {
    console.log(expression);
  }
  return expression;
}

function answer(part, value) {
  console.log(`Answer ${part}: ${value}`);
}

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let rects = [];
contents.forEach((line) => {
  const [x1, y1] = line.split(",").map(Number);
  rects.push([x1, y1]);
});

let maxArea = 0;
for(let i=0; i<rects.length; i++) {
  for(let j=i+1; j<rects.length; j++) {
    let area = (Math.abs(rects[i][0]-rects[j][0]) + 1) * (Math.abs(rects[i][1]-rects[j][1]) + 1);
    if (area > maxArea) {
      maxArea = area;
    }
  }
}
answer(1, maxArea);

function insidePolygon(px, py) {
  let crossings = 0;

  for (let i = 0; i < rects.length; i++) {
    const p = rects[i];
    const n = rects[(i + 1) % rects.length];

    const x1 = p[0], y1 = p[1];
    const x2 = n[0], y2 = n[1];

    if (x1 !== x2) continue;

    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    if (py < minY || py >= maxY) continue; 

    if (px < x1) {
      crossings++;
    }
  }

  return (crossings % 2) === 1;
}


function intersects(xm, xM, ym, yM) {
  for (let i = 0; i < rects.length; i++) {
    let p = rects[i];
    let n = rects[(i + 1) % rects.length];

    let x1 = p[0], y1 = p[1];
    let x2 = n[0], y2 = n[1];

    if (y1 === y2) {
      let y = y1;
      if (ym < y && y < yM) {
        if (Math.max(x1, x2) > xm && Math.min(x1, x2) < xM) {
          return true;
        }
      }
    } else if (x1 === x2) {
      let x = x1;
      if (xm < x && x < xM) {
        if (Math.max(y1, y2) > ym && Math.min(y1, y2) < yM) {
          return true;
        }
      }
    }
  }
  return false;
}

let maxArea2 = 0;
for(let i=0; i<rects.length; i++) {
  for(let j=i+1; j<rects.length; j++) {
    let xm = Math.min(rects[i][0], rects[j][0]);
    let xM = Math.max(rects[i][0], rects[j][0]);
    let ym = Math.min(rects[i][1], rects[j][1]);
    let yM = Math.max(rects[i][1], rects[j][1]);
    let area = (xM - xm + 1) * (yM - ym + 1);
    if (area <= maxArea2) {
      continue;
    }
    //console.log('Considering area', area, [xm, xM, ym, yM], 'between points', rects[i], rects[j]);
    if (!insidePolygon((xm + xM) / 2, (ym + yM) / 2)) {
      //console.log('  - rejected by insidePolygon');
      continue;
    }
    if (intersects(xm, xM, ym, yM)) {
      //console.log('  - rejected by intersects');
      continue;
    }
    if (area > maxArea2) {
      //console.log('  - accepted');
      maxArea2 = area;
    }
  }
}

answer(2, maxArea2);