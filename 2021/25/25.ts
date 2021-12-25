import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { isNumber } from "lodash";
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
  .filter((s) => s.length > 0)
  .map((s) => s.split(""));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
contents.forEach((line) => {
  console.log(line);
});
let size = {
  r: contents.length,
  c: contents[0].length,
};

function ppr(field) {
  return dbg(field.map((r) => r.join("")).join("\n"));
}

function next(ch, ridx, cidx) {
  if (ch === ">") {
    if (cidx < size.c - 1) {
      return [ridx, cidx + 1];
    } else {
      return [ridx, 0];
    }
  }
  if (ch === "v") {
    if (ridx < size.r - 1) {
      return [ridx + 1, cidx];
    } else {
      return [0, cidx];
    }
  }
}

function simstep(field, phase) {
  let movers = [];
  field.forEach((row, ridx) => {
    row.forEach((col, cidx) => {
      if (col === phase) {
        let cord = next(col, ridx, cidx);
        let free = _.get(field, cord) === ".";
        if (free) {
          movers.push([[ridx, cidx], cord]);
        }
      }
    });
  });
  if (movers.length === 0) return false;
  movers.forEach((mover) => {
    let ch = _.get(field, mover[0]);
    let tt = _.get(field, mover[1]);
    if (tt === ".") {
      _.set(field, mover[0], ".");
      _.set(field, mover[1], ch);
    }
  });
  return true;
}
let step = 0;
while (true) {
  ++step;
  dbg(step);
  let moved = simstep(contents, ">");
  let moved1 = simstep(contents, "v");
  ppr(contents);
  if (!(moved || moved1)) {
    answer(1, step);
    break;
  }
  //break;
}
