import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PriorityQueue from "js-priority-queue";
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
  .filter((s) => s.length > 0)
  .map((s) => s.replace(/[=;, ]+/g, " "))
  .map((s) => s.split(" "));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let parsed = [];
let valveNames = {};
DEBUG = false;
contents.forEach((line) => {
  let [
    valve,
    name,
    has,
    flow,
    rate,
    value,
    tunnel,
    lead,
    to,
    valves,
    ...nexts
  ] = line;
  parsed.push({ name, value: Number(value), nexts });
  valveNames[name] = { name, value: Number(value), nexts };
});

dbg(valveNames);
dbg(parsed);
let nonzero = parsed.filter((v) => v.value > 0);
let vindex = (vname) => parsed.findIndex((v) => v.name === vname);

let distances = [];
parsed.forEach((valve, idx) => {
  parsed.forEach((valve2, idx2) => {
    _.set(distances, [idx, idx2], Infinity);
  });
  _.set(distances, [idx, idx], 0);
});
parsed.forEach((valve, idx) => {
  valve.nexts.forEach((vn) => {
    let vi = vindex(vn);
    _.set(distances, [idx, vi], 1);
    _.set(distances, [vi, idx], 1);
  });
});

for (let k = 0; k < parsed.length; ++k) {
  parsed.forEach((valve, idx) => {
    parsed.forEach((valve2, idx2) => {
      if (distances[idx][k] + distances[k][idx2] < distances[idx][idx2]) {
        distances[idx][idx2] = distances[idx][k] + distances[k][idx2];
      }
    });
  });
}
let ALLTIME = 30;
dbg(distances);
dbg(nonzero);
DEBUG = false;
let maxScore = -Infinity;
let maxResult = null;
function dfs(nodes, path, position, time, flow, score) {
  if (time >= ALLTIME) {
    score -= flow * (time - ALLTIME);
    time = ALLTIME;
    dbg([time, score, flow]);
    dbg(path);
    if (maxScore < score) {
      maxResult = path;
      maxScore = score;
    }
    return;
  }
  path.push(position);
  if (valveNames[position].value > 0) {
    time += 1;
    score += flow;
    flow += valveNames[position].value;
  }
  let oi = vindex(position);
  let recursed = false;
  nodes.forEach((v) => {
    if (path.indexOf(v.name) !== -1) {
      return;
    }
    let ni = vindex(v.name);
    recursed = true;
    let dtime = distances[oi][ni];
    dfs(nodes, path, v.name, time + dtime, flow, score + flow * dtime);
  });
  if (!recursed) {
    let remain = ALLTIME - time;
    score += flow * remain;
    dbg([time, score, flow]);
    if (maxScore < score) {
      maxResult = path;
      maxScore = score;
    }
  }
  path.splice(path.length - 1, 1);
}

dfs(nonzero, [], "AA", 0, 0, 0);

answer(1, maxScore);
ALLTIME = 26;
DEBUG = false;
let maxScore2 = -Infinity;
console.log("BRUTE SIZE " + 2 ** nonzero.length);
for (let i = 0; i < 2 ** nonzero.length; ++i) {
  let mine = [];
  let elephants = [];
  if (i % 1000 === 0) {
    console.log("..." + i);
  }
  nonzero.forEach((v, idx) => {
    let bv = (i & (1 << idx)) !== 0;
    if (bv) {
      mine.push(v);
    } else {
      elephants.push(v);
    }
  });
  maxScore = -Infinity;
  dfs(mine, [], "AA", 0, 0, 0);
  let ans2 = maxScore;
  maxScore = -Infinity;
  dfs(elephants, [], "AA", 0, 0, 0);
  ans2 += maxScore;
  maxScore2 = Math.max(maxScore2, ans2);
}

answer(2, maxScore2);
