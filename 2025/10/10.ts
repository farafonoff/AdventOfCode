import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
import { init } from "z3-solver";
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
let lightPatterns = [];
let buttonPatterns = [];
let joltageRatings = [];
contents.forEach((line) => {
  let groups = line.split(' ');
  lightPatterns.push(groups[0].split('').slice(1,-1).join(''));
  let buttonGroups = groups.slice(1, -1);
  let buttonPattern = buttonGroups.map(g => {
    let bp = g.slice(1,-1).split(',').map(Number);
    return bp;
  });
  buttonPatterns.push(buttonPattern);
  joltageRatings.push(groups.slice(-1)[0].slice(1,-1).split(',').map(Number));
});

function solve1(lp, bp) {
  let solutions = new Map<string, number>();
  let open = new Set<string>();
  let initial = '.'.repeat(lp.length);
  open.add(initial);
  solutions.set(initial, 0);
  while(open.size > 0) {
    let nopen = new Set<string>();
    for(let key of open) {
      let value = solutions.get(key);
      let chars = key.split('');
      for(let b=0; b<bp.length; b++) {
        let nchars = [...chars];
        for(let i=0; i<bp[b].length; i++) {
          let pos = bp[b][i];
          nchars[pos] = nchars[pos] === '#' ? '.' : '#';
        }
        let nkey = nchars.join('');
        if (nkey === lp) {
          return value + 1;
        }
        if (!solutions.has(nkey)) {
          solutions.set(nkey, value + 1);
          nopen.add(nkey);
        }
      }
    }
    open = nopen;
  }
}

async function solve2(jr, bp, Z3) {
  // Use Z3 Optimize solver for integer linear programming
  // Variables: number of times each button is pressed
  // Constraints: sum of button presses must equal target for each counter
  // Objective: minimize total button presses
  
  const { Optimize, Int } = Z3;
  const opt = new Optimize();
  
  // Create integer variables for each button (number of presses)
  const buttonVars = bp.map((_, i) => Int.const(`b${i}`));
  
  // Constraint: each button press count must be >= 0
  buttonVars.forEach(bv => {
    opt.add(bv.ge(0));
  });
  
  // Constraint: for each counter, sum of button contributions must equal target
  for (let c = 0; c < jr.length; c++) {
    let sum: any = Int.val(0);
    for (let b = 0; b < bp.length; b++) {
      // Count how many times this button increments counter c
      const count = bp[b].filter(idx => idx === c).length;
      if (count > 0) {
        sum = sum.add(buttonVars[b].mul(count));
      }
    }
    opt.add(sum.eq(jr[c]));
  }
  
  // Minimize total button presses
  let totalPresses: any = Int.val(0);
  buttonVars.forEach(bv => {
    totalPresses = totalPresses.add(bv);
  });
  opt.minimize(totalPresses);
  
  // Solve
  if (await opt.check() === 'sat') {
    const model = opt.model();
    let result = 0;
    for (let b = 0; b < buttonVars.length; b++) {
      const val = model.eval(buttonVars[b]);
      result += Number(val.toString());
    }
    return result;
  }
  
  return -1;
}

let ans1 = 0;
lightPatterns.forEach((lp, idx) => {
  let bp = buttonPatterns[idx];
  let jr = joltageRatings[idx];
  let p1 = solve1(lp, bp);
  console.log(`Pattern ${idx + 1}: ${p1} presses`);
  ans1 += p1;
});
answer(1, ans1);

(async () => {
  const { Context } = await init();
  const Z3 = Context('main');
  
  let ans2 = 0;
  for (let idx = 0; idx < lightPatterns.length; idx++) {
    let lp = lightPatterns[idx];
    let bp = buttonPatterns[idx];
    let jr = joltageRatings[idx];
    let p2 = await solve2(jr, bp, Z3);
    console.log(`Pattern ${idx + 1}: ${p2} presses`);
    ans2 += p2;
  }
  answer(2, ans2);
})();