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
  .map((s) => s.split(" "));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let sc1 = {
  X: 1,
  Y: 2,
  Z: 3,
};
let sc2 = {
  A: {
    X: 3,
    Y: 6,
    Z: 0,
  },
  B: {
    X: 0,
    Y: 3,
    Z: 6,
  },
  C: {
    X: 6,
    Y: 0,
    Z: 3,
  },
};
let tsc = 0;
contents.forEach((line, ln) => {
  let rsc = sc1[line[1]] + sc2[line[0]][line[1]];
  //console.log(ln, rsc);
  tsc += rsc;
});
answer(1, tsc);

tsc = 0;
contents.forEach((line, ln) => {
  //let rsc = sc1[line[1]] + sc2[line[0]][line[1]];
  let o1;
  switch (line[1]) {
    case "X": {
      o1 = 0;
      break;
    }
    case "Y": {
      o1 = 3;
      break;
    }
    case "Z": {
      o1 = 6;
      break;
    }
  }
  let re = Object.entries(sc2[line[0]]).filter(([k, v]) => v === o1)[0];
  let rsc = sc1[re[0]] + sc2[line[0]][re[0]];
  tsc += rsc;
});
answer(2, tsc);
