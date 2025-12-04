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
let map = [];
contents.forEach((line) => {
  map.push(line.split(""))
});

function countAdjancent(map, r, c, char) {
  let count = 0;
  for(let i=-1; i<=1; i++) {
    for(let j=-1; j<=1; j++) {
      if(i === 0 && j === 0) continue;
      let nr = r + i;
      let nc = c + j;
      let pval = _.get(map, [nr, nc], null);
      if(pval === char) {
        count++;
      }
    }
  }
  return count;
}

function solve1(map) {
  let ans1 = 0;
  let nmap = _.cloneDeep(map);
  map.forEach((line, r) => {
    line.forEach((char, c) => {
      if (char === '@') {
        let rolls = countAdjancent(map, r, c, '@');
        if (rolls < 4) {
          ans1++;
          nmap[r][c] = 'o';
        }
      }
    });
  });
  return [ans1, nmap];
};

answer(1, solve1(map)[0]);

let ans2 = 0;
while(true) {
  let [t, nmap] = solve1(map);
  if(t === 0) break;
  ans2 += t;
  map = nmap;
}

answer(2, ans2);
