import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
const infile = process.argv[2] || "input";

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

function incHM(tab: HM<unknown, number>, key: unknown, inc: number, dv = 0) {
  let ov = tab.get(key) || dv;
  tab.set(key, ov + inc);
}
let DEBUG = false;

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
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
const map = []
contents.forEach((line) => {
  map.push(line.split(''))
});

const eRows = new HM();
const eCols = new HM();
const galax = [];

for(let i=0;i<map.length;++i) {
  if (!map[i].find(vl => vl === '#')) {
    eRows.set(i, 1);
  }
  for(let j=0;j<map[i].length;++j) {
    if (map[i][j] === '#') galax.push([i, j])
  }
}

for(let i=0;i<map[0].length;++i) {
  if (!map.map(ro => ro[i]).find(vl => vl === '#')) {
    eCols.set(i, 1)
  }
}



dbg([eRows.keys(), eCols.keys(), galax])
function solve(ev = 2) {
  let ans1 = 0;
  galax.forEach(gl => {
    galax.forEach(ogl => {
      let dist = 0;
      for(let i=gl[0];i<ogl[0];++i) {
        if (eRows.has(i)) dist += ev; else dist+=1;
      }
      for(let i=gl[1];i<ogl[1];++i) {
        if (eCols.has(i)) dist += ev; else dist+=1;
      }
      ans1+=dist;
    })
  })
  return ans1;
}

answer(1, solve(2))
answer(2, solve(1000000))
