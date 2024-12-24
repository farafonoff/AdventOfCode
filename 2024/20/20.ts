import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
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
let map = []
let sp = []
let ep = [];
contents.forEach((line) => {
  let split = line.split('');
  map.push(split);
  if (split.includes('S')) {
    sp = [map.length-1, split.indexOf('S')];
  }
  if (split.includes('E')) {
    ep = [map.length-1, split.indexOf('E')];
  }
});

function bfs(map, sp, ep): [number, HM<[number, number], number>] {
  let q = new PQ<any>({comparator: (a,b) => a[0] - b[0]});
  let resMap = new HM<any, any>();
  q.queue([0, sp]);
  while (q.length > 0) {
    let [score, pos] = q.dequeue();
    if (resMap.has(pos)) {
      continue;
    }
    resMap.set(pos, score);
    if (_.isEqual(pos, ep)) {
      return [score, resMap];
    }
    let [r, c] = pos;
    let nexts = dirs.map(dirf => dirf([r,c])).filter(nextv => _.get(map,nextv) !== '#');
    nexts.forEach((nv) => {
      q.queue([score + 1, nv])
    })
  }
  return [-1, null];
}

let a0 = bfs(map, sp, ep)
dbg(a0[0], 'no cheats');
let ar = bfs(map, ep, sp)
dbg(ar[0], 'reverse')
let totDist = ar[0];

let ss = a0[1]
let es = ar[1]

function solve(cheatTime) {
  let ans1 = 0;
  let cheatCounts = new Map<number, number>();
  ss.entries().forEach(([pos1, dist1]) => {
    es.entries().forEach(([pos2, dist2]) => {
      let mhd = Math.abs(pos1[0] - pos2[0]) + Math.abs(pos1[1] - pos2[1]);
      if (mhd <= cheatTime) {
        let newDist = dist1 + dist2 + mhd
        if (newDist < totDist) {
          //console.log({newDist})
          let cheatValue = totDist - newDist;
          if (!cheatCounts.has(cheatValue)) {
            cheatCounts.set(cheatValue, 0)
          }
          cheatCounts.set(cheatValue, cheatCounts.get(cheatValue) + 1)
          if (cheatValue >= 100) {
            ans1 += 1;
          }
        }
      }
    })
  })
  return ans1
}
//dbg(cheatCounts)
answer(1, solve(2));
answer(2, solve(20));