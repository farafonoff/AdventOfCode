import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { isNative } from "lodash";
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

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map(Number);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

function mkTable() {
  let sn;
  let pn;
  let fn;
  let table = [];
  contents.forEach((line, idx) => {
    sn = {};
    sn.value = line;
    if (!fn) {
      fn = sn;
    }
    if (pn) {
      sn.prev = pn;
      pn.next = sn;
    }
    pn = sn;
    table[idx] = sn;
  });

  fn.prev = sn;
  sn.next = fn;
  return table;
}

function pback(node) {
  let n0 = node.prev.prev;
  let n1 = node.prev;
  let n3 = node.next;
  n0.next = node;
  n1.prev = node;
  n1.next = n3;
  node.prev = n0;
  node.next = n1;
  n3.prev = n1;
}

function pfwd(node) {
  let n0 = node.prev;
  let n2 = node.next;
  let n3 = node.next.next;
  n0.next = n2;
  node.prev = n2;
  node.next = n3;
  n2.prev = n0;
  n2.next = node;
  n3.prev = node;
}
function shuffle(table) {
  table.forEach((node, idx) => {
    let v = node.value;
    let va = Math.abs(v) % (table.length - 1);
    /*if (v < 0) {
      va -= 1;
    }*/
    if (v < 0) {
      for (let i = 0; i < va; ++i) {
        pback(node);
      }
    }
    if (v > 0) {
      for (let i = 0; i < va; ++i) {
        pfwd(node);
      }
    }
  });
  return table;
}

function getAnswer(table) {
  let zn = table.find((val) => val.value === 0);
  /*let dl = zn;
  for (let i = 0; i < table.length; ++i) {
    dbg(dl.value);
    dl = dl.next;
  }*/
  let il = zn;
  let answers = [];
  for (let i = 1; i <= 3000; ++i) {
    il = il.next;
    if (i === 1000 || i === 2000 || i === 3000) {
      answers.push(il.value);
    }
  }
  let ans1 = answers.reduce((p, c) => p + c);
  //dbg(answers);
  return ans1;
}

let table = mkTable();
answer(1, getAnswer(shuffle(table)));

table = mkTable();
table.forEach((vn) => {
  vn.value = vn.value * 811589153;
});
for (let i = 0; i < 10; ++i) {
  table = shuffle(table);
}
answer(2, getAnswer(table));
