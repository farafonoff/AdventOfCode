import * as fs from "fs";
import HashMap from "hashmap";
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
let DEBUG = false;

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
let map = [];
contents.forEach((line) => {
  //console.log(line.split(''));
  map.push(line.split('').map(trnum));
});

let used = new HashMap();
let ans1 = 0;
map.forEach((line, li) => {
  line.forEach((vl, ci) => {
    if (isNaN(vl) && vl !== '.') {
      for(let i=-1;i<=1;++i) {
        for(let j=-1;j<=1;++j) {
          if (used.has([li+i, ci+j])) {
            continue;
          }
          let ns = ci+j;
          let ne = ci+j;
          while (isFinite(_.get(map, [li+i, ns]))) {
            --ns;
          }
          while (isFinite(_.get(map, [li+i, ne]))) {
            ++ne;
          }
          if (ne - ns > 0) {
            ++ns;
            --ne;
            let num = 0;
            for(let v = ns; v<=ne;++v) {
              used.set([li+i, v], true);
              num *=10; num += _.get(map, [li+i, v]);
            }
            dbg(num);
            ans1+=num;
          }
        }
      }
    }
  })
})

answer(1, ans1);

let ans2 = 0;
map.forEach((line, li) => {
  line.forEach((vl, ci) => {
    if (isNaN(vl) && vl !== '.') {
      let used = new HashMap();
      let adjanced = [];
      for(let i=-1;i<=1;++i) {
        for(let j=-1;j<=1;++j) {
          if (used.has([li+i, ci+j])) {
            continue;
          }
          let ns = ci+j;
          let ne = ci+j;
          while (isFinite(_.get(map, [li+i, ns]))) {
            --ns;
          }
          while (isFinite(_.get(map, [li+i, ne]))) {
            ++ne;
          }
          if (ne - ns > 0) {
            ++ns;
            --ne;
            let num = 0;
            for(let v = ns; v<=ne;++v) {
              used.set([li+i, v], true);
              num *=10; num += _.get(map, [li+i, v]);
            }
            adjanced.push(num)
          }
        }
      }
      dbg([vl, adjanced])
      if (vl === '*' && adjanced.length === 2) {
        ans2 += adjanced[0]*adjanced[1];
      }
    }
  })
})

answer(2, ans2);