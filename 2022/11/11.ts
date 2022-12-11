import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
import * as bigInt from "big-integer";
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
  .map((s) => s.trim());
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
class Monkey {
  worries: bigint[];
  operation;
  testDivBy: bigint;
  falseThrow: number;
  trueThrow: number;
  business: bigint = 0n;
}
let monkeys = [];
let monkey: Monkey;
let alltests = 1n;
contents.forEach((line) => {
  let tokens = line.split(/[ ,]/);
  if (tokens[0] === "Monkey") {
    monkey = new Monkey();
    monkeys.push(monkey);
  }
  if (tokens[0] === "Starting") {
    monkey.worries = tokens
      .slice(2)
      .map((s) => trnum(s) as number)
      .filter((v) => !!v)
      .map((v) => BigInt(v));
  }
  if (tokens[0] === "Operation:") {
    let eq = tokens
      .slice(1)
      .map(trnum)
      .map((v) => {
        if (typeof v === "number") {
          return `${v}n`;
        } else {
          return v;
        }
      })
      .join("");
    let func = `(old) => { const v${eq}; return vnew; }`;
    monkey.operation = eval(func);
  }
  if (tokens[0] === "Test:") {
    let eq = tokens.slice(3).map(trnum);
    monkey.testDivBy = BigInt(eq[0] as number);
    alltests *= monkey.testDivBy;
  }
  if (tokens[0] === "If") {
    switch (tokens[1]) {
      case "true:": {
        let eq = tokens.slice(5).map(trnum);
        monkey.trueThrow = eq[0] as number;
        break;
      }
      case "false:": {
        let eq = tokens.slice(5).map(trnum);
        monkey.falseThrow = eq[0] as number;
        break;
      }
    }
  }
});

let parsed = _.cloneDeep(monkeys);

DEBUG = false;

function sim(monkeys: Monkey[], part = 1) {
  monkeys.forEach((mnk, id) => {
    dbg("");
    dbg(`Monkey ${id}:`);
    mnk.worries.forEach((worry) => {
      dbg(`inspects item ${worry}`);
      worry = mnk.operation(worry);
      //dbg(`current worry level ${worry}`);
      if (part !== 2) worry = worry / 3n;
      dbg(`current worry level ${worry}`);
      mnk.business += 1n;
      worry = worry % alltests;
      if (worry % mnk.testDivBy === 0n) {
        dbg(`throws to ${mnk.trueThrow}`);
        monkeys[mnk.trueThrow].worries.push(worry);
      } else {
        dbg(`throws to ${mnk.falseThrow}`);
        monkeys[mnk.falseThrow].worries.push(worry);
      }
    });
    mnk.worries = [];
  });
}

for (let i = 0; i < 20; ++i) {
  sim(monkeys);
  dbg(`========= ${i} =============`);
}

let sorted = [...monkeys].sort((a, b) => {
  let bn = b.business - a.business;
  if (bn > 0n) return 1;
  if (bn < 0n) return -1;
  return 0;
});
dbg(sorted);
answer(1, sorted[0].business * sorted[1].business);
//DEBUG = true;
dbg(parsed);
monkeys = _.cloneDeep(parsed);
for (let i = 0; i < 10000; ++i) {
  sim(monkeys, 2);
  dbg(`========= ${i} =============`);
}

sorted = [...monkeys].sort((a, b) => {
  let bn = b.business - a.business;
  if (bn > 0n) return 1;
  if (bn < 0n) return -1;
  return 0;
});

answer(2, sorted[0].business * sorted[1].business);
