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
let map = []
let sp = []
contents.forEach((line, li) => {
  let ll = line.split('')
  map.push(ll)
  if (ll.indexOf('S')!==-1) {
    sp = [li, ll.indexOf('S')]
  }
});
_.set(map, sp, '.')

const up = ([a,b]) => [a-1, b];
const down = ([a,b]) => [a+1, b];
const left = ([a,b]) => [a, b-1];
const right = ([a,b]) => [a, b+1];
const dirs = [up, down, left, right]

let SCALE = 3

function dd(map, points) {
  map.forEach((row, ri) => {
    dbg(row.map((col, ci) => points.has([ri, ci])?'O':col).join(''))
  })
}

function dd2(map, points) {
  let am = []
  for(let i=-SCALE;i<=SCALE;++i) {
    for(let j=-SCALE;j<=SCALE;++j) {
      let sum = 0;
      map.forEach((row, ri) => {
        let op = row.map((col, ci) => points.has([ri+map.length*i, ci+row.length*j])?'O':col)
        let ocount = op.filter(v => v==='O').length;
        sum += ocount;
        dbg(op.join(''))
      })
      _.set(am, [i+SCALE, j+SCALE], sum)
    }
  }
  return am;
}

function solve(map, steps, sp) {
  let anset = new HM();
  anset.set(sp, 0);
  for(let i=0;i<steps;++i) {
    let plist = anset.keys();
    let newset = new HM();
    plist.forEach((poi: any) => {
      let steps = dirs.map(d => d(poi)).filter(p => _.get(map, p) === '.')
      steps.forEach(st => newset.set(st, i))
    })
    anset = newset;
    //dd(map,anset)
  }
  return anset.count();
}

let loopget = (map, point) => {
  let [r,c] = point;
  let rows = map.length;
  let cols = map[0].length;
  r = (r%rows +rows)%rows;
  c = (c%cols + cols)%cols;
  return _.get(map, [r, c])
}

function solve2(map, steps, sp) {
  let lsp = [sp[0], sp[1]+map[0].length];
  let usp = [sp[0]+map.length, sp[1]];
  let anset = new HM();
  anset.set(sp, 0);
  let maxdist = 0;
  let [u, l] = [Infinity, Infinity];
  for(let i=0;i<steps;++i) {
    let plist = anset.keys();
    let newset = new HM();
    plist.forEach((poi: any) => {
      let steps = dirs.map(d => d(poi)).filter(p => loopget(map, p) === '.')
      steps.forEach(st => newset.set(st, i))
    })
    anset = newset;
    anset.keys().forEach(np => {
      let md = Math.abs(np[0]-sp[0])+Math.abs(np[1]-sp[1])
      if (md > maxdist) maxdist = md;
    })
    if (anset.has(usp)) u = Math.min(u, i)
    if (anset.has(lsp)) l = Math.min(l, i)
    //dd(map,anset)
  }
  let sums = dd2(map,anset)
  return [anset.count(), sums];
}

let rowsumsE = map.map(row => row.reduce((a,b, pi) => pi%2===0?((b === '#')?a:a+1):a, 0))
let rowsumsO = map.map(row => row.reduce((a,b, pi) => pi%2===1?((b === '#')?a:a+1):a, 0))

let calc2 = (map, steps, sp) => {
  let ans = 0;
  for(let i=-steps;i<=steps;++i) {
    let rans = 0;
    let aside = (steps - Math.abs(i))
    let width = aside*2+1
    let hw = Math.floor(width/2)
    let fulls = Math.floor(width/map[0].length);
    let parts = width % map[0].length
    let halfpart = Math.floor(parts/2)
    let rowno = ((i+sp[0])%map.length+map.length)%map.length;
    if (fulls === 0) {
      // middle
      let mstart = sp[1]-hw;
      dbg([mstart, sp[1]+hw], 'MIDDLE')
      for(let c = mstart;c<=sp[1]+hw;++c) {
        if ((mstart-c)%2===0) {
          if (_.get(map,[rowno, c]) === '.') ++rans;
        }
      }
    } else {
      rans += fulls*(halfpart%2===0?rowsumsE:rowsumsO)[rowno];
      dbg([fulls, halfpart], 'FULLS+SIDES')
      let hpans1 = 0;
      for(let i=0;i<halfpart;++i) {
        if ((halfpart-i+1)%2===0) {
          if (_.get(map, [rowno, i])==='.') {
            ++hpans1;
          }
        }
      }
      rans += hpans1
      let iter = 0;
      let hpans2 = 0;
      for(let i=map[0].length-halfpart;i<map[0].length;++i) {
        if (iter%2===0) {
          if (_.get(map, [rowno, i])==='.') {
            ++hpans2;
          }
        }
        ++iter;
      }
      rans += hpans2
      dbg([hpans1, hpans2], 'SIDES')
    }
    dbg([rowno, hw, rans])
    ans+=rans;
  }
  return ans;
}
dbg(rowsumsE)
dbg(rowsumsO)

//answer(1, JSON.stringify(solve2(map, 65+(SCALE-1)*130+20, sp)))
//answer(2, calc2(map, 215, sp))

//answer(2, calc2(map, 26501365, sp))
//answer(1, solve(map, 64, sp))
//answer(1, solve(map, 64, sp))
answer(1, solve(map, 64, sp))

let TEST2 = 26501365
let remainder = TEST2%map.length;
let points: any[] = []
let px = [remainder,remainder+map.length,remainder+map.length*2]

px.forEach((pv, pi) => {
  let vl = solve2(map,pv, sp)[0]
  points.push([pi, vl])
})

// Rule for making a quadratic equation from three points for 0, 1 and 2.
let a = (points[0][1] - 2*points[1][1] + points[2][1]) / 2;
let b = (-3*points[0][1] + 4*points[1][1] - points[2][1]) / 2;
let c = points[0][1];
let n = Math.floor(TEST2 / map.length);

answer(2, a*n*n + b*n + c);