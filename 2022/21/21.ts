import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { isArray, isNumber, isObject } from "lodash";
import bigDecimal from "js-big-decimal";
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
  .map((s) => s.split(": "));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let monkeys = {};
contents.forEach((line) => {
  let nm = line[0];
  let vl = trnum(line[1]);
  if (typeof vl === "number") {
    monkeys[nm] = vl;
  } else {
    let parts = vl.split(" ");
    monkeys[nm] = parts;
  }
});

//dbg(monkeys);
function calc(nm) {
  if (!isArray(monkeys[nm])) {
    return monkeys[nm];
  } else {
    let opp = monkeys[nm];
    let left = calc(opp[0]);
    let right = calc(opp[2]);
    switch (opp[1]) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
    }
  }
}

let ans1 = calc("root");
answer(1, ans1);

function tbi(v) {
  if (typeof v === "object") {
    return `(new bigDecimal(${v.getValue()}))`;
  } else return v;
}

function symcalc(nm) {
  if (nm === "humn") {
    return "new bigDecimal(X)";
  } else if (isNumber(monkeys[nm])) {
    return new bigDecimal(monkeys[nm]);
  } else {
    let opp = monkeys[nm];
    let left = symcalc(opp[0]);
    let right = symcalc(opp[2]);
    if (nm === "root") {
      if (typeof left === "object") {
        return [left, right];
      } else {
        return [right, left];
      }
    }
    if (typeof left === "object" && typeof right === "object") {
      switch (opp[1]) {
        case "+":
          return left.add(right);
        case "-":
          return left.subtract(right);
        case "*":
          return left.multiply(right);
        case "/":
          return left.divide(right, 200);
      }
    } else {
      switch (opp[1]) {
        case "+":
          return `${tbi(left)}.add(${tbi(right)})`;
        case "-":
          return `${tbi(left)}.subtract(${tbi(right)})`;
        case "*":
          return `${tbi(left)}.multiply(${tbi(right)})`;
        case "/":
          return `${tbi(left)}.divide(${tbi(right)}, 200)`;
      }
    }
  }
}

let eq = symcalc("root");
let ricalc = eval(`bigDecimal => X => ${eq[1]}`);
ricalc = ricalc(bigDecimal);
let diff = ricalc(1).subtract(ricalc(0));
let base = ricalc(0);
answer(2, eq[0].subtract(base).divide(diff, 100).floor().getValue());
/*let bd = new bigDecimal(`12342342142342134.1231231313131313131313123`);
console.log(bd.divide(new bigDecimal(3), 100).getValue());*/
