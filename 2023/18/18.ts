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

type Interval = [number, number];

function mergeIntervals(intervals: Interval[]): Interval[] {
  if (intervals.length <= 1) {
    return intervals;
  }

  // Sort intervals based on the start value
  intervals.sort((a, b) => a[0] - b[0]);

  const result: Interval[] = [intervals[0]];

  for (let i = 1; i < intervals.length; i++) {
    const currentInterval = intervals[i];
    const lastMergedInterval = result[result.length - 1];

    // Check for overlap
    if (currentInterval[0] <= lastMergedInterval[1]) {
      // Merge intervals if there is an overlap
      lastMergedInterval[1] = Math.max(lastMergedInterval[1], currentInterval[1]);
    } else {
      // Add the non-overlapping interval to the result
      result.push(currentInterval);
    }
  }

  return result;
}

function findUnion(intervals1: Interval[], intervals2: Interval[]): Interval[] {
  // Concatenate intervals from both sets
  const allIntervals = intervals1.concat(intervals2);

  // Find the union of intervals
  const unionIntervals = mergeIntervals(allIntervals);

  return unionIntervals;
}

// Example usage:
const set1: Interval[] = [[1, 3], [2, 6], [8, 10], [15, 18]];
const set2: Interval[] = [[1, 4], [4, 5]];

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
let plan = [];
contents.forEach((line) => {
  plan.push(line.split(' '))
});

function solve1(plan) {
  let dug = new HM<number[], number>();
  let cc = [0, 0]
  dug.set(cc, 1);
  plan.forEach(row => {
    let dir = [0, 0];
    switch (row[0]) {
      case 'R': dir = [0, 1]; break;
      case 'L': dir = [0, -1]; break;
      case 'U': dir = [-1, 0]; break;
      case 'D': dir = [1, 0]; break;
    }
    for (let i = 0; i < Number(row[1]); ++i) {
      cc = cc.map((v, i) => v + dir[i]);
      dug.set(cc, 1);
    }
  })

  DEBUG = false;

  let minR = Math.min(...dug.keys().map(([r, c]) => r));
  let maxR = Math.max(...dug.keys().map(([r, c]) => r));
  let minC = Math.min(...dug.keys().map(([r, c]) => c));
  let maxC = Math.max(...dug.keys().map(([r, c]) => c));

  let map = []
  for (let i = minR; i <= maxR; ++i) {
    for (let j = minC; j <= maxC; ++j) {
      if (dug.has([i, j])) {
        _.set(map, [i - minR, j - minC], '#');
      } else {
        _.set(map, [i - minR, j - minC], '.');
      }
    }
  }

  map.forEach(row => {
    dbg(row.join(''))
  })

  let fillPoint = []
  for (let rr = 0; rr < map.length; ++rr) {
    let sharps = map[rr].filter(ch => ch === '#');
    if (sharps.length === 2) {
      fillPoint[0] = rr;
      fillPoint[1] = map[rr].findIndex(ch => ch === '#') + 1
      break;
    }
  }

  let open = [fillPoint];
  dbg(open)
  do {
    let adj = []
    open.forEach((ov) => {
      for (let i = -1; i <= 1; ++i) {
        for (let j = -1; j <= 1; ++j) {
          if (_.get(map, [ov[0] + i, ov[1] + j]) === '.') {
            adj.push([ov[0] + i, ov[1] + j])
            _.set(map, [ov[0] + i, ov[1] + j], '#')
          }
        }
      }
    })
    open = adj;
  } while (open.length > 0);

  let ans1 = 0;

  map.forEach(row => {
    dbg(row.join(''))
    ans1 += row.filter(ch => ch === '#').length
  })
  return ans1;
}
answer(1, solve1(plan))

function solve2(plan) {
  let cc = [0, 0]
  let vert = [];
  let horz = [];
  plan.forEach(row => {
    let dir = [0, 0];
    switch (row[0]) {
      case 'R': dir = [0, 1]; break;
      case 'L': dir = [0, -1]; break;
      case 'U': dir = [-1, 0]; break;
      case 'D': dir = [1, 0]; break;
    }
    let occ = cc;
    cc = cc.map((v, i) => v + dir[i] * row[1]);
    if (['U', 'D'].includes(row[0])) {
      vert.push([cc[1], Math.min(occ[0], cc[0]), Math.max(occ[0], cc[0])])
    }
    if (['R', 'L'].includes(row[0])) {
      horz.push([cc[0], Math.min(occ[1], cc[1]), Math.max(occ[1], cc[1])])
    }
  })
  horz.sort((a,b) => a[0] - b[0])
  vert.sort((a,b) => a[0] - b[0])
  dbg(vert)
  dbg(horz)
  let ih = _.uniq(horz.map(hz => hz[0]))
  dbg(ih)
  let area = 0;
  // inner areas
  for(let i=1;i<ih.length;++i) {
    let [st, ed] = [ih[i-1], ih[i]];
    if (ed - st < 2) continue;
    let iv = vert.filter(vl => vl[1] <= st && vl[2] >= ed);
    let ra = 0;
    for(let vi = 0;vi<iv.length;vi+=2) {
      let sa = (ed - st - 1) * ( iv[vi+1][0] - iv[vi][0] + 1);
      area += sa;
      ra += sa;
    }
    dbg([st, ed , iv, ra])
  }
  dbg(area, 'INNER AREAS')
  // horizontal lines
  ih.forEach((ih) => {
    dbg(ih, 'HORIZONTAL LINE')
    let iv = vert.filter(vl => vl[1] <= ih && vl[2] >= ih);
    let tcurrent = null, bcurrent = null
    let topIntervals = []
    let bottomIntervals = []
    iv.forEach(vl => {
      if (vl[1] < ih && vl[2] > ih) {
        if (tcurrent=== null) {
          tcurrent = vl[0];
        } else {
          topIntervals.push([tcurrent, vl[0]])
          tcurrent = null;
        }
        if (bcurrent=== null) {
          bcurrent = vl[0];
        } else {
          bottomIntervals.push([bcurrent, vl[0]])
          bcurrent = null;
        }
      }
      if (vl[2] === ih) {
        if (tcurrent=== null) {
          tcurrent = vl[0];
        } else {
          topIntervals.push([tcurrent, vl[0]])
          tcurrent = null;
        }
      }
      if (vl[1] === ih) {
        if (bcurrent=== null) {
          bcurrent = vl[0];
        } else {
          bottomIntervals.push([bcurrent, vl[0]])
          bcurrent = null;
        }
      }
    })
    const merged = mergeIntervals([...topIntervals, ...bottomIntervals]);
    merged.forEach(mi => area += mi[1]-mi[0] + 1)
  })
  dbg(area)
  return area;
}

DEBUG = false;

let plan2 = plan.map(pr => {
  let ch = pr[2]
  let first = ch.slice(2, ch.length - 2);
  let last = ch.slice(ch.length-2, ch.length - 1)
  let value = parseInt(first, 16);
  let dir = ['R', 'D', 'L', 'U'][Number(last)];
  return [dir, value]
})

dbg(plan2)

answer(2, solve2(plan2));