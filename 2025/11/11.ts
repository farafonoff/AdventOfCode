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
const connMap = new HM<string, string[]>();
const nodeIndex = new HM<string, number>();
const nodeList = [];
let counter = 0;
function indexNode(node: string): number {
  if (nodeIndex.has(node)) {
    return nodeIndex.get(node)!;
  }
  nodeIndex.set(node, counter);
  nodeList.push(node);
  counter++;
  return counter - 1;
}
contents.forEach((line) => {
  const parsed = line.split(" ");
  const node = parsed[0].slice(0, -1);
  indexNode(node);
  let dests = parsed.slice(1);
  dests.forEach(d => indexNode(d));
  connMap.set(node, dests);
});

const reachCount = new HM<string, number>();

function dfs(node: string, endNode: string) {
  let prevReachCount = reachCount.get(node) || 0;
  reachCount.set(node, prevReachCount + 1);  
  if (node === endNode) {
    return;
  }
  let conns = connMap.get(node) || [];
  for (let c of conns) {
    dfs(c, endNode);
  }
}

dfs("you", "out");
answer(1, reachCount.get("out"));

let reachablityMatrix = [];
for (let i = 0; i < nodeList.length; i++) {
  reachablityMatrix[i] = [];
  for (let j = 0; j < nodeList.length; j++) {
    reachablityMatrix[i][j] = 0;
    const directReachable = connMap.get(nodeList[i])?.includes(nodeList[j]) ? 1 : 0;
    reachablityMatrix[i][j] = directReachable;
  }
}

for (let k = 0; k < nodeList.length; k++) {
  let newMatrix = [];
  for (let i = 0; i < nodeList.length; i++) {
    newMatrix[i] = [];
    for (let j = 0; j < nodeList.length; j++) {
      newMatrix[i][j] = reachablityMatrix[i][j] + 
                        reachablityMatrix[i][k] * reachablityMatrix[k][j];
    }
  }
  reachablityMatrix = newMatrix;
}

//answer(1, reachablityMatrix[nodeIndex.get("you")!][nodeIndex.get("out")!]);
let fftdac =
  reachablityMatrix[nodeIndex.get("svr")!][nodeIndex.get("fft")!] *
  reachablityMatrix[nodeIndex.get("fft")!][nodeIndex.get("dac")!] *
  reachablityMatrix[nodeIndex.get("dac")!][nodeIndex.get("out")!];
let dacfft = 
  reachablityMatrix[nodeIndex.get("svr")!][nodeIndex.get("dac")!] *
  reachablityMatrix[nodeIndex.get("dac")!][nodeIndex.get("fft")!] *
  reachablityMatrix[nodeIndex.get("fft")!][nodeIndex.get("out")!];
answer(2, fftdac + dacfft)
