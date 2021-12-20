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
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let tmpl = contents[0];
let rest = contents.slice(1);
dbg(tmpl);
let key = tmpl.split("").map((ch) => (ch === "#" ? 1 : 0));
dbg(rest);
let icols = rest[0].length;
let irows = rest.length;
let lit = new HM();
rest.forEach((row, ridx) =>
  row.split("").forEach((val, cidx) => {
    if (val === "#") {
      lit.set([ridx, cidx], 1);
    } else {
      lit.set([ridx, cidx], 0);
    }
  })
);
let queries = [2, 50];
for (let step = 0; step < 50; ++step) {
  let exp = (step + 1) * 3;
  let hack = key[0] === 1 && step % 2 === 1;
  let next = new HM();
  for (let i = -exp; i < icols + exp; ++i) {
    for (let j = -exp; j < irows + exp; ++j) {
      let strin = [];
      for (let di = -1; di <= 1; ++di) {
        for (let dj = -1; dj <= 1; ++dj) {
          let pixvalue = lit.get([i + di, j + dj]);
          if (pixvalue === undefined) {
            if (hack) {
              pixvalue = 1;
            } else {
              pixvalue = 0;
            }
          }
          strin.push(pixvalue);
        }
      }
      //dbg(strin);
      let num = parseInt(strin.join(""), 2);
      //dbg(key[num], strin.join(""));
      if (key[num] === 1) {
        next.set([i, j], 1);
      } else {
        next.set([i, j], 0);
      }
    }
  }
  lit = next;
  if (queries.includes(step + 1)) {
    answer(
      queries.indexOf(step + 1) + 1,
      lit.entries().filter((ev) => ev[1] === 1).length
    );
  }
  //dbg(lit.entries().filter((ev) => ev[1] === 1).length, "" + step);
}
