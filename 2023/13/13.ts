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
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let patterns = [];
let pattern = [];
contents.forEach((line) => {
  if (line === '') {
    patterns.push(pattern);
    pattern = [];
  } else {
    pattern.push(line.split(''))
  }
});
if (pattern.length) patterns.push(pattern)

function reflect(lines: string[]) {
  let mirrors = [];
  for(let i=1;i<lines.length;++i) {
    let mirror = true;
    for(let j=0;j<lines.length;++j) {
      if (lines[i-j] && lines[i+j-1] && lines[i-j] !== lines[i+j-1])  {
        mirror = false;
      }
    }
    if (mirror) mirrors.push(i)
  }
  return mirrors
}

let a1 = 0;
let s1 = patterns.map(pattern => {
  let row = reflect(pattern.map(pp => pp.join('')))
  let ans = 0;
  row.map(rr => rr*100).forEach(rr => ans+=rr)
  let col = reflect(pattern[0].map((pp, pi) => {
    return pattern.map(pr => pr[pi]).join('')
  }))
  col.forEach(cl => ans+=cl)
  a1+=ans;
  return ans;
})

answer(1, a1)
DEBUG=false

let a2 = 0;
let sols = patterns.map((pattern, pai) => {
  dbg(pai, 'PATTERN')
  for(let i=0;i<pattern.length;++i) {
    for(let j=0;j<pattern[0].length;++j) {
      let orig = _.get(pattern, [i, j])
      let patch = '';
      if (orig === '#') patch = '.'; else patch = '#'
      _.set(pattern, [i, j], patch)

      let row = reflect(pattern.map(pp => pp.join('')))

      let col = reflect(pattern[0].map((pp, pi) => {
        return pattern.map(pr => pr[pi]).join('')
      }))
      if (row.length  + col.length >0) {
        let ro = row.map(rr => rr*100).filter(rr => rr !== s1[pai])
        let co = col.filter(cl => cl !== s1[pai])
        dbg([ro, co])
        let ans = [...ro, ...co]
        if (ans.length) {
          return ans[0]
        }
      }
      _.set(pattern, [i, j], orig)
    }
  }
})

a2 = sols.reduce((a, b) => a+b)

answer(2, a2)