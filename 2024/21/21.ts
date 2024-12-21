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

function dfs(map, sp, ep) {}

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
  console.log({goods})
  return goods;
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
  
/*  
  dbg(k1.join(""));
  let k2 = solve(arrows, k1);
  dbg(k2.join(""));
  DEBUG = true;
  return k2;*/
}

let ans1 = 0;
codes.forEach((codes, ci) => {
  let ans = solve1(codes);
  ans1 += ans.length * dcodes[ci];
  console.log(`${codes.join("")}: ${ans.length} ${ans.join("")}`);
});
answer(1, ans1);
//solve1('029A'.split('').map(trnum));
