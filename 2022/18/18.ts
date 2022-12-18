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
  .map((s) => s.split(",").map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let jointMap = [];
let map3d = [];
let LB = 100;
let UB = 0;
contents.forEach((cl) => {
  cl.forEach((cv) => {
    UB = Math.max(cv, UB);
    LB = Math.min(cv, LB);
  });
});
UB += 2;
LB -= 2;
for (let i = LB; i < UB; ++i) {
  for (let j = LB; j < UB; ++j) {
    for (let k = LB; k < UB; ++k) {
      _.set(map3d, [i, j, k], 0);
    }
  }
}
contents.forEach((line, idx1) => {
  _.set(map3d, line, 1);
});

let start = [0, 0, 0];

function vadd(v1, v2) {
  return v1.map((vc, vn) => vc + v2[vn]);
}
let sides = [
  [0, 0, 1],
  [0, 0, -1],
  [0, 1, 0],
  [0, -1, 0],
  [1, 0, 0],
  [-1, 0, 0],
];

let touchAir = 0;
for (let i = LB; i < UB; ++i) {
  for (let j = LB; j < UB; ++j) {
    for (let k = LB; k < UB; ++k) {
      let vl = _.get(map3d, [i, j, k]);
      if (vl === 1) {
        sides.forEach((sv) => {
          let adj = vadd([i, j, k], sv);
          if (_.get(map3d, adj) === 0) {
            ++touchAir;
          }
        });
      }
    }
  }
}

let wave = [start];
while (wave.length) {
  let nextWave = new HM();
  wave.forEach((wp) => {
    _.set(map3d, wp, 2);
    sides.forEach((side) => {
      let nb = vadd(wp, side);
      if (_.get(map3d, nb) === 0) {
        nextWave.set(nb, 1);
      }
    });
  });
  wave = nextWave.keys() as any;
}
/*async function dfsFill(start) {
  sides.forEach(async (side) => {
    let next = vadd(start, side);
    if (_.get(map3d, next) === 0) {
      _.set(map3d, next, 2);
      await dfsFill(next);
    }
  });
}
dfsFill([0, 0, 0]).then(() => {});
*/
let touchWater = 0;
for (let i = LB; i < UB; ++i) {
  for (let j = LB; j < UB; ++j) {
    for (let k = LB; k < UB; ++k) {
      let vl = _.get(map3d, [i, j, k]);
      if (vl === 1) {
        sides.forEach((sv) => {
          let adj = vadd([i, j, k], sv);
          if (_.get(map3d, adj) === 2) {
            ++touchWater;
          }
        });
      }
    }
  }
}
answer(1, touchAir);
answer(2, touchWater);
