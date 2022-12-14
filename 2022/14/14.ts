import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
import { debuglog } from "util";
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

function vadd(v1, v2) {
  return v1.map((vc, vn) => vc + v2[vn]);
}

function answer(part, value) {
  console.log(`Answer ${part}: ${value}`);
}

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) =>
    s.split(" -> ").map((sg) => sg.split(",").map((v) => trnum(v) as number))
  );
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let MXX = 0,
  MXY = 0;
let MNY = 0,
  MNX = Infinity;
let CAVE = [];
contents.forEach((line) => {
  let pv = null;
  line.forEach(([x, y]) => {
    MXX = Math.max(x, MXX);
    MXY = Math.max(y, MXY);
    MNX = Math.min(x, MNX);
    MNY = Math.min(y, MNY);
    if (pv) {
      let sx = Math.min(pv[0], x);
      let ex = Math.max(pv[0], x);
      for (let ix = sx; ix <= ex; ++ix) {
        let sy = Math.min(pv[1], y);
        let ey = Math.max(pv[1], y);
        for (let iy = sy; iy <= ey; ++iy) {
          _.set(CAVE, [iy, ix], "#");
        }
      }
    }
    pv = [x, y];
  });
});
const SP = [0, 500];
_.set(CAVE, SP, "+");
for (let ix = MNX - 1; ix <= MXX + 1; ++ix) {
  for (let iy = MNY; iy <= MXY + 2; ++iy) {
    if (!_.get(CAVE, [iy, ix])) {
      _.set(CAVE, [iy, ix], ".");
    }
  }
}
let ABYSS = MXY + 1;

function dlog() {
  if (!DEBUG) return;
  CAVE.forEach((cl) => {
    dbg(cl.join(""));
  });
}

function fall(part = 1) {
  let cv = SP;
  while (true) {
    let dv = vadd(cv, [1, 0]);
    let lv = vadd(cv, [1, -1]);
    let rv = vadd(cv, [1, 1]);
    if (part === 1) {
      if (cv[0] === ABYSS) return false;
    }
    if (part === 2) {
      if (cv[0] === ABYSS) break;
    }
    if (_.get(CAVE, dv, ".") === ".") {
      cv = dv;
    } else if (_.get(CAVE, lv, ".") === ".") {
      cv = lv;
    } else if (_.get(CAVE, rv, ".") === ".") {
      cv = rv;
    } else {
      break;
    }
  }
  if (_.isEqual(SP, cv)) {
    return false;
  }
  _.set(CAVE, cv, "o");
  return true;
}

let done = false;
let i = 0;
for (i = 0; !done; ++i) {
  done = !fall(1);
}

answer(1, i - 1);
done = false;
for (; !done; ++i) {
  done = !fall(2);
}
answer(2, i - 1);
