import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
import { textSpanOverlap } from "typescript";
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

let rocks = ["####", ".#.|###|.#.", "..#|..#|###", "#|#|#|#", "##|##"];
let loopBlocks = 0;
const LOOP = rocks.length;
rocks.forEach((rock) => {
  [...rock].forEach((rch) => (loopBlocks += rch === "#" ? 1 : 0));
});
var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let tower = [];
let width = 7;
const TOP = 3;
const LEFT = 2;
let rock = 0;
let top = 0;
let jet = 0;
let left = 2;

for (let i = 0; i < 50; ++i) {
  for (let j = 0; j < width; ++j) {
    _.set(tower, [i, j], ".");
  }
}
for (let j = 0; j < width; ++j) {
  _.set(tower, [0, j], "=");
}
++top;
function checkFig(rp, topv, left) {
  let rest = false;
  if (!rest) {
    rp.forEach((rr, ri) => {
      let fv = [...rr];
      fv.forEach((rch, ri2) => {
        if (rch === "#") {
          if (_.get(tower, [topv + ri, left + ri2], ".") !== ".") {
            rest = true;
          }
        }
      });
    });
  }
  return !rest;
}
function simfall(jetz) {
  let oldtop = top;
  let rp = rocks[rock].split("|").reverse();
  left = 2;
  let cols = rp[0].length;
  let topv = top + TOP;
  let rest: boolean = false;
  dbg([topv, left, rp], "start");
  while (!rest) {
    let jetv = jetz[jet];
    let moved = false;
    switch (jetv) {
      case ">": {
        if (left + cols < width && checkFig(rp, topv, left + 1)) {
          ++left;
          moved = true;
        }
        break;
      }
      case "<": {
        if (left > 0 && checkFig(rp, topv, left - 1)) {
          --left;
          moved = true;
        }
        break;
      }
    }
    ++jet;
    jet = jet % jetz.length;
    if (checkFig(rp, topv - 1, left)) {
      --topv;
    } else {
      rest = true;
    }
    dbg([jetv, rest, topv, left, moved]);
  }
  dbg([topv, left]);
  rp.forEach((rr, ri) => {
    let fv = [...rr];
    fv.forEach((rch, ri2) => {
      if (rch === "#") {
        _.set(tower, [topv + ri, left + ri2], "#");
      }
    });
  });
  top = Math.max(topv + rp.length, oldtop);
  ++rock;
  rock = rock % rocks.length;
  return top;
}

function dbgCup(lns = 5) {
  for (let i = 0; i < lns; ++i) {
    let row = [];
    for (let ch = 0; ch < width; ++ch) {
      row.push(_.get(tower, [lns - i - 1, ch], "."));
    }
    dbg(row.join(""));
  }
}
DEBUG = false;

let heights = [];
let LAST_ITERATION;
contents.forEach((line) => {
  let jets = line.split("");
  let i = 0;
  for (; i < 2022; ++i) {
    simfall(jets);
    heights.push(top);
    //dbgCup(top + 1);
  }
  answer(1, top - 1);
  for (; i < 10000; ++i) {
    simfall(jets);
    heights.push(top);
    //dbgCup(top + 1);
  }
  LAST_ITERATION = i;
});

/*DEBUG = true;
dbgCup(top + 1);
*/
function fillCup(lns = top) {
  for (let i = 0; i < lns; ++i) {
    let row = [];
    for (let ch = 0; ch < width; ++ch) {
      row.push(_.get(tower, [lns - i - 1, ch], "."));
    }
    tower[lns - i - 1] = row;
  }
}
fillCup();
DEBUG = false;
dbg("simulate done");
//dbgCup(top);
let foundPeriod;
try {
  for (let offset = 1; offset < top; ++offset) {
    for (let period = 2; period < top; ++period) {
      let subarr = tower.slice(offset, offset + period);
      let match = true;
      for (let rept = 1; rept < 5; ++rept) {
        let subarr2 = tower.slice(
          offset + period * rept,
          offset + period * rept + period
        );
        if (!_.isEqual(subarr, subarr2)) {
          match = false;
          break;
        }
      }
      if (match === true) {
        dbg([offset, period], "PERIOD");
        let blocks = 0;
        subarr.forEach((srow) => {
          srow.forEach((rch) => {
            blocks += rch === "#" ? 1 : 0;
          });
        });
        let offsetArr = tower.slice(1, offset);
        let offsetBlocks = 0;
        offsetArr.forEach((srow) => {
          srow.forEach((rch) => {
            offsetBlocks += rch === "#" ? 1 : 0;
          });
        });
        throw {
          offset,
          period,
          blocks,
          loopBlocks,
          loopsInLoop: blocks / loopBlocks,
          loopsInOffset: offsetBlocks / loopBlocks,
        };
      }
    }
  }
} catch (fv) {
  foundPeriod = fv;
}

dbg(foundPeriod);
let SOME_BIG_ROW = 5000;

let check_heights = [
  heights[SOME_BIG_ROW],
  heights[SOME_BIG_ROW + foundPeriod.loopsInLoop * LOOP],
  heights[SOME_BIG_ROW + foundPeriod.loopsInLoop * 2 * LOOP],
];

dbg([check_heights[2] - check_heights[1], check_heights[1] - check_heights[0]]);

let REALLY_BIG_NUMBER = 1000000000000;
let rocksLoop = foundPeriod.loopsInLoop * LOOP;
let loopIncrement = check_heights[1] - check_heights[0];
let diff = REALLY_BIG_NUMBER - LAST_ITERATION;
let skipLoops = Math.floor(diff / rocksLoop);
let remainder = diff % rocksLoop;
let jets = contents[0].split("");
for (let i = 0; i < remainder; ++i) {
  simfall(jets);
}
let result = top + skipLoops * loopIncrement;
answer(2, result - 1);
