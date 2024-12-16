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

function rotate2dcw([r,c]) {
  return [-c, r];
}

function rotate2dcw90([r,c]) {
  return [c, -r];
}

function bfs(map, sp, ep, dir) {
  let q = new PQ<any>({comparator: (a,b) => a[0] - b[0]});
  let resMap = new HM<any, any>();
  q.queue([0, [sp[0], sp[1]], dir]);
  while (q.length > 0) {
    let [score, pos, cdir] = q.dequeue();
    if (resMap.has([pos, cdir])) {
      continue;
    }
    resMap.set([pos, cdir], score);
    if (_.isEqual(pos, ep)) {
      return score;
    }
    let [r, c] = pos;
    let [dr, dc] = cdir;
    let next = [r+dr, c+dc];
    if (map[next[0]] && map[next[0]][next[1]] === '.') {
      q.queue([score+1, next, cdir]);
    }
    if (map[next[0]] && map[next[0]][next[1]] === 'E') {
      return score+1;
    }
    let cw = rotate2dcw(cdir);
    let ccw = rotate2dcw90(cdir);
    q.queue([score+1000, pos, cw]);
    q.queue([score+1000, pos, ccw]);
  }
  return -1;
}

function bfs2(map, sp, escore, dir, ep) {
  let q = new PQ<any>({comparator: (a,b) => a[0] - b[0]});
  let resMap = new HM<any, any>();
  q.queue([0, [sp[0], sp[1]], dir]);
  while (q.length > 0) {
    let [score, pos, cdir] = q.dequeue();
    if (score > escore) {
      break;
    }
    if (resMap.has([pos, cdir])) {
      continue;
    }
    resMap.set([pos, cdir], score);
    let [r, c] = pos;
    let [dr, dc] = cdir;
    let next = [r+dr, c+dc];
    if (map[next[0]] && map[next[0]][next[1]] === '.') {
      q.queue([score+1, next, cdir]);
    }
    if (map[next[0]] && map[next[0]][next[1]] === 'E') {
      q.queue([score+1, next, cdir]);
    }
    let cw = rotate2dcw(cdir);
    let ccw = rotate2dcw90(cdir);
    q.queue([score+1000, pos, cw]);
    q.queue([score+1000, pos, ccw]);
  }
  //backtrack
  dbg(resMap);
  let ends = [];
  q = new PQ<any>({comparator: (a,b) => b[0] - a[0]});
  resMap.entries().forEach(([key, value]) => {
    if (_.isEqual(key[0], ep) && value === escore) {
      ends.push([value, ...key]);
      q.queue([value, ...key]);
    }
  });
  let resMap2 = new HM<any, any>();
  let partOfPath = [];
  while (q.length > 0) {
    let item = q.dequeue();
    let [score, pos, cdir] = item;
    if (score < 0) {
      continue;
    }
    dbg(item);
    if (resMap.has([pos, cdir])) {
      dbg('here');
      let oldScore = resMap.get([pos, cdir]);
      //dbg([oldScore, score, oldScore + score, escore]);
      if (oldScore === score) {
        partOfPath.push(pos);
      }
    }
    if (resMap2.has([pos, cdir])) {
      continue;
    }
    resMap2.set([pos, cdir], score);
    let [r, c] = pos;
    let [dr, dc] = cdir;
    let next = [r-dr, c-dc];
    if (map[next[0]] && map[next[0]][next[1]] === '.') {
      q.queue([score-1, next, cdir]);
    }
    if (map[next[0]] && map[next[0]][next[1]] === 'S') {
      partOfPath.push(next);
      dbg(partOfPath);
    }
    let cw = rotate2dcw(cdir);
    let ccw = rotate2dcw90(cdir);
    q.queue([score-1000, pos, cw]);
    q.queue([score-1000, pos, ccw]);
  }
  partOfPath = _.uniqWith(partOfPath, _.isEqual);
  dbg(partOfPath.length);
  return partOfPath.length;
}

DEBUG = false;

let ans1 = bfs(map, sp, ep, [0, 1]);
answer(1, ans1);

let ans2 = bfs2(map, sp, ans1, [0, 1], ep);
answer(2, ans2);