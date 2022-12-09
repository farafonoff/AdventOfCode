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

let dvs = {
  U: [0, 1],
  D: [0, -1],
  R: [1, 0],
  L: [-1, 0],
};

function track2(N) {
  let simt = (tp, hp) => {
    let dc1 = hp[0] - tp[0];
    let dc2 = hp[1] - tp[1];
    if (Math.abs(dc1) > 1 && dc2 === 0) {
      let sg = Math.sign(dc1);
      tp[0] += sg;
    } else if (Math.abs(dc2) > 1 && dc1 === 0) {
      let sg = Math.sign(dc2);
      tp[1] += sg;
    } else if (Math.abs(dc1) > 1 || Math.abs(dc2) > 1) {
      let sg1 = Math.sign(dc1);
      let sg2 = Math.sign(dc2);
      tp = vadd(tp, [sg1, sg2]);
    }
    return tp;
  };
  let rope = [];
  let mv = (d) => {
    let nv = vadd(rope[0], dvs[d]);
    rope[0] = nv;
    for (let ri = 1; ri < N; ++ri) {
      let tp = simt(rope[ri], rope[ri - 1]);
      rope[ri] = tp;
    }
  };
  for (let i = 0; i < N; ++i) {
    rope.push([0, 0]);
  }
  let EN = N - 1;
  let tplog = new HM();
  tplog.set(rope[EN], 1);
  contents.forEach((line) => {
    for (let i = 0; i < line[1]; ++i) {
      mv(line[0]);
      tplog.set(rope[EN], 1);
    }
  });
  return tplog.count();
}

//track2(2);
answer(1, track2(2));
answer(2, track2(10));
