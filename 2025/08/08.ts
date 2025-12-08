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
let junctions = [];
contents.forEach((line) => {
  let junk = line.split(',').map(s => Number(s));
  junctions.push(junk)
});

let distances = new HM<[number, number], number>();
for (let i = 0; i < junctions.length; ++i) {
  for (let j = i + 1; j < junctions.length; ++j) {
    let [x1, y1, z1] = junctions[i];
    let [x2, y2, z2] = junctions[j];
    let dist = (x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2;
    distances.set([i, j], dist);
  }
}

let dentries = distances.entries();
dentries.sort((a, b) => a[1] - b[1]);

const CONNECT = infile.includes('test') ? 10 : 1000;
function solve1(topConnections, fastBreak = false) {
  let connections = dentries.slice(0, topConnections);
  let connListMap = new HM<number, number[]>();
  connections.forEach(([key, val]) => {
    connListMap.set(key[0], (connListMap.get(key[0]) || []).concat([key[1]]));
    connListMap.set(key[1], (connListMap.get(key[1]) || []).concat([key[0]]));
  });

  let subgraphMap = new HM<number, number>();
  let subgraphRMap = new HM<number, number[]>();
  function subgraph(sgId, startNode) {
    let toVisit = new Set<number>();
    toVisit.add(startNode);
    while (toVisit.size > 0) {
      let node = toVisit.keys().next().value;
      toVisit.delete(node);
      subgraphMap.set(node, sgId);
      let ormap = subgraphRMap.get(sgId) || [];
      ormap.push(node);
      subgraphRMap.set(sgId, ormap);
      let neighbors = connListMap.get(node) || [];
      neighbors.forEach((nn) => {
        if (!subgraphMap.has(nn)) {
          toVisit.add(nn);
        }
      });
    }
  }

  let sgId = 0;
  while (true) {
    if (fastBreak && sgId > 1) {
      return 666;
    }
    let firstUnassigned = junctions.findIndex(
      (_, idx) => !subgraphMap.has(idx)
    );
    if (firstUnassigned === -1) {
      break;
    }
    subgraph(sgId, firstUnassigned);
    ++sgId;
  }

  let subgraphEntries = subgraphRMap.entries();
  if (subgraphEntries.length === 1) {
    return -1;
  }
  subgraphEntries.sort((a, b) => b[1].length - a[1].length);
  let top3Subgraphs = subgraphEntries.slice(0, 3);
  let ans1 = top3Subgraphs.reduce(
    (acc, [sgid, nodes]) => acc * nodes.length,
    1
  );
  return ans1;
}
answer(1, solve1(CONNECT, false));

let low = 0;
let high = dentries.length;
while (low < high) {
  let mid = Math.floor((low + high) / 2);
  let res = solve1(mid, true);
  if (res === -1) {
    high = mid;
  } else {
    low = mid + 1;
  }
  console.log('Bisect...', [low, high]);  
}
/*console.log('Minimum connections for single subgraph:', high);
console.log('Last connnection', dentries[high - 1]);
console.log('Last connected entries', junctions[dentries[high - 1][0][0]], junctions[dentries[high - 1][0][1]]);*/
let ans2 = junctions[dentries[high - 1][0][0]][0]*junctions[dentries[high - 1][0][1]][0];
answer(2, ans2);