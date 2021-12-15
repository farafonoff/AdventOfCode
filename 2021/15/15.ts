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
  .filter((s) => s.length > 0)
  .map((s) => s.split("").map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let open = new PQ({
  comparator: (a, b) => a[1] - b[1],
});
let closed = new HM();
let sp = [0, 0];
let ep = [contents.length - 1, contents[0].length - 1];
let adjm = [
  [-1, 0],
  [1, 0],
  [0, 1],
  [0, -1],
];
function bfs(contents, sp) {
  open.queue([sp, 0]);
  while (open.length > 0) {
    let top = open.dequeue();
    let tq = top[0];
    if (closed.has(tq)) {
      continue;
    }
    adjm.map((am) => {
      let coord = [am[0] + tq[0], am[1] + tq[1]];
      let risk = _.get(contents, coord, Infinity) + top[1];
      if (isFinite(risk)) {
        open.queue([coord, risk]);
      }
    });
    closed.set(tq, top[1]);
  }
}
bfs(contents, sp);
answer(1, closed.get(ep));
//expand
let contents1 = contents.map((row) => {
  let row1 = [...row];
  for (let exp = 0; exp < 4; ++exp) {
    row1 = row1.concat(row.map((rv) => ((rv + exp) % 9) + 1));
  }
  dbg(row1.length);
  return row1;
});
let contents2 = [...contents1];
for (let exp = 0; exp < 4; ++exp) {
  contents2 = contents2.concat(
    contents1.map((cv) => {
      return cv.map((cr) => {
        return ((cr + exp) % 9) + 1;
      });
    })
  );
}

contents = contents2;
open.clear();
closed.clear();
bfs(contents, sp);
dbg(ep);
ep = [contents.length - 1, contents[0].length - 1];
dbg(ep);
dbg(contents[0].join(""));
dbg(_.last(contents).join(""));
answer(2, closed.get(ep));
