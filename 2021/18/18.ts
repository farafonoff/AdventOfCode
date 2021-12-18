import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { isArray } from "lodash";
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
    console.log(JSON.stringify(expression));
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
  .map((ll) => JSON.parse(ll));
dbg(contents);

function fillFirst(sn, value) {
  if (!isArray(sn)) return value + sn;
  if (isArray(sn[0])) {
    sn[0] = fillFirst(sn[0], value);
  } else {
    sn[0] = sn[0] + value;
  }
  return sn;
}
function fillLast(sn, value) {
  if (!isArray(sn)) return value + sn;
  if (isArray(sn[1])) {
    sn[1] = fillLast(sn[1], value);
  } else {
    sn[1] = sn[1] + value;
  }
  return sn;
}

function split(sn) {
  sn.forEach((tt, idx) => {
    if (isArray(tt)) {
      split(tt);
    } else {
      if (tt >= 10) {
        sn[idx] = [Math.floor(tt / 2), Math.ceil(tt / 2)];
        throw "done";
      }
    }
  });
}

function explode(sn, depth) {
  dbg(sn);
  if (depth >= 4) {
    throw [
      [0, sn[0]],
      [1, sn[1]],
    ];
  }
  sn.forEach((node, idx) => {
    try {
      if (isArray(node)) {
        explode(node, depth + 1);
      }
    } catch (expl) {
      dbg(expl, "EXPL");
      if (expl.length === 2) {
        sn[idx] = 0;
      }
      expl = expl.filter((explo) => {
        if (idx === 0 && explo[0] === 1) {
          sn[1] = fillFirst(sn[1], explo[1]);
          return false;
        }
        if (idx === 1 && explo[0] === 0) {
          sn[0] = fillLast(sn[0], explo[1]);
          return false;
        }
        return true;
      });
      throw expl;
    }
  });
  return sn;
}
function tryExplode(sn) {
  let dv = sn;
  try {
    explode(dv, 0);
  } catch (leftover) {}
  return dv;
}

function trySplit(sn) {
  let dv = sn;
  try {
    split(dv);
  } catch (leftover) {}
  return dv;
}
DEBUG = false;
dbg(tryExplode([[[[[9, 8], 1], 2], 3], 4]));
dbg(tryExplode([7, [6, [5, [4, [3, 2]]]]]));
dbg(
  tryExplode([
    [3, [2, [1, [7, 3]]]],
    [6, [5, [4, [3, 2]]]],
  ])
);
function loopWhileChange(fn, val) {
  let fval = _.cloneDeep(val);
  do {
    val = fval;
    fval = _.cloneDeep(val);
    fval = fn(fval);
  } while (!_.isEqual(fval, val));
  return fval;
}
function add(sn1, sn2) {
  let result = _.cloneDeep([sn1, sn2]);
  return loopWhileChange((fresult) => {
    fresult = loopWhileChange(tryExplode, fresult);
    fresult = trySplit(fresult);
    return fresult;
  }, result);
  //explode
}
DEBUG = false;
let cb = _.cloneDeep(contents);
let ans = contents.reduce((pv, cv) => add(pv, cv));
function magn(sn) {
  if (!isArray(sn)) return sn;
  return 3 * magn(sn[0]) + 2 * magn(sn[1]);
}
// dbg(ans);
answer(1, magn(ans));
let maxMag = 0;
contents = cb;
contents.forEach((sn1) => {
  contents.forEach((sn2) => {
    let pv = magn(add(sn1, sn2));
    if (pv > maxMag) maxMag = pv;
  });
});
answer(2, maxMag);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
