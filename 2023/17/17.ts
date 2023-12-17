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
const map = []
contents.forEach((line) => {
  map.push(line.split('').map(Number))
});
/*let open = [[0, 0, 0, 1, 0]]
let closed = new HM();
while(open.length) {
  open.forEach()
}*/

let nexts = cached((sr, sc, isHz) => {
  let nexts = []
  let av;
  let dr, dc;
  av = 0;
  if (isHz) {dr = 0; dc = 1;} else { dr = 1; dc = 0;}
  for(let i=1;i<=3;++i) {
    av += _.get(map, [sr+dr*i, sc+dc*i])
    nexts.push([sr+dr*i, sc+dc*i, av]);
  }
  av = 0;
  if (isHz) {dr = 0; dc = -1;} else { dr = -1; dc = 0;}
  for(let i=1;i<=3;++i) {
    av += _.get(map, [sr+dr*i, sc+dc*i])
    nexts.push([sr+dr*i, sc+dc*i, av]);
  }
  nexts = nexts.filter(nx => !isNaN(nx[2]))
  return nexts;
})
let nexts2 = cached((sr, sc, isHz) => {
  let nexts = []
  let av;
  let dr, dc;
  av = 0;
  if (isHz) {dr = 0; dc = 1;} else { dr = 1; dc = 0;}
  for(let i=1;i<=10;++i) {
    av += _.get(map, [sr+dr*i, sc+dc*i])
    if (i>=4) {
      nexts.push([sr+dr*i, sc+dc*i, av]);
    }
  }
  av = 0;
  if (isHz) {dr = 0; dc = -1;} else { dr = -1; dc = 0;}
  for(let i=1;i<=10;++i) {
    av += _.get(map, [sr+dr*i, sc+dc*i])
    if (i>=4) {
      nexts.push([sr+dr*i, sc+dc*i, av]);
    }
  }
  nexts = nexts.filter(nx => !isNaN(nx[2]))
  return nexts;
})
let mr = map.length-1
let mc = map[0].length-1;
type Node = {
  row: number;
  col: number;
  hz: boolean;
  loss: number;
}

function he(node: Node) {
  return node.loss + ((mr-node.row) + (mc-node.col));
}

function solvePart(nextFn) {
  let open = new PQ<Node>({
    comparator: (a, b) => he(a) - he(b)
  })
  open.queue({ row: 0, col: 0, hz: false, loss: 0 })
  open.queue({ row: 0, col: 0, hz: true, loss: 0 })
  let closed = new HM<any[], number>();
  while (open.length) {
    let top = open.dequeue()
    let key = [top.row, top.col, top.hz]
    if (closed.has(key) && closed.get(key) >= top.loss) {
      continue;
    }
    closed.set(key, top.loss);
    if (top.row === mr && top.col === mc) {
      break;
    }
    let nex = nextFn(top.row, top.col, top.hz);
    let nextHz = !top.hz;
    nex.forEach(ne => {
      if (!closed.has([ne[0], ne[1], nextHz])) {
        open.queue({ row: ne[0], col: ne[1], hz: nextHz, loss: ne[2] + top.loss })
      }
    })
  }

  let ta = [closed.get([mr, mc, true]), closed.get([mr, mc, false])].filter(v => isFinite(v))
  return Math.min(...ta);
}
answer(1, solvePart(nexts))
answer(2, solvePart(nexts2))

//answer(1, findWay(0, 0, true))
/*let findWay = cached((sr, sc, dirr, dirc, strLen) => {
    let [nr, nc] = [sr+dirr, sc+dirc];
    dbg([nr, nc, dirr, dirc, strLen])
    if (nr === map.length-1 && nc === map[0].length-1) {
      return map[nr][nc];
    }
    if (nr<0||nr>=map.length||nc<0||nc>=map[0].length) return Infinity;
    let cv = map[nr][nc]
    ++strLen;
    let mustTurn = false;
    if (strLen>2) {
      mustTurn = true;
    }
    let anss = []
    if (dirr) {
      anss.push(findWay(nr, nc, 0, 1, 0))
      anss.push(findWay(nr, nc, 0, -1, 0))
    } else if (dirc) {
      anss.push(findWay(nr, nc, 1, 0, 0))
      anss.push(findWay(nr, nc, -1, 0, 0))
    }
    if (!mustTurn) {
      anss.push(findWay(nr, nc, dirr, dirc, strLen))
    }
    let minS = Math.min(...anss);
    dbg([sr, sc, dirr, dirc, strLen, cv+minS])
    return cv+minS;
}, true)

//let tans = Math.min(findWay(0, 0, 0, 1, 0),findWay(0, 0, 1, 0, 0));

answer(1, findWay(0, 0, 0, 1, 0));
//answer(1, findWay(12, 10, 0, 1, 0));

dbg('NE')
*/