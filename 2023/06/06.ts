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
const data = []
contents.forEach((line) => {
  const ps = line.split(/\s+/).slice(1).map(trnum)
  dbg(ps)
  data.push(ps)
});

let tans = data[0].map((tv, raceIdx) => {
  let nw = 0;
  for(let i=0;i<=tv;++i) {
    const dist = i*(tv - i);
    if (dist > data[1][raceIdx]) {
      nw++;
    }
  }
  return nw
})

let ans1 = tans.reduce((a,b) => a*b)

answer(1, ans1)

const d2 = []
contents.forEach((line) => {
  const ll = line.split('').filter(ch => ch!==' ').join('')
  const ps = ll.split(':').slice(1).map(trnum)
  dbg(ps)
  d2.push(ps)
});
/*
let nw = BigInt(0);
for(let i=0;i<=d2[0];++i) {
  const dist = BigInt(i)*(BigInt(d2[0]) - BigInt(i));
  if (dist > d2[1]) {
    nw++;
  }
}
answer(2, nw);
*/
const a = 1;
const b = -d2[0];
const c = d2[1];
const d = b*b-4*a*c;
const root1 = (-b - Math.sqrt(d))/2;
const root2 = (-b + Math.sqrt(d))/2;
const ans2 = Math.floor(root2) - Math.ceil(root1) + 1;
answer(2, ans2)