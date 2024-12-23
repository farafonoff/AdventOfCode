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

DEBUG = false;

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let map = []
let heads = []
contents.forEach((line, ri) => {
  let row = line.split('');
  map.push(row.map(Number))
  row.forEach((cell, ci) => {
    if (cell === '0') {
      heads.push([ri, ci])
    }
  })
});

dbg(heads)

function bfs1(head) {
  let q = [head];
  for(let ll = 1; ll <= 9; ++ll) {
    q = q.flatMap(p => {
      let [r, c] = p;
      return dirs.map(dir => {
        let np = dir(p);
        return np;
      }).filter(np => _.get(map, np, -1) === ll);
    });
    q = _.uniqWith(q, _.isEqual);
  }
  return q.length;
}

let ans1 = heads.map(bfs1).reduce((a,b) => a+b);

answer(1, ans1);

function bfs2(head) {
  let q = [[head, 1]];
  for(let ll = 1; ll <= 9; ++ll) {
    dbg(q);
    q = q.flatMap(p => {
      let [pos, rat] = p;
      return dirs.map(dir => {
        let np = dir(pos);
        return np;
      }).filter(np => _.get(map, np, -1) === ll)
      .map(np => [np, rat]);
    });
    let ratings = new HM<number[], number>();
    q.forEach(([np, rat]) => {
      let ov = ratings.get(np) || 0;
      ratings.set(np, ov + rat);
    });
    q = [...ratings.entries()].map(([np, rat]) => [np, rat]);
  }
  dbg(q, 'final');
  let score = q.map(([pos, rat]) => rat).reduce((a,b) => a+b);
  dbg(score, 'score');
  return score;
}

let ans2 = heads.map(bfs2).reduce((a,b) => a+b);
answer(2, ans2);