import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
import { init } from "z3-solver";
const math = require("mathjs");
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
let lightPatterns = [];
let buttonPatterns = [];
let joltageRatings = [];
contents.forEach((line) => {
  let groups = line.split(' ');
  lightPatterns.push(groups[0].split('').slice(1,-1).join(''));
  let buttonGroups = groups.slice(1, -1);
  let buttonPattern = buttonGroups.map(g => {
    let bp = g.slice(1,-1).split(',').map(Number);
    return bp;
  });
  buttonPatterns.push(buttonPattern);
  joltageRatings.push(groups.slice(-1)[0].slice(1,-1).split(',').map(Number));
});

function solve1(lp, bp) {
  let solutions = new Map<string, number>();
  let open = new Set<string>();
  let initial = '.'.repeat(lp.length);
  open.add(initial);
  solutions.set(initial, 0);
  while(open.size > 0) {
    let nopen = new Set<string>();
    for(let key of open) {
      let value = solutions.get(key);
      let chars = key.split('');
      for(let b=0; b<bp.length; b++) {
        let nchars = [...chars];
        for(let i=0; i<bp[b].length; i++) {
          let pos = bp[b][i];
          nchars[pos] = nchars[pos] === '#' ? '.' : '#';
        }
        let nkey = nchars.join('');
        if (nkey === lp) {
          return value + 1;
        }
        if (!solutions.has(nkey)) {
          solutions.set(nkey, value + 1);
          nopen.add(nkey);
        }
      }
    }
    open = nopen;
  }
}

function solve2(jr, bp) {
  let matrix = [];
  for(let i=0; i<jr.length; i++) {
    matrix.push(new Array(jr.length).fill(0));
  }
  console.log(bp);
  for(let b=0; b<bp.length; b++) {
    for(let i=0; i<bp[b].length; i++) {
      matrix[bp[b][i]][b] = 1;
    }
  }
  console.log(jr, matrix)
  const solution = math.lusolve(matrix, jr);
  console.log('Solution:', solution);
  return 0;
}

let ans1 = 0;
lightPatterns.forEach((lp, idx) => {
  let bp = buttonPatterns[idx];
  let jr = joltageRatings[idx];
  let p1 = solve1(lp, bp);
  console.log(`Pattern ${idx + 1}: ${p1} presses`);
  ans1 += p1;
});
answer(1, ans1);

let ans2 = 0;
lightPatterns.forEach((lp, idx) => {
  let bp = buttonPatterns[idx];
  let jr = joltageRatings[idx];
  let p2 = solve2(jr, bp);
  console.log(`Pattern ${idx + 1}: ${p2} presses`);
  ans2 += p2;
});
answer(2, ans2);