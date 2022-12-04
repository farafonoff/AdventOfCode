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
  .filter((s) => s.length > 0)
  .map((s) => s.split(","))
  .map((sa) => sa.map((sl) => sl.split("-").map((ss) => trnum(ss))));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let inclu = (e1, e2) => {
  if (e1[0] <= e2[0] && e1[1] >= e2[1]) {
    return true;
  }
  return false;
};
let inclu2 = (e1, e2) => inclu(e1, e2) || inclu(e2, e1);
let ovl = (e1, e2) => {
  if (e1[0] <= e2[0] && e2[0] <= e1[1]) {
    return true;
  }
  return false;
};
let ovl2 = (e1, e2) => ovl(e1, e2) || ovl(e2, e1);
let a1 = 0;
let a2 = 0;
contents.forEach((line) => {
  let [e1, e2] = line;
  if (inclu2(e1, e2)) a1++;
  if (ovl2(e1, e2)) a2++;
});
answer(1, a1);
answer(2, a2);
