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
let a1 = 0;
contents.forEach((line) => {
  let digs = line.split('').map(Number).filter(ch => isFinite(ch))
  let dd = digs[0]*10 + digs[digs.length - 1];
  a1 += dd;
});
console.log(a1);
const sdigits = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const ddigits = [];
for(let i=0;i<10;++i) ddigits.push(String(i));
let a2 = 0;
contents.forEach((line) => {
  let fd = Infinity;
  let ld = -1;
  let n1, n2;
  for(let i=0;i<10;++i) {
    let di = line.indexOf(sdigits[i]);
    let si = line.indexOf(ddigits[i]);
    if (di < fd && di !== -1) { n1 = i; fd = di; }
    if (si < fd && si !== -1) { n1 = i; fd = si; }
    let ldi = line.lastIndexOf(sdigits[i]);
    let lsi = line.lastIndexOf(ddigits[i]);
    if (ldi > ld) { n2 = i; ld = ldi; }
    if (lsi > ld) { n2 = i; ld = lsi; }
  }
  dbg([line, n1, n2])
  a2 += 10*n1 + n2;
})
console.log(a2);