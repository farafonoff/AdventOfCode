const fs = require("fs");
const HM = require("hashmap");
const md5 = require("js-md5");
const PQ = require("js-priority-queue");
const _ = require("lodash");
const infile = process.argv[2] || "input";

function trnum(val: string): number | string {
  let nn = Number(val);
  if (isFinite(nn)) {
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

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((s) => s.split("").map(trnum));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

contents.forEach((line) => {
  solve1(line);
  solve2(line);
});
function csplice(arr, start, count) {
  const res = [...arr];
  let out = res.splice(start, count);
  if (out.length < count) {
    out = [...out, res.splice(0, count - out.length)];
  }
  return [res, out];
}

function solve1(cups: number[]) {
  let current = 0;
  let ncups = cups;
  for (let i = 0; i < 100; ++i) {
    let cv = ncups[current];
    const move = csplice(ncups, current + 1, 3);
    let dv = move[0].reduce((acc, val) => {
      if (val < cv && val > acc) return val;
      return acc;
    }, -1);
    if (dv === -1) dv = Math.max.apply(null, move[0]);
    //console.log(move[1], dv);
    let idv = move[0].indexOf(dv);
    move[0].splice(idv + 1, 0, ...move[1]);
    ncups = move[0];
    let last = ncups.splice(0, 1);
    ncups.push(last[0]);
    //console.log(ncups);
  }
  let pos1 = ncups.indexOf(1);
  let fp = ncups.splice(0, pos1);
  ncups = _.concat(ncups, fp);
  ncups.splice(0, 1);
  console.log(ncups.join(""));
}

class node {
  val: number;
  next: node | null;
  m1: node | null;
}

function solve2(cups: number[]) {
  //const iters = 100;
  //const tcount = 0;
  const iters = 10000000;
  const tcount = 1000000;
  let nodes: node[] = cups.map((cup) => ({
    val: cup,
  })) as node[];
  nodes.forEach((node, idx) => {
    node.next = nodes[idx + 1];
  });
  let n1: node;
  let nm: node;
  nodes.forEach((node) => {
    if (node.val > 1) {
      node.m1 = nodes.find((nod) => nod.val === node.val - 1);
    } else {
      n1 = node;
    }
    if (node.val === nodes.length) {
      nm = node;
    }
  });
  let lv = nodes[nodes.length - 1];
  for (let i = cups.length + 1; i <= tcount; ++i) {
    lv.next = {
      val: i,
      m1: nm,
    } as node;
    nm = lv.next;
    lv = lv.next;
  }
  n1.m1 = nm;
  lv.next = nodes[0];
  //console.log(n1.m1.val, lv.val, lv.next.val, lv.m1.val);
  //return;
  let cv = nodes[0];
  for (let it = 0; it < iters; ++it) {
    let removed = cv.next;
    let rend = removed;
    let rlast: node;
    let rmvalues = [];
    for (let r = 0; r < 3; ++r) {
      rmvalues.push(rend.val);
      rlast = rend;
      rend = rend.next;
    }
    //console.log(rmvalues);
    let pv = cv.m1;
    while (rmvalues.indexOf(pv.val) !== -1) {
      pv = pv.m1;
    }
    //console.log(pv.val);
    cv.next = rend;
    let pvn = pv.next;
    pv.next = removed;
    rlast.next = pvn;
    cv = cv.next;
  }
  //console.log(n1.next.val, n1.next.next.val);
  console.log(n1.next.val * n1.next.next.val);
  /*cv = n1;
  for (let i = 0; i < 10; ++i) {
    console.log(cv.val, cv.m1.val);
    cv = cv.next;
  }*/
}
