import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { add } from "lodash";
const infile = process.argv[2] || "input";

function cached<T extends Function>(fn: T): T {
  const cache = new HM();
  function inner() {
    let key = [...arguments];
    if (cache.has(key)) {
      return cache.get(key);
    }
    let res = fn(...arguments);
    cache.set(key, res);
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

const up = ([a, b]) => [a - 1, b];
const down = ([a, b]) => [a + 1, b];
const left = ([a, b]) => [a, b - 1];
const right = ([a, b]) => [a, b + 1];
const dirs = [up, down, left, right];

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

function bfs(
  map,
  sp,
  ep
): [
  number,
  HM<[number, number], number>,
  HM<[number, number], [number, number]>
] {
  let q = new PQ<any>({ comparator: (a, b) => a[0] - b[0] });
  let resMap = new HM<any, any>();
  let prevMap = new HM<any, any>();
  q.queue([0, sp, null]);
  while (q.length > 0) {
    let [score, pos, opos] = q.dequeue();
    //console.log({score, pos, opos})
    if (resMap.has(pos)) {
      continue;
    }
    resMap.set(pos, score);
    prevMap.set(pos, opos);
    if (_.isEqual(pos, ep)) {
      return [score, resMap, prevMap];
    }
    let [r, c] = pos;
    dbg({ pos });
    let nexts = dirs
      .map((dirf) => dirf([r, c]))
      .filter((nextv) => _.get(map, nextv, null) !== null);
    dbg({ nexts });
    nexts.forEach((nv) => {
      let isHZ = nv[0] === pos[0];
      let addScore = isHZ ? 100 : 120;
      //console.log({pos, nv, isHZ, addScore})
      q.queue([score + addScore, nv, pos]);
    });
  }
  return [-1, null, null];
}

function btr(prevmap: HM<[number, number], [number, number]>, ep, sp) {
  let cv = ep;
  let seq = [];
  while (true) {
    let ncv = prevmap.get(cv);
    if (ncv === null) {
      break;
    }
    dbg({ cv, ncv });
    let dir = dirs.find((df) => _.isEqual(df(ncv), cv));
    let dirr;
    switch (dir.name) {
      case "up":
        dirr = "^";
        break;
      case "down":
        dirr = "v";
        break;
      case "left":
        dirr = "<";
        break;
      case "right":
        dirr = ">";
        break;
    }
    seq.unshift(dirr);
    cv = ncv;
  }
  return seq;
}

let arrows = [
  [null, "^", "A"],
  ["<", "v", ">"],
];

let digits = [
  [7, 8, 9],
  [4, 5, 6],
  [1, 2, 3],
  [null, 0, "A"],
];

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let codes = [];
let dcodes = [];
contents.forEach((line) => {
  let code = line.split("");
  codes.push(line.split("").map(trnum));
  dcodes.push(Number(code.slice(0, -1).join("")));
});

dbg(codes);
dbg(dcodes);

function FindKey(kbd, Key) {
  let akey = [];
  kbd.forEach((row, ri) => {
    row.forEach((col, ci) => {
      if (col === Key) {
        akey = [ri, ci];
      }
    });
  });
  return akey;
}

let sp_digits = FindKey(digits, 'A');
let sp_arrows = FindKey(arrows, 'A');
let hole_digits = FindKey(digits, null);
let hole_arrows = FindKey(arrows, null);

function Keys(kbd) {
  let res = new Set();
  kbd.forEach(k => {
    k.forEach(c => {
      if (c!== null) {
        res.add(c);
      }
    })
  });
  return res;
}

function permute<T>(arr: T[]): T[][] {
  if (arr.length === 0) return [[]];
  return arr.flatMap((item, i) =>
    permute([...arr.slice(0, i), ...arr.slice(i + 1)]).map((perm) => [item, ...perm])
  );
}


function findPath1(keyboard, sv, ev) {
  let sp = [];
  let ep = [];
  let hole = [];
  keyboard.forEach((row, ri) => {
    row.forEach((col, ci) => {
      if (col === sv) {
        sp = [ri, ci];
      }
      if (col === ev) {
        ep = [ri, ci];
      }
      if (col === null) {
        hole = [ri, ci];
      }
    });
  });
  let dc = sp[1] - ep[1];
  let dr = sp[0] - ep[0];
  let hz = [];
  let vr = [];
  let hch;
  let vch;
  if (dc < 0) hch = ">";
  else hch = "<";
  if (dr < 0) vch = "v";
  else vch = "^";
  dr = Math.abs(dr);
  dc = Math.abs(dc);
  for (let i = 0; i < dc; ++i) {
    hz.push(hch);
  }

  for (let i = 0; i < dr; ++i) {
    vr.push(vch);
  }
  function check(pth) {
    let ssp: any = sp;
    let good = true;
    pth.forEach((pc) => {
      switch (pc) {
        case "^":
          ssp = up(ssp);
          break;
        case "v":
          ssp = down(ssp);
          break;
        case "<":
          ssp = left(ssp);
          break;
        case ">":
          ssp = right(ssp);
          break;
      }
      if (_.get(keyboard, ssp, null) === null) {
        good = false;
      }
    });
    return good;
  }
  let pmts = _.uniqWith(permute([...hz, ...vr]), _.isEqual);
  let goods = pmts.filter(check)
  goods.sort((a, b) => a.length - b.length);
  return goods;
}

/*
function findPath(keyboard, sv, ev) {
  let sp = [];
  let ep = [];
  keyboard.forEach((row, ri) => {
    row.forEach((col, ci) => {
      if (col === sv) {
        sp = [ri, ci];
      }
      if (col === ev) {
        ep = [ri, ci];
      }
    });
  });
  dbg(sp);
  dbg(ep);
  let sol = bfs(keyboard, sp, ep);
  dbg(sol);
  dbg(sol[2].entries());
  let dirs = btr(sol[2], ep, sp);
  return dirs;
}

function solve(keyboard, seq: any[]) {
  DEBUG = false;
  let ckey = "A";
  let res = []
  seq.forEach((ch) => {
    dbg(`===== ${ch}`);
    let seqs = findPath1(keyboard, ckey, ch);
    let resn = []
    for(let seq of seqs) {
      seq = seqs[0];
      seq.push("A");
      //dbg(seq.join(""));
      for(let re of res) {
        resn.push([...re, ...seq])
      }
      if (res.length === 0) {
        resn = seqs;
      }
    }
    res = resn;
    ckey = ch;
    return seq;
  });
  DEBUG = true;
  console.log(res)
  return res;
}

function solve1(seq: any[]) {
  DEBUG = true;
  let k0 = solve(digits, seq);
  dbg(k0.join(""));
  let shortests: any = []
  for(let ss of k0) {
    let k1 = solve(arrows, ss);
    if (shortests.length === 0 || shortests[0].length > k1.length)
      shortests = [k1];
    else
      if (shortests[0].length === k1.length) {
        shortests.push(k1)
      }
  }
  console.log(shortests[0])
  return shortests[0];
}

let ans1 = 0;
codes.forEach((codes, ci) => {
  let ans = solve1(codes);
  ans1 += ans.length * dcodes[ci];
  console.log(`${codes.join("")}: ${ans.length} ${ans.join("")}`);
});
answer(1, ans1);

//solve1('029A'.split('').map(trnum));
*/

type Coord = [number, number]

function MHD(a: Coord, b: Coord) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function type(pos, kbd, seq) {
  let cpos: any = [...pos];
  let res = [];
  seq.forEach(sk => {
    if (_.get(kbd, cpos) === null) {
      throw 'Hole';
    }
    switch(sk) {
      case "^":
        cpos = up(cpos);
        break;
      case "v":
        cpos = down(cpos);
        break;
      case "<":
        cpos = left(cpos);
        break;
      case ">":
        cpos = right(cpos);
        break;
      case 'A':
        res.push(_.get(kbd, cpos));
        break;
    }
  })
  return [res, cpos];
}

/*

class BFState {
  pin: string[];
  entered: string[];
  pos1: Coord; //digits
  goal1: Coord;
  pos2: Coord; //arrows1
  goal2: Coord;
  pos3: Coord; //arrows2
  goal3: Coord;
  seq: string[];
  heuristic(): number {
    if (!this.pin.join("").startsWith(this.entered.join(""))) {
      return Infinity;
    }
    return (
      27 * MHD(this.pos1, this.goal1) +
      9 * MHD(this.pos2, this.goal2) +
      3 * MHD(this.pos3, this.goal3)
    );
  }
  cost(): number {
    if (this.pin.join("").startsWith(this.entered.join(""))) {
      return this.seq.length;
    }
    return Infinity;
  }
  updateGoals() {
    const nextChar = this.pin[this.entered.length];
    this.goal1 = findCoord(digits, nextChar);
    this.goal2 = findCoord(arrows, nextChar);
    this.goal3 = findCoord(arrows, "A");
  }
}
  */

let res = type(sp_arrows, arrows, '<vA<AA>>^AvAA<^A>A<v<A>>^AvA^A<vA>^A<v<A>^A>AAvA^A<v<A>A>^AAAvA<^A>A'.split(''))[0];
let res1 = type(sp_arrows, arrows, res)[0]
let res2 = type(sp_digits, digits, res1)[0]
console.log(res2.join(''));

function typeAll(seq) {
  let res = type(
    sp_arrows,
    arrows,
    seq
  );
  let res1 = type(sp_arrows, arrows, res[0]);
  let res2 = type(sp_digits, digits, res1[0]);
  return {
    res,
    res1,
    res2
  }
}

function tracePathA(path, dists) {
  let resPath = [];
  path.reduce((ov, nv) => {
    dbg({ov, nv, dp: dists.get([ov, nv])}, 'tracePathA')
    resPath = [...resPath, ...dists.get([ov, nv])];
    return nv;
  }, 'A')
  dbg(resPath, 'resPath')
  return resPath;
}

DEBUG = false;
let dists1 = new HM<any, any>();
console.log('===========1')
for(let i of Keys(arrows)) {
  for(let j of Keys(arrows)) {
    if (i === j) {
      dists1.set([i, j], ['A'])
    } else {
      let shortestpath = findPath1(arrows, i, j)[0];
      let e = [...shortestpath, 'A']
      dbg({i, j, e})
      dists1.set([i, j], e)
    }
  }
}
console.log('===========2')
let dists2 = new HM();
for(let i of Keys(arrows)) {
  for(let j of Keys(arrows)) {
    if (i === j) {
      dists2.set([i, j], ['A'])
    } else {
      let pathes = findPath1(arrows, i, j);
      dbg(pathes)
      let extended = pathes.map(path => tracePathA([...path, 'A'], dists1));
      extended.sort((a, b) => a.length - b.length);
      let e = [...extended[0]]
      dists2.set([i, j], e);
      dbg({i, j, e})
    }
  }
}
DEBUG = false;
console.log('===========3')
let dists3 = new HM();
for(let i of Keys(digits)) {
  for(let j of Keys(digits)) {
    if (i === j) {
      dists3.set([i, j], [])
    } else {
      let pathes = findPath1(digits, i, j);
      dbg(pathes)
      let extended = pathes.map(path => tracePathA([...path, 'A'], dists2));
      extended.sort((a, b) => a.length - b.length);
      let e = [...extended[0]]
      dists3.set([i, j], e);
      dbg({i, j, e})
    }
  }
}
console.log('===========l0')
let distsl0 = new HM();
for(let i of Keys(digits)) {
  for(let j of Keys(digits)) {
    if (i === j) {
      dists3.set([i, j], [])
    } else {
      let pathes = findPath1(digits, i, j);
      let e = [...pathes[0], 'A']
      distsl0.set([i, j], e);
      dbg({i, j, e})
    }
  }
}

function solve1(codes) {
  let ans0 = tracePathA(codes, dists3);
  return ans0;
}

let ans1 = 0;
codes.forEach((codes, ci) => {
  let ans = solve1(codes);
  ans1 += ans.length * dcodes[ci];
  console.log(`${codes.join("")}: ${ans.length} ${ans.join("")}`);
});
answer(1, ans1);
/*let a0 = dists3.get(['A', 0])
console.log(typeAll(a0), 'A0')*/

/*let ans0 = tracePathA([0, 2, 9, 'A'], dists3);
console.log(ans0.join(''));
console.log(JSON.stringify(typeAll(ans0)))

console.log('====')*/
//let seq1 = tracePathA([0, 2, 9, 'A'], distsl0);
/*let seq2 = tracePathA(seq1, dists1);
dbg(seq1, 'seq1')
dbg(seq2, 'seq2')
let seq3 = tracePathA(seq2, dists1);
dbg(seq3, 'seq3')
console.log(JSON.stringify(typeAll(seq3)))
console.log('=====')
console.log(JSON.stringify(typeAll('<vA<AA>>^AvAA<^A>A<v<A>>^AvA^A<vA>^A<v<A>^A>AAvA^A<v<A>A>^AAAvA<^A>A'.split(''))))*/
//console.log(JSON.stringify(typeAll(ans0)))
// <vA<AA>>^AvAA<^A>A<v<A>>^AvA^A<vA>^A<v<A>^A>AAvA^A<v<A>A>^AAAvA<^A>A
// <vA<A>>^AAvA<^A>AAA<v<A>>^AAvA^AAA
// <vA<A>>^AAvA<^A>AAA<v<A>>^AAvA^AAA<vA>^AA<v<A>^A>AAvA^AAA<v<A>A>^AAvA<^A>AAA
/*
function dfs(typed: string[], nextKey: string, level: number) {
  let cstate = typeAll(typed);
  if (level === 0) {
    let goodKeys = 
  }
}

dfs([], '0', 0);*/

function tracePathB(path, dists) {
  let resPath = 0;
  path.reduce((ov, nv) => {
    //dbg({ov, nv, dp: dists.get([ov, nv])}, 'tracePathB')
    resPath = resPath + dists.get([ov, nv]);
    return nv;
  }, 'A')
  //dbg(resPath, 'resPath')
  return resPath;
}

DEBUG = true;

let distsp1 = new HM<any, number>();
dists1.keys().forEach(kv => {
  distsp1.set(kv, dists1.get(kv).length)
})

let matrices = [distsp1];

function nextMatrix(odists, kbd) {
  let ndists = new HM<any, number>();
  for(let i of Keys(kbd)) {
    for(let j of Keys(kbd)) {
      if (i === j) {
        ndists.set([i, j], 1)
      } else {
        let pathes = findPath1(kbd, i, j);
        let extended = pathes.map(path => tracePathB([...path, 'A'], odists));
        extended.sort((a, b) => a - b);
        let e = extended[0]
        ndists.set([i, j], e);
      }
    }
  }
  return ndists;
}

while(matrices.length < 25) {
  let lm = _.last(matrices)
  let nm = nextMatrix(lm, arrows)
  matrices.push(nm)
}

let dm1 = nextMatrix(matrices[1], digits);
let dm25 = nextMatrix(matrices[24], digits);

function solve2(codes, digmat) {
  let ans0 = tracePathB(codes, digmat);
  return ans0;
}


let ans21 = 0;
codes.forEach((codes, ci) => {
  let ans = solve2(codes, dm1);
  ans21 += ans * dcodes[ci];
  // console.log(`${codes.join("")}: ${ans.length} ${ans.join("")}`);
});
answer(1, ans21);
let ans22 = 0;
codes.forEach((codes, ci) => {
  let ans = solve2(codes, dm25);
  ans22 += ans * dcodes[ci];
  // console.log(`${codes.join("")}: ${ans.length} ${ans.join("")}`);
});
answer(2, ans22);