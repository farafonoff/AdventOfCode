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
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let path = [];
let tree = {};
contents.forEach((line) => {
  if (line.startsWith("$")) {
    let cmd = line.split(" ");
    switch (cmd[1]) {
      case "cd": {
        if (cmd[2] === "..") {
          path.shift();
        } else {
          if (cmd[2] === "/") {
            path = [];
          } else {
            path.unshift(cmd[2]);
          }
        }
        break;
      }
      case "ls": {
        break;
      }
    }
  } else {
    let le = line.split(" ");
    let cp = _.reverse([...path]);
    if (le[0] === "dir") {
      if (!_.get(tree, cp)) {
        _.set(tree, cp, {});
      }
      //
    } else {
      let fsize = trnum(le[0]);
      _.set(tree, [...cp, le[1]], fsize);
    }
  }
});

function s1(tre) {
  let ans1 = 0;
  let ds = (tr) => {
    let siz = 0;
    _.keys(tr).forEach((key) => {
      let vl = tr[key];
      if (_.isObject(vl)) {
        siz += ds(vl);
      } else {
        siz += vl;
      }
    });
    if (siz < 100000) {
      ans1 += siz;
    }
    return siz;
  };
  let ts = ds(tre);
  answer(1, ans1);
  return ts;
}
//dbg(tree);
let ts = s1(tree);
const TOT = 70000000;
const NED = 30000000;
let fr = TOT - ts;
let ned = NED - fr;
function s2(tre, need) {
  let ans2 = Infinity;
  let ds = (tr) => {
    let siz = 0;
    _.keys(tr).forEach((key) => {
      let vl = tr[key];
      if (_.isObject(vl)) {
        siz += ds(vl);
      } else {
        siz += vl;
      }
    });
    if (siz > ned) {
      ans2 = Math.min(ans2, siz);
    }
    return siz;
  };
  let ts = ds(tre);
  answer(2, ans2);
  return ts;
}

s2(tree, ned);
