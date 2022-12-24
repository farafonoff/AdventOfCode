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

function vmul(v1, n2) {
  return v1.map((vc, vn) => vc * n2);
}

function fmod(n, m) {
  return ((n % m) + m) % m;
}

function vmod(v1, v2) {
  return v1.map((vc, vn) => {
    let va = fmod(vc - 1, v2[vn] - 2) + 1;
    return va;
  });
}
/*
for (let i = 1; i < 10; ++i) {
  dbg(vmod([i, i], [3, 4]));
}
*/
var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
let blizz = new HM<number[], number[]>();
let walls = new HM<number[], 1>();
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
contents.forEach((line, ridx) => {
  [...line].forEach((ch, cidx) => {
    let pos = [ridx, cidx];
    switch (ch) {
      case ">": {
        blizz.set(pos, [0, 1]);
        break;
      }
      case "v": {
        blizz.set(pos, [1, 0]);
        break;
      }
      case "<": {
        blizz.set(pos, [0, -1]);
        break;
      }
      case "^": {
        blizz.set(pos, [-1, 0]);
        break;
      }
      case "#": {
        walls.set(pos, 1);
        break;
      }
    }
  });
});
let H = contents.length;
let W = contents[0].length;

let ud = [-1, 1];

function dmstate(stt) {
  for (let i = 0; i < H; ++i) {
    let rm = [];
    for (let j = 0; j < W; ++j) {
      if (walls.has([i, j])) {
        rm.push("#");
      } else if (stt.has([i, j])) {
        rm.push("*");
      } else rm.push(".");
    }
    dbg(rm.join(""));
  }
}
function bfs(pos, erow, stime) {
  let reach = false;
  let open = [pos];
  let time = stime;
  while (!reach) {
    ++time;
    let mstate = new HM<number[], 1>();
    blizz.forEach((val, key) => {
      let cpos = vmod(vadd(key, vmul(val, time)), [H, W]);
      mstate.set(cpos, 1);
    });
    //dmstate(mstate);
    //dbg(mstate);
    let next = new HM<number[], 1>();

    open.forEach((pos) => {
      let nexts = [pos];
      ud.forEach((hv) => {
        nexts.push(vadd(pos, [hv, 0]));
      });
      ud.forEach((wv) => {
        nexts.push(vadd(pos, [0, wv]));
      });
      nexts = nexts.filter((nxt) => {
        //dbg([time, nxt, mstate.has(nxt)]);
        return nxt[0] >= 0 && nxt[0] < H && !mstate.has(nxt) && !walls.has(nxt);
      });
      nexts.forEach((vn) => {
        next.set(vn, 1);
        if (vn[0] === erow) {
          reach = true;
        }
      });
    });
    open = next.keys();
    //dbg(open);
  }
  return time;
}
let s1 = bfs([0, 1], H - 1, 0);
answer(1, s1);
let s2 = bfs([H - 1, W - 2], 0, s1);
let s3 = bfs([0, 1], H - 1, s2);
answer(2, s3);
