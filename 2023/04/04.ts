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
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let ans1 = 0;
contents.forEach((line) => {
  const [header, body] = line.split(':');
  const [winning, card] = body.split('|').map(list => list.split(' ').map(trnum).filter(v => !!v))
  const ws = new Set(winning);
  let vl = 0;
  card.forEach(cv => {
    if (ws.has(cv)) {
      if (vl === 0) vl = 1; else vl *= 2;
    }
  })
  ans1 += vl;
});

let ans2 = 0;
let dupcounts = [];
dupcounts[0] = 1;
contents.forEach((line, li) => {
  const [header, body] = line.split(':');
  let [____, cn] = header.split(' ').map(s => trnum(s.trim()))
  const [winning, card] = body.split('|').map(list => list.split(' ').map(trnum).filter(v => !!v))
  const ws = new Set(winning);
  let vl = 0;
  card.forEach(cv => {
    if (ws.has(cv)) {
      ++vl;
    }
  })
  dbg([cn, vl]);
  for(let i=li+1;i<=li+vl;++i) {
    //dbg([li, vl])
    dupcounts[i] = _.get(dupcounts, [i], 1) + (_.get(dupcounts, [li], 1));
  }
  dupcounts[li] = _.get(dupcounts, [li], 1)
  ans2 += dupcounts[li];
});

dbg(dupcounts)

answer(1, ans1)
answer(2, ans2)