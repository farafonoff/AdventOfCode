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
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

const rules = [];
const jobs = [];
contents.forEach((line) => {
  if (line.indexOf('|') >= 0) {
    rules.push(line.split('|').map(s => Number(s)));
  }
  if (line.indexOf(',') >= 0) {
    jobs.push(line.split(',').map(s => Number(s)));
  }
});

function isOrdered(job) {
  return rules.map(([a,b]) => {
    let i1 = job.indexOf(a);
    let i2 = job.indexOf(b);
    if (i1 < 0 || i2 < 0) {
      return true;
    }
    return i1 < i2;
  }).filter(x => !x).length === 0;
}

function isUnordered(job) {
  return rules.map(([a,b]) => {
    let i1 = job.indexOf(a);
    let i2 = job.indexOf(b);
    if (i1 < 0 || i2 < 0) {
      return false;
    }
    return i1 > i2;
  }).filter(x => x).length > 0;
}

function middle(job) {
  return job[job.length >> 1];
}

const ruleMap = new Map();
rules.forEach(([a,b]) => {
  if (ruleMap.has(a)) {
    let old = ruleMap.get(a);
    ruleMap.set(a, [...old,b]);
  } else {
    ruleMap.set(a,[b]);
  }
});

function closeKey(key) {
  let vals = ruleMap.get(key);
  let open = new Set(vals);
  let closed = new Set();
  while(open.size > 0) {
    let v = open.values().next().value;
    open.delete(v);
    closed.add(v);
    if (ruleMap.has(v)) {
      let newVals = ruleMap.get(v);
      newVals.forEach(nv => {
        if (!closed.has(nv)) {
          open.add(nv);
        }
      });
    }
  }
  return closed;
}

let closedMap = new Map();
function closeRules() {
  for(let key of ruleMap.keys()) {
    let closed = closeKey(key);
    closedMap.set(key, closed);
  }
}

closeRules();
dbg(closedMap);


let ans1 = jobs.filter(j => isOrdered(j)).map(middle).reduce((a,b) => a+b, 0);
answer(1, ans1);

let ans2 = 0;
let uno = jobs.filter(j => isUnordered(j))
uno.forEach(j => {
  dbg(j);
  j.sort((a,b) => {
    let rule = rules.filter(([x,y]) => x === a && y === b);
    let rule2 = rules.filter(([x,y]) => x === b && y === a);
    if (rule.length > 0) {
      return -1;
    }
    if (rule2.length > 0) {
      return 1;
    }
    return 0;
  });
  dbg(j);
  if (!isOrdered(j)) {
    throw new Error("Not ordered");
  }
  const mid = middle(j);
  ans2 += mid;
})
answer(2, ans2);