import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
const infile = process.argv[2] || "input";

function trnum(val: string): number | string {
  let nn = Number(val);
  if (isFinite(nn)) {
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
let data = contents
  .slice(1)
  .map(
    (r) => r.split(" ").map(Number).slice(1)
    //.map((v) => v - 1)
  )
  .map((row, rowId) => {
    let res = new HM();
    row.forEach((rv) => res.set(rv, 1));
    return { rowId: rowId + 1, cont: res };
  });
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let queue = new PQ<number>({ comparator: (a, b) => a - b });
function addEmpty() {
  data = data.filter((dd) => {
    if (dd.cont.count() === 0) {
      queue.queue(dd.rowId);
      return false;
    }
    return true;
  });
}

let mult = 1;
let res = 0;
try {
  while (true) {
    addEmpty();
    let element = queue.dequeue();
    data.forEach((dv) => dv.cont.delete(element));
    dbg(element);
    res += element * mult;
    ++mult;
  }
} catch (_) {}

answer(1, res);
