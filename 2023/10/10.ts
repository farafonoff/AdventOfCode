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
const map = []
let sp = [];
contents.forEach((line) => {
  const ll = line.split('');
  map.push(ll)
  if (ll.indexOf('S')!==-1) {
    sp = [map.length-1, ll.indexOf('S')];
  }
});
const up = ([a,b]) => [a-1, b];
const down = ([a,b]) => [a+1, b];
const left = ([a,b]) => [a, b-1];
const right = ([a,b]) => [a, b+1];
const dirs = [up, down, left, right]
/*function jpath(sp, map) {
  dbg(sp)
  let nodes = [sp];
  let visited = new HM();
  let dist = 0;
  do {
    let next = [];
    nodes.forEach(nod => {
      if (visited.has(nod)) {
        return;
      }
      const cps = dirs.map(df => df(nod));
      if (['|', '7', 'F'].includes(_.get(map, cps[0]))) {
        if (!visited.has(cps[0])) next.push(cps[0])
      }
      if (['|', 'L', 'J'].includes(_.get(map, cps[1]))) {
        if (!visited.has(cps[1])) next.push(cps[1])
      }
      if (['-', 'L', 'F'].includes(_.get(map, cps[2]))) {
        if (!visited.has(cps[2])) next.push(cps[2])
      }
      if (['-', 'J', '7'].includes(_.get(map, cps[3]))) {
        if (!visited.has(cps[3])) next.push(cps[3])
      }
      visited.set(nod, dist);
    })
    dbg([dist, next]);
    nodes = next;
    ++dist;
  } while (nodes.length !== 0)
  dbg([sp, visited.values()])
}*/
let osp = sp;
function dfs(map,sp, visited: HM<Array<number>, number>, depth, va: any[]) {
  if (_.isEqual(osp, sp) && depth > 2) {
    return [depth, visited, va];
  }
  if (visited.has(sp)) {
    return false;
  }
  visited.set(sp, depth)
  va.push(sp)
  const cps = dirs.map(df => df(sp));
  if (['|', '7', 'F', 'S'].includes(_.get(map, cps[0]))) {
    if (['|', 'L', 'J', 'S'].includes(_.get(map, sp))) {
      let dept = dfs(map, cps[0], visited, depth+1, va)
      if (dept) return dept;
    }
  }
  if (['|', 'L', 'J', 'S'].includes(_.get(map, cps[1]))) {
    if (['|', '7', 'F', 'S'].includes(_.get(map, sp))) {
      let dept =  dfs(map, cps[1], visited, depth+1, va)
      if (dept) return dept;
    }
  }
  if (['-', 'L', 'F', 'S'].includes(_.get(map, cps[2]))) {
    if (['-', 'J', '7', 'S'].includes(_.get(map, sp))) {
      let dept =  dfs(map, cps[2], visited, depth+1, va)
      if (dept) return dept;
    }
  }
  if (['-', 'J', '7', 'S'].includes(_.get(map, cps[3]))) {
    if (['-', 'L', 'F', 'S'].includes(_.get(map, sp))) {
      let dept =  dfs(map, cps[3], visited, depth+1, va)
      if (dept) return dept;
    }
  }
  va.pop()
  visited.delete(sp)
  return false;
}

//jpath(_.cloneDeep(sp), _.cloneDeep(map))
const [dept, visited,va] = dfs(map, sp, new HM, 0, []);
answer(1, dept/2);

function safeSet(map, cc) {
  if (_.get(map, cc) === '.') {
    _.set(map, cc, '*');
    return true;
  }
  return false;
}

function solve2(flag) {

  const mmap = _.cloneDeep(map)
  for (let i = 0; i < map.length; ++i) {
    for (let j = 0; j < map[i].length; ++j) {
      _.set(mmap, [i, j], '.')
    }
  }

  va.forEach(key => {
    _.set(mmap, key, _.get(map, key))
  })

  va.forEach((pv, pi) => {
    const ch = _.get(map, pv);
    if (pi === 0) return;
    const dv = [pv[0] - va[pi - 1][0], pv[1] - va[pi - 1][1]]
    switch (ch) {
      case 'S': break;
      case 'F': {
        let vf;
        if (dv[0]) vf = 'u';
        if (dv[1]) vf = 'd';
        if ((flag && vf === 'd') || (!flag && vf === 'u')) {
          safeSet(mmap, up(pv))
          safeSet(mmap, left(pv))
        }
        break;
      }
      case '7': {
        let vf;
        if (dv[0]) vf = 'u';
        if (dv[1]) vf = 'd';
        if ((flag && vf === 'u') || (!flag && vf === 'd')) {
          safeSet(mmap, up(pv))
          safeSet(mmap, right(pv))
        }
        break;
      }
      case 'J': {
        let vf;
        if (dv[0]) vf = 'd';
        if (dv[1]) vf = 'u';
        if ((flag && vf === 'u') || (!flag && vf === 'd')) {
          safeSet(mmap, down(pv))
          safeSet(mmap, right(pv))
        }
        break;
      }
      case 'L': {
        let vf;
        if (dv[0]) vf = 'd';
        if (dv[1]) vf = 'u';
        if ((flag && vf === 'd') || (!flag && vf === 'u')) {
          safeSet(mmap, down(pv))
          safeSet(mmap, left(pv))
        }
        break;
      }
      case '|': {
        let vf;
        if (dv[0] === -1) vf = 'u';
        if (dv[0] === 1) vf = 'd';
        if ((flag && vf === 'u') || (!flag && vf === 'd')) {
          safeSet(mmap, right(pv))
        } else {
          safeSet(mmap, left(pv))
        }
        break;
      }
      case '-': {
        let vf;
        if (dv[1] === -1) vf = 'l';
        if (dv[1] === 1) vf = 'r';
        if ((flag && vf === 'l') || (!flag && vf === 'r')) {
          safeSet(mmap, up(pv))
        } else {
          safeSet(mmap, down(pv))
        }
        break;
      }
    }
  })

  let paint = 0;
  do {
    paint = 0;
    mmap.forEach((row, ri) => {
      row.forEach((col, ci) => {
        if (col === '*') {
          const cps = dirs.map(df => df([ri, ci]));
          cps.forEach(pp => {
            if (safeSet(mmap, pp)) {
              ++paint;
            }
          })
        }
      })
    })
  } while (paint !== 0)


  mmap.forEach(row => dbg(row.join('')))

  let ans2 = 0;
  mmap.forEach((row, ri) => {
    row.forEach((col, ci) => {
      if (col === '*') {
        ++ans2;
      }
    })
  })
  // very rough detection if we painted inner or outer side
  if (_.get(mmap, [0, 0]) === '*') {
    return -ans2;
  } else {
    return ans2;
  }
}

let answers = [solve2(true), solve2(false)]
answer(2, answers.filter(a => a>0)[0])