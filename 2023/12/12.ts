import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
import Parallel from "paralleljs"
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
let puzzle = [];
contents.forEach((line) => {
  let [chars, arra] = line.split(' ')
  let tchars = chars.split('')
  let tmap = arra.split(',').map(Number)
  puzzle.push([tchars, tmap])
});

let matchez = (seq: string[], map: number[]) => {
  dbg([seq.join(''), map.join(',')])
  if (seq.length === 0 && map.length === 0) {
    return 1;
  }
  if (map.length === 0)  {
    if (seq.indexOf('#')!== -1) {
      return 0;
    }
    return 1;
  }
  let fi = seq.findIndex(ch => ch!== '.')
  if (fi === -1) {
    if (map.length) return 0;
    return 1;
  }
  if (seq[fi] === '#') {
    dbg([map[0]+fi,seq.length])
    if (map[0]+fi > seq.length) return 0;
    let ss = seq.slice(fi, fi+map[0])
    let zi = ss.indexOf('.')
    let term = seq[fi+map[0]]
    dbg([ss.join(''), zi, term])
    if (!(zi === -1 && [undefined, '.', '?'].includes(term))) {
      dbg('NO MATCH')
      return 0;
    }
    return matchez(seq.slice(fi+map[0]+1), map.slice(1))
  } else
  if (seq[fi] === '?') {
    let dup = [...(seq.slice(fi))];
    dup[0] = '#';
    let ass = matchez(dup, map)
    let ads = matchez(dup.slice(1), map)
    return ass + ads;
  }
  dbg(seq[fi], 'HZ')
}
matchez = cached(matchez)
let sols;
sols = [];
puzzle.forEach(pz => {
  let sa = matchez(pz[0], pz[1]);
  sols.push(sa)
})
dbg(sols)
answer(1, sols.reduce((a,b) => a+b))

function expand(arr, joiner) {
  let result = [];
  for(let i=0;i<5;++i) {
    if (i>0 && joiner) {
      result.push(joiner)
    }
    result = [...result, ...arr]
  }
  return result;
}
dbg('PUZZLE2')
DEBUG = false;
let puzzle2: any[] = puzzle.map(pz => {
  return [expand(pz[0],'?'), expand(pz[1], false)]
})
dbg(puzzle2)
sols = [];

sols = puzzle2.map((pz, pi) => {
  let sa = matchez(pz[0], pz[1]);
  return sa;
})
dbg(sols)
answer(2, sols.reduce((a,b) => a+b))