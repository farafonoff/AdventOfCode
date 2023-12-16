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
let map = []
contents.forEach((line) => {
  map.push(line.split(''))
});

function solve(initialization) {

  let rayMap = new HM();

  function md(sp, dd) {
    let [r, c] = sp;
    switch (dd) {
      case 'R': return [r, c + 1]
      case 'L': return [r, c - 1]
      case 'U': return [r - 1, c]
      case 'D': return [r + 1, c]
    }
  }

  function raysim(ray) {
    if (rayMap.has(ray)) {
      return [];
    }
    rayMap.set(ray, 1);
    let odir = ray[1];
    let op = ray[0]
    let itm = _.get(map, op)
    let nextdir = odir;
    let result = [];
    dbg([op, odir])
    switch (itm) {
      case '\\': {
        switch (odir) {
          case 'R': nextdir = 'D'; break;
          case 'L': nextdir = 'U'; break;
          case 'U': nextdir = 'L'; break;
          case 'D': nextdir = 'R'; break;
        }
        result.push([md(op, nextdir), nextdir])
        break;
      }
      case '/': {
        switch (odir) {
          case 'R': nextdir = 'U'; break;
          case 'L': nextdir = 'D'; break;
          case 'U': nextdir = 'R'; break;
          case 'D': nextdir = 'L'; break;
        }
        result.push([md(op, nextdir), nextdir])
        break;
      }
      case '-': {
        if (['U', 'D'].includes(odir)) {
          result.push([md(op, 'R'), 'R'])
          result.push([md(op, 'L'), 'L'])
        } else {
          result.push([md(op, odir), odir])
        }
        break;
      }
      case '|': {
        if (['R', 'L'].includes(odir)) {
          result.push([md(op, 'U'), 'U'])
          result.push([md(op, 'D'), 'D'])
        } else {
          result.push([md(op, odir), odir])
        }
        break;
      }
      case '.': {
        result.push([md(op, odir), odir])
        break;
      }
    }
    return result;
  }

  let rays = [initialization];

  while (rays.length !== 0) {
    rays = _.flatten(rays.map(raysim))
    //dbg(rays)
  }

  let ejCells = new HM();

  let goodKeys = rayMap.keys().filter((key: any) => {
    let [[r, c], d] = key;
    if (r < 0 || r >= map.length || c < 0 || c >= map[0].length) return false;
    ejCells.set([r, c], 1)
    return true;
  })
  return ejCells.count()
}
DEBUG = false;

answer(1, solve([[0, 0], 'R']))

let ans2 = 0;

for(let i=0;i<map[0].length;++i) {
  let td = solve([[0, i], 'D'])
  let tu = solve([[map.length-1, i], 'U'])
  ans2 = Math.max(ans2, tu, td);
}

for(let i=0;i<map.length;++i) {
  let td = solve([[i, 0], 'R'])
  let tu = solve([[i, map[0].length - 1], 'L'])
  ans2 = Math.max(ans2, tu, td);
}

answer(2, ans2)