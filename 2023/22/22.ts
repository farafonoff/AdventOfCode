import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
const infile = process.argv[2] || "input";

function cached<T extends Function>(fn: T): T {
  const cache = new HM();
  function inner() {
    let key = [...arguments];
    if (cache.has(key)) {
      return cache.get(key)
    }
    let res = fn(...arguments)
    cache.set(key, res)
    return res;
  }
  return inner as any;
}

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
let bricks = []
//let [maxx, maxy]=[0,0];
let ltA = 'A'
contents.forEach((line, li) => {
  let cords: any[] = line.split('~').map(cub => cub.split(',').map(Number))
  cords.sort((c1, c2) => c1[0]!==c2[0]?c1[0]-c2[0]:c1[1]!==c2[1]?c1[1]-c2[1]:c1[2]!==c2[2]?c1[2]-c2[2]:0)
  cords[2] = String.fromCharCode(ltA.charCodeAt(0)+li)
  bricks.push(cords)
});
function simFall(bricks) {
  let pileTop = [];
  let pileTopSnapshot = new HM();
  let fallen = 0;
  let fall = _.cloneDeep(bricks);
  fall.sort((b1, b2) => b1[0][2] - b2[0][2])
  let underlying = []

  fall.forEach((brick, bi) => {
    let lowZ = 0;
    for (let xc = brick[0][0]; xc <= brick[1][0]; ++xc) {
      for (let yc = brick[0][1]; yc <= brick[1][1]; ++yc) {
        let top = _.get(pileTop, [xc, yc], 0)
        lowZ = Math.max(lowZ, top)
      }
    }
    let newZBot = lowZ + 1;
    let newZTop = newZBot + brick[1][2] - brick[0][2];

    if (newZBot < brick[0][2]) fallen++;
    brick[0][2] = newZBot;
    brick[1][2] = newZTop;

    let underBricks = new HM();
    for (let xc = brick[0][0]; xc <= brick[1][0]; ++xc) {
      for (let yc = brick[0][1]; yc <= brick[1][1]; ++yc) {
        if (pileTopSnapshot.has([xc, yc])) {
          let proj = pileTopSnapshot.get([xc, yc])
          if (proj[0] === lowZ) underBricks.set(proj[1], proj);
        }
      }
    }

    for (let xc = brick[0][0]; xc <= brick[1][0]; ++xc) {
      for (let yc = brick[0][1]; yc <= brick[1][1]; ++yc) {
        _.set(pileTop, [xc, yc], newZTop)
        pileTopSnapshot.set([xc, yc], [newZTop, bi, brick[2]])
      }
    }
    underlying[bi] = underBricks.values();
  })
  return [underlying, fallen, fall]
}

let [underlying, fallen, newPile] = simFall(bricks)

let whoFall = new HM<number, number[]>()
underlying.forEach((undr, ui) => {
  if (undr.length === 1) {
    let falls: any[] = (whoFall.get(undr[0][1]) || [])
    falls.push(ui)
    whoFall.set(undr[0][1], falls)
  }
})
let desi = 0;
underlying.forEach((undr, ui) => {
  let falls = whoFall.get(ui)
  if (!falls) {
    ++desi;
  }
})

answer(1, desi);
let ans2 = 0;
for(let bri = 0;bri<bricks.length;++bri) {
  let backup = [...newPile];
  let pileWithoutOne = newPile.splice(bri, 1)
  let [underlying2, fallen2, newPile2] = simFall(newPile)
  ans2 += fallen2;
  newPile = backup;
}
answer(2, ans2);