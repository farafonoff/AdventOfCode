import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { result } from "lodash";
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
  .map((s) => s.split(" ").map(trnum));
function run(code: any[], input: number[]) {
  let state = {
    x: 0,
    y: 0,
    z: 0,
    w: 0,
  };
  function treg(vl) {
    if (typeof vl === "number") {
      return vl;
    } else {
      return state[vl];
    }
  }
  for (let op = 0; op < code.length; ++op) {
    let opr = code[op];
    switch (opr[0]) {
      case "inp": {
        state[opr[1]] = input.shift();
        break;
      }
      case "add": {
        state[opr[1]] += treg(opr[2]);
        break;
      }
      case "mul": {
        state[opr[1]] *= treg(opr[2]);
        break;
      }
      case "div": {
        state[opr[1]] = Math.trunc(state[opr[1]] / treg(opr[2]));
        break;
      }
      case "mod": {
        state[opr[1]] = state[opr[1]] % treg(opr[2]);
        break;
      }
      case "eql": {
        state[opr[1]] = state[opr[1]] === treg(opr[2]) ? 1 : 0;
        break;
      }
    }
    //dbg([opr, state]);
  }
  return state;
}

function incodeToJs(code: any[]) {
  let output = "let w=0;let x=0;let y=0;let z=0;let ii=0;";
  let ii = 0;
  for (let op = 0; op < code.length; ++op) {
    let opr = code[op];
    switch (opr[0]) {
      case "inp": {
        if (DEBUG) output += `console.log("INT", ii, [x, y, z]);`;
        output += `${opr[1]}=data[ii];++ii;\n`;
        break;
      }
      case "asg": {
        output += `${opr[1]}=${opr[2]};\n`;
        break;
      }
      case "nop": {
        output += "//\n";
        break;
      }
      case "add": {
        output += `${opr[1]}+=${opr[2]};\n`;
        break;
      }
      case "mul": {
        output += `${opr[1]}*=${opr[2]};\n`;
        break;
      }
      case "div": {
        output += `${opr[1]}=Math.trunc(${opr[1]}/${opr[2]});\n`;
        break;
      }
      case "mod": {
        output += `${opr[1]}=${opr[1]}%${opr[2]};\n`;
        break;
      }
      case "eql": {
        output += `${opr[1]}=${opr[1]}===${opr[2]}?1:0;\n`;
        break;
      }
    }
    //dbg([opr, state]);
  }
  output += "return { x, y, z, w }";
  //dbg(output);
  return new Function("data", output);
}

function intToCPP(code) {
  let output = "int w=0;int x=0;int y=0;int z=0;int di;";
  for (let op = 0; op < code.length; ++op) {
    let opr = code[op];
    switch (opr[0]) {
      case "inp": {
        output += `${opr[1]}=data[di];di+=1;\n`;
        break;
      }
      case "asg": {
        output += `${opr[1]}=${opr[2]};\n`;
        break;
      }
      case "nop": {
        output += "//\n";
        break;
      }
      case "add": {
        output += `${opr[1]}+=${opr[2]};\n`;
        break;
      }
      case "mul": {
        output += `${opr[1]}*=${opr[2]};\n`;
        break;
      }
      case "div": {
        output += `${opr[1]}=trunc(${opr[1]}/${opr[2]});\n`;
        break;
      }
      case "mod": {
        output += `${opr[1]}=${opr[1]}%${opr[2]};\n`;
        break;
      }
      case "eql": {
        output += `${opr[1]}=${opr[1]}==${opr[2]}?1:0;\n`;
        break;
      }
    }
    //dbg([opr, state]);
  }
  output += "return z";
  return `#include <cmath>
   #include <iostream>

   using namespace std;
   int run(vector<int> data) {
   ${output}
   }`;
  //dbg(output);
}

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
function optimize(contents) {
  return contents.map((inr) => {
    if (inr[0] === "mul" && inr[2] === 0) {
      return ["asg", inr[1], 0];
    }
    if (inr[0] === "div" && inr[2] === 1) {
      return ["nop"];
    }
    return inr;
  });
}
function extract(contents) {
  let parts = [];
  let part = 0;
  contents.forEach((inr) => {
    if (inr[0] !== "inp") {
      parts[part] = [...(parts[part] || []), inr];
    } else {
      ++part;
    }
  });
  let stack = [];
  let constraints = [];
  parts
    .filter((p) => !!p)
    .forEach((part, index) => {
      // [ 'div', 'z', 1 ], 'push' type block
      if (part[3][2] === 1) {
        // [ 'add', 'y', 2 ], z = z*26+w+C
        stack.unshift([index, part[14][2]]);
      } else {
        // [ 'div', 'z', 26 ], 'pop' type block
        let [rIndex, addOn] = stack.shift();
        // [ 'add', 'x', -8 ], w-C==z%26 ? z/=26
        let sub = part[4][2];
        constraints.push([index, addOn + sub, rIndex]);
      }
    });
  let constr = new HM<number, number[]>();
  constraints.forEach((cn) => {
    constr.set(cn[0], cn.slice(1));
  });
  return constr;
}
DEBUG = false;
let constraints = dbg(extract(contents));
//throw "done";
DEBUG = false;
let handopt = fs.readFileSync("parsed.js", "utf8");
let opti = optimize(contents);
let compiled = incodeToJs(contents);
let optic = incodeToJs(opti);
let handop = new Function("data", handopt);

//dbg(intToCPP(contents));
//dbg(compiled([7]));
//dbg(optic([7]));
let answers = [];
function brnumber(head: number[]) {
  if (head.length > 0) {
    let last = _.last(head);
    if (last < 1 || last > 9) {
      return false;
    }
  }
  if (head.length === 14) {
    //    dbg(head);
    //let phead = [...head].reverse();
    let phead = [...head];
    let valid = !_.some(phead, (v) => v < 0 || v > 9);
    if (!valid) {
      throw phead.join("");
    }
    //dbg(phead);
    //let str = compiled([...phead]);
    /*dbg(phead);
    let str0 = compiled([...phead]);
    let str1 = optic([...phead]);
    let str2 = handop([...phead]);
    dbg([str1, str2, str0]);
    if (str0["z"] === 0) {
      dbg(head);
      answer(1, phead.join(""));
      //throw phead.join("");
    }*/
    answers.push(phead.join(""));
    return;
  }
  if (constraints.has(head.length)) {
    let cval = constraints.get(head.length);
    let d = head[cval[1]] + cval[0];
    head.push(d);
    brnumber(head);
    head.splice(head.length - 1, 1);
    return;
  }
  /*if (head.length === 4) {
    let d = head[3] - 8;
    head.push(d);
    brnumber(head);
    head.splice(head.length - 1, 1);
    return;
  }
  if (head.length === 6) {
    let d = head[5] - 4;
    head.push(d);
    brnumber(head);
    head.splice(head.length - 1, 1);
    return;
  }
  if (head.length === 9) {
    let d = head[8];
    head.push(d);
    brnumber(head);
    head.splice(head.length - 1, 1);
    return;
  }
  if (head.length === 11) {
    let d = head[10] + 2;
    head.push(d);
    brnumber(head);
    head.splice(head.length - 1, 1);
    return;
  }
  if (head.length === 7) {
    let d = head[2] + 5;
    head.push(d);
    brnumber(head);
    head.splice(head.length - 1, 1);
    return;
  }
  if (head.length === 12) {
    let d = head[1] + 1;
    head.push(d);
    brnumber(head);
    head.splice(head.length - 1, 1);
    return;
  }
  if (head.length === 13) {
    let d = head[0] - 5;
    head.push(d);
    brnumber(head);
    head.splice(head.length - 1, 1);
    return;
  }*/
  for (let d = 9; d >= 0; --d) {
    head.push(d);
    brnumber(head);
    head.splice(head.length - 1, 1);
  }
}

brnumber([]);
answer(1, _.first(answers));
answer(2, _.last(answers));
