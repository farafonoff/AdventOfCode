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
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
const seqs = []
contents.forEach((line) => {
  seqs.push(line.split(' ').map(Number))
});
function prNext(seq) {
  let diffs = []
  let az = true;
  for(let i=1;i<seq.length;++i) {
    let lv = seq[i]-seq[i-1]
    diffs.push(lv);
    if (lv!==0) az = false;
  }
  if (az) {
    return seq[0];
  } else {
    const nextD = prNext(diffs);
    return seq[seq.length - 1] + nextD;
  }
}

function prPrev(seq) {
  let diffs = []
  let az = true;
  for(let i=1;i<seq.length;++i) {
    let lv = seq[i]-seq[i-1]
    diffs.push(lv);
    if (lv!==0) az = false;
  }
  if (az) {
    return seq[0];
  } else {
    const nextD = prPrev(diffs);
    return seq[0] - nextD;
  }
}


const nexts = seqs.map(ss => prNext(ss))
answer(1, nexts.reduce((a,b) => a+b))
const prevs = seqs.map(ss => prPrev(ss))
answer(2, prevs.reduce((a,b) => a+b))