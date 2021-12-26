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
  .filter((s) => s.length > 0)
  .map((s) => s.split(""));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
class State {
  point: number[];
  cost: number;
}
function djk(sp, ep) {
  let closed = new HM<number[], number>();
  let open = new PQ<State>({ comparator: (a, b) => a.cost - b.cost });
  let sstate: State = { point: sp, cost: 0 };
  open.queue(sstate);
  while (open.length > 0) {
    let state = open.dequeue();
    if (closed.has(state.point)) {
      continue;
    }
    closed.set(state.point, state.cost);
    for (let dr = -1; dr <= 1; ++dr) {
      for (let dc = -2; dc <= 2; ++dc) {
        //if (dr === 0 && dc === 0) continue;
        if ((dr === 0) === (dc === 0)) continue;
        let npoint = [state.point[0] + dr, state.point[1] + dc];
        let nval = _.get(contents, npoint);
        //dbg([state, npoint, nval]);
        if (nval === "." || nval === "B") {
          open.queue({ point: npoint, cost: state.cost + 1 });
        }
      }
    }
  }
  return closed.get(ep);
}

let sp, ep;
contents.forEach((row, ri) => {
  row.forEach((col, ci) => {
    if (col === "A") sp = [ri, ci];
    if (col === "B") ep = [ri, ci];
  });
});

answer(1, djk(sp, ep));
