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
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let ivals = {}
let opers = {}
let IBITS = 0;
contents.forEach((line) => {
  if (line.indexOf(':') >=0) {
    let [reg, ival] = line.split(': ')
    ivals[reg] = Number(ival)
    if (reg.startsWith('x')) {
      IBITS = Math.max(IBITS, Number(reg.slice(1)));
    }
  }
  if (line.indexOf('->') >= 0) {
    // ntg XOR fgs -> mjb
    let [r1, op, r2, arrow, rp] = line.split(' ')
    opers[rp] = [r1, op, r2]
  }
});
/*
swap('z10', 'kmb')
swap('z15', 'tvp')
swap('z25', 'dpg')
*/

function swap(w1, w2) {
  let [t1, t2] = [opers[w1], opers[w2]];
  opers[w1] = t2;opers[w2] = t1;
  //dbg({t1, t2})
}

let opMap = {
  'OR' : '|',
  'AND': '&',
  'XOR': '^'
}

function buildLine(sreg) {
  if (opers[sreg]) {
    let prd = opers[sreg];
    return `(${buildLine(prd[0])} ${opMap[prd[1]]} ${buildLine(prd[2])})`
  } else {
    return ivals[sreg]
  }
}

function calc(sreg) {
  if (opers[sreg]) {
    let prd = opers[sreg];
    switch(prd[1]) {
      case 'OR':
        return calc(prd[0]) | calc(prd[2]);
      case 'AND':
        return calc(prd[0]) & calc(prd[2]);
      case 'XOR':
        return calc(prd[0]) ^ calc(prd[2]);
    }
  } else {
    return ivals[sreg]
  }
}


let zbits = Object.keys(opers).filter(k => k.startsWith('z'))
zbits.sort()
//let resbits = []
let dpow = 1;
let decimal = 0;
for(let zbit of zbits) {
  let cres = calc(zbit);
  decimal += cres * dpow;
  dpow *= 2
}

answer(1, decimal)

function buildLine2(sreg) {
  if (opers[sreg]) {
    let prd = opers[sreg];
    return `(${buildLine2(prd[0])} ${opMap[prd[1]]} ${buildLine2(prd[2])})`
  } else {
    return sreg
  }
}
/*
zbits.forEach(zb => {
  dbg(buildLine2(zb), zb)
})
*/
function dumpGraph() {
  let graph = "digraph G { rankdir=LR; \n";
  Object.keys(opers).forEach((key) => {
    let [r1, op, r2] = opers[key];
    graph += `  "${r1}" -> "${key}" [label="${op}"];\n`;
    graph += `  "${r2}" -> "${key}" [label="${op}"];\n`;
  });
  graph += "}\n";
  console.log(graph); 
}

function calc2(xregs, yregs) {
  function calc(sreg) {
    if (opers[sreg]) {
      let prd = opers[sreg];
      switch(prd[1]) {
        case 'OR':
          return calc(prd[0]) | calc(prd[2]);
        case 'AND':
          return calc(prd[0]) & calc(prd[2]);
        case 'XOR':
          return calc(prd[0]) ^ calc(prd[2]);
      }
    } else {
      if (sreg.startsWith('x')) {
        return xregs[Number(sreg.slice(1))]
      }
      if (sreg.startsWith('y')) {
        return yregs[Number(sreg.slice(1))]
      }
    }
  }
  let output = zbits.map(zb => calc(zb))
  return output
}

function calc21(xregs, yregs, zreg) {
  let resCache = new Map<string, number>();
  function calc(sreg) {
    if (resCache.has(sreg)) {
      let result = resCache.get(sreg);
      if (result < 0) {
        throw { my: true, loop: true }
      }
      return result;
    }
    let result;
    if (opers[sreg]) {
      let prd = opers[sreg];
      resCache.set(sreg, -1)
      switch(prd[1]) {
        case 'OR':
          result = calc(prd[0]) | calc(prd[2]);
          break;
        case 'AND':
          result = calc(prd[0]) & calc(prd[2]);
          break;
        case 'XOR':
          result = calc(prd[0]) ^ calc(prd[2]);
          break;
      }
    } else {
      if (sreg.startsWith('x')) {
        result = xregs[Number(sreg.slice(1))]
      }
      if (sreg.startsWith('y')) {
        result = yregs[Number(sreg.slice(1))]
      }
    }
    resCache.set(sreg, result);
    return result;
  }
  return calc(zreg)
}

let candidates = new Set<number>();
for(let x1 = 0;x1 <= IBITS; ++x1) {
  let xregs = new Array(IBITS + 1).fill(0);
  let yregs = new Array(IBITS + 1).fill(0);
  xregs[x1] = 1;
  //dbg(xregs.join(''))
  //dbg(calc2(xregs, yregs).join(''))
  let zr = calc2(xregs, yregs);
  if (!xregs.every((xv, xi) => zr[xi] === xv)) {
    candidates.add(x1)
  }
}


function getDependencies2(reg) {
  let res = new Set<string>();
  let op = opers[reg];
  if (op) {
    res.add(op[0])
    res.add(op[2])
    let dep1 = getDependencies2(op[0])
    let dep2 = getDependencies2(op[2])
    dep1.forEach(d => res.add(d));
    dep2.forEach(d => res.add(d));  
  }
  res.add(reg);
  return res;
}

function getDependencies(reg) {
  let res = getDependencies2(reg)
  res.forEach(rr => {
    if (rr.startsWith('x') || rr.startsWith('y')) {
      res.delete(rr)
    }
  })
  return res;
}

function hasGoodDependencies(reg, bitNumber) {
  let deps = getDependencies2(reg)
  let darr = []
  deps.forEach(rr => {
    if (rr.startsWith('x') || rr.startsWith('y')) {
      darr.push(rr);
    }
  })
  let good = darr.every(rv => Number(rv.slice(1)) <= bitNumber)
  return good;
}

function unitTest(regN, xv, yv, tv) {
  //dbg({regN, xv, yv, tv}, 'UNIT TEST')
  let xregs = new Array(IBITS + 1).fill(0);
  let yregs = new Array(IBITS + 1).fill(0);
  if (regN > 0) {
    xregs[regN-1] = tv;
    yregs[regN-1] = tv;
  }
  xregs[regN] = xv;
  yregs[regN] = yv;
  let out = calc21(xregs, yregs, zbits[regN]);
  //dbg({out})
  let ev = (xv + yv + tv) % 2;
  if (out !== ev) {
    throw {
      my: true,
      message: 'bad bit',
      bit: regN
    }
  }
}

function testBits(regN) {
  for(let xv = 0;xv<=1;++xv) {
    for(let yv = 0;yv<=1;++yv) {
      if (regN > 0) {
        for(let tv = 0;tv<=1;++tv) {
          unitTest(regN, xv, yv, tv)
        }
      } else {
        unitTest(regN, xv, yv, 0)
      }
    }
  }
}

function subtractSets(setA: Set<string>, setB: Set<string>): Set<string> {
  let result = new Set<string>(setA);
  setB.forEach(item => result.delete(item));
  return result;
}

let resultss = []
function findFixes(startBit, swaps: [string, string][]) {
  if (swaps.length > 4) {
    return false;
  }
  dbg({startBit, swaps}, '==== findFixes')
  let done = false;
  let badBit = 0;
  let wasLoop = false;
  try {
    for(let outreg = 0;outreg<IBITS+1;++outreg) {
      testBits(outreg);
    }
    done = true;
    resultss.push(swaps)
    dbg('========== SUCCESS')
    dbg(swaps)
    // dumpGraph()
  } catch (myError) {
    if (!myError.my) {
      throw myError;
    }
    badBit = myError.bit
    wasLoop = myError.loop
  }
  if (wasLoop) {
    return false;
  }
  if (!done) {
    dbg(badBit, '==== BAD BIT')
    let goodWires = getDependencies(zbits[badBit-1])
    let tryWires = getDependencies(zbits[badBit])
    tryWires = subtractSets(tryWires, goodWires);
    let allWires = getDependencies(zbits[IBITS + 1])
    let otherWires = subtractSets(allWires, goodWires);
    otherWires = new Set([...otherWires].filter(wr => hasGoodDependencies(wr, badBit)));
    //let possibleSwaps = []
    dbg(tryWires, 'TRY WIRES')
    dbg(otherWires, 'OTHER WIRES')
    for(let wire of tryWires) {
      for(let owire of otherWires) {
        if (wire !== owire) {
          /*let hadSwap = swaps.findIndex((sw: [string, string]) => {
            return _.isEqual(sw, [wire, owire]) || _.isEqual(sw, [owire, wire])
          })
          if (hadSwap>=0) {
            continue;
          }*/
          let oldSwaps = new Set(swaps.flat())
          if (oldSwaps.has(wire) || oldSwaps.has(owire)) {
            continue
          }
          dbg({wire, owire, badBit}, 'TRY SWAP')
          swap(wire, owire);
          try {
            testBits(badBit);
            findFixes(badBit, [...swaps, [wire, owire]])
          } catch (ignoreError) {}
          swap(wire, owire)
          /*let passed = false;
          try {
            //dbg(badBit, 'RETESTING')
            testBits(badBit)
            //dbg(badBit, 'RETESTED')
            passed = true
            dbg({wire, owire, badBit}, 'SWAP PASSED')
          } catch(sameError) {
            //dbg({wire, owire, badBit}, 'BAD SWAP')
            swap(wire, owire) // swap back
          }
          if (passed) {
            findFixes(badBit, [...swaps, [wire, owire]])
          }*/
        }
      }
    }
  }
}
DEBUG = false
try {
  findFixes(0, []);
} catch (leftError) {
  console.log(leftError)
}

resultss.forEach(resLine => {
  console.log(resLine)
  let flat = resLine.flat()
  flat.sort()
  answer(2, flat.join(','))
})
/*
while (true) {
  try {
    for(let outreg = 0;outreg<IBITS+2;++outreg) {
      testBits(outreg);
    }
    break;
  } catch (myError) {
    dbg(myError.bit, myError.message)
    let badBit = myError.bit;
    let goodWires = getDependencies(zbits[badBit-1])
    let tryWires = getDependencies(zbits[badBit])
    tryWires = subtractSets(tryWires, goodWires);
    let allWires = getDependencies(zbits[IBITS + 1])
    let otherWires = subtractSets(allWires, goodWires);
    tryWires.forEach(tw => {
      otherWires.forEach(ow => {
        if (tw!==ow) {

        }
      })
    })
    break;
  }  
}*/

//dbg(getDependencies("z01"))

/*
for(let x1 = 0;x1 <= IBITS; ++x1) {
  let xregs = new Array(IBITS + 1).fill(0);
  let yregs = new Array(IBITS + 1).fill(0);
  yregs[x1] = 1;
  //dbg(xregs.join(''))
  //dbg(calc2(xregs, yregs).join(''))
  let zr = calc2(xregs, yregs);
  if (!yregs.every((xv, xi) => zr[xi] === xv)) {
    console.log(x1)
  }
}
*/
/*
dbg(candidates)
candidates.forEach(rr => {
  let xregs = new Array(IBITS + 1).fill(0);
  let yregs = new Array(IBITS + 1).fill(0);
  xregs[rr] = 1;
  let ones = Object.keys(opers).flatMap(op => calc21(xregs, yregs, op) === 1?[op]:[])
  dbg(ones, 'ones')
})
  */

