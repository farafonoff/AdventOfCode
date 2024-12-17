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

const up = ([a,b]) => [a-1, b];
const down = ([a,b]) => [a+1, b];
const left = ([a,b]) => [a, b-1];
const right = ([a,b]) => [a, b+1];
const dirs = [up, down, left, right]

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
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let registers = {
  A: 0,
  B: 0,
  C: 0,
  pc: 0,
}
let program = [];
let rezs = [];

function combo(registers, opval) {
  switch (opval) {
    case 0: return 0;
    case 1: return 1;
    case 2: return 2;
    case 3: return 3;
    case 4: return registers.A;
    case 5: return registers.B;
    case 6: return registers.C;
    case 7: throw 'Invalid combo';
  }
}

function adv(registers, operand) {
  let res = Math.floor(registers.A / 2**combo(registers, operand));
  registers.A = res;
  return registers;
}

function bxl(registers, operand) {
  let res = registers.B ^ operand;
  registers.B = res;
  return registers;
}

function bst(registers, operand) {
  let res = combo(registers, operand) % 8;
  registers.B = res;
  return registers;
}

function jnz(registers, operand) {
  if (registers.A !== 0) {
    registers.pc = operand - 2;
  }
  return registers;
}

function bxc(registers, operand) {
  let res = registers.B ^ registers.C;
  registers.B = res;
  return registers;
}

function out(registers, operand) {
  let outp = combo(registers, operand) % 8;
  rezs.push(outp);
  //console.log(outp);
  return registers;
}

function bdv(registers, operand) {
  let res = Math.floor(registers.A / 2**combo(registers, operand));
  registers.B = res;
  return registers;
}

function cdv(registers, operand) {
  let res = Math.floor(registers.A / 2**combo(registers, operand));
  registers.C = res;
  return registers;
}

let ops = [adv, bxl, bst, jnz, bxc, out, bdv, cdv];


contents.forEach((line) => {
  if (line.startsWith('Register')) {
    let [regName, regVal] = line.split(/[: ]+/).slice(1);
    registers[regName] = Number(regVal);
  }
  if (line.startsWith('Program')) {
    program = line.split(/[ ,]+/).map(Number);
    program.shift();    
  }
});

dbg(registers);
dbg(program);

function runProgram(registers, program) {
  while (registers.pc < program.length) {
    let op = program[registers.pc];
    let operand = program[registers.pc + 1];
    //console.log(`PC: ${registers.pc} OP: ${ops[op].name} OPERAND: ${operand}`);
    let opfn = ops[op];
    registers = opfn(registers, operand);
    registers.pc += 2;
  }
  return rezs;
}

function solve1(registers, program) {
  let rezs = runProgram({
    ...registers
  }, program);
  answer(1, rezs.join(','));
}

DEBUG = false;
solve1(registers, program);



let oseq = [];

function subProgram(areg1) {
  do {
    let bst = areg1 % 8;
    let bxl = bst ^ 2;
    let cdv = Math.floor(areg1 / (2**bxl)) % 8;
    let bxc = bxl ^ cdv;
    let bxl2 = bxc ^ 7;
    let out = bxl2 % 8;
    //console.log({areg1, ad: bst, bxl, cdv, bxc, bxl2, out: bxl2 % 8});
    oseq.push(out);
    areg1 = Math.floor(areg1 / 8);
  } while (areg1 > 0);
  return oseq;
}

let candidates = [];
let rseq = [...program].reverse();
function brute2(a) {
  for(let next = 0; next < 8; ++next) {
    let at = a*8 + next;
    oseq = [];
    DEBUG = false;
    oseq = subProgram(at);
    DEBUG = true;
    let err = oseq.reverse().some((val, idx) => val !== rseq[idx]);
    if (!err) {
      if (oseq.length < rseq.length) {
        brute2(at);
      } else {
        if (oseq.length === rseq.length) {
          candidates.push(at);
        }
      }
    }
  }
}

DEBUG = true;
answer(1, subProgram(61657405).join(','));
brute2(0);

let uniq = [...new Set(candidates)];
let ans2 = Math.min(...candidates);
console.log(uniq)
answer(2, ans2);