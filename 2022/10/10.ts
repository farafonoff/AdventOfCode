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

function vadd(v1, v2) {
  return v1.map((vc, vn) => vc + v2[vn]);
}

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => s.split(" ").map(trnum));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let state = [1, 1];
let logs = [];
logs.push(state);
contents.forEach((line) => {
  switch (line[0]) {
    case "noop":
      state = vadd(state, [1, 0]);
      logs.push(state);
      break;
    case "addx":
      state = vadd(state, [1, 0]);
      logs.push(state);
      state = vadd(state, [1, line[1]]);
      logs.push(state);
      break;
  }
});

let ss = 0;
for (let i = 19; i < logs.length; i += 40) {
  ss += logs[i][1] * logs[i][0];
}

answer(1, ss);

let line = [];
let LL = 40;
logs.forEach((ll) => {
  let sp = ll[1];
  let rp = (ll[0] - 1) % LL;
  if (rp >= sp - 1 && rp <= sp + 1) {
    line.push("\u2588");
  } else {
    line.push("\u00A0");
  }
  if (rp === LL - 1) {
    dbg(line.join(""));
    line = [];
  }
});
