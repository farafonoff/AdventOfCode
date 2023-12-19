import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _, { range } from "lodash";
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
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let flows = {}
let items = [];
let re1 = /(\w+)([<>])(-?\d+):(\w+)/;
contents.forEach((line) => {
  if (line.startsWith('{')) {
    let data = line.split(/[{}]/)
    let tokens = data[1].split(',').map(dd => dd.match(/(\w+)=(\d+)/).slice(1))
    let item = {}
    tokens.forEach(tok => item[tok[0]] = Number(tok[1]))
    items.push(item)
  } else {
    let [name, ruleset] = line.split(/[{}]/)
    let rulesS = ruleset.split(',')
    let ruleParts = rulesS.map(rule => {
      let matches = rule.match(re1)
      if (!matches) return [rule];
      return matches.slice(1)
    });
    dbg(ruleParts);
    flows[name] = ruleParts;
  }
});

dbg(items)
dbg(flows)

const INITIAL = 'in'

function mmmm(item, rule) {
  let vl = Number(rule[2])
  switch(rule[1]) {
    case '>': {
      if (item[rule[0]]>vl) return true;
      return false;
    }
    case '<': {
      if (item[rule[0]]<vl) return true;
      return false;
    }
  }
}

let accepted = []

items.forEach(item => {
  let workflow = INITIAL;
  let wf = flows[workflow];
  while (wf && workflow!== 'A' && workflow !== 'R') {
    wf = flows[workflow]
    dbg(wf, workflow)
    for(let i=0;i<wf.length;++i) {
      if (wf[i].length > 1) {
        if (mmmm(item, wf[i])) {
          workflow = wf[i][3];
          break;
        }
      } else {
        workflow = wf[i][0]
      }
    }
  }
  if (workflow === 'A') {
    accepted.push(item);
  }
})

let ans1 = 0;
accepted.forEach(item => Object.values(item).forEach(val => ans1+=Number(val)))
answer(1, ans1)

let keys = ['x','m','a','s'];
let initialCube = [{x:1, m: 1, a: 1, s: 1}, {x:4000, m: 4000, a: 4000, s: 4000}]

function rapply(cond, cubes) {
  let ifT = [], ifF = []
  let [vr, sign, vvvv, result] = cond;
  let value = Number(vvvv);
  cubes.forEach(cub => {
    if (mmmm(cub[0], cond)&&mmmm(cub[1], cond)) {
      ifT.push(cub);
    } else
    if (!(mmmm(cub[0], cond)||mmmm(cub[1], cond))) {
      ifF.push(cub);
    } else {
      let truthy = _.cloneDeep(cub);
      let falsy = _.cloneDeep(cub);
      if (sign === '<') {
        truthy[1][vr]=value-1;
        falsy[0][vr]=value;
      }
      if (sign === '>') {
        truthy[0][vr]=value+1;
        falsy[1][vr]=value;
      }
      ifT.push(truthy)
      ifF.push(falsy)
    }
  })
  dbg(JSON.stringify({cond, ifT, ifF}, null, 2));
  return {ifT, ifF};
}

let solve2 = (wfName, cubes) => {
  dbg(cubes, wfName)
  if (wfName === 'A') {
    return cubes;
  }
  if (wfName === 'R') {
    return [];
  }
  let flow = flows[wfName];
  let accepteds = []
  let remaining = [...cubes];
  flow.forEach(cond => {
    if (cond.length === 1) {
      accepteds= [...accepteds, ...solve2(cond[0], remaining)]
    } else {
      let { ifT, ifF } = rapply(cond, remaining);
      remaining = ifF;
      accepteds= [...accepteds, ...solve2(cond[3], ifT)]
    }
  })
  return accepteds;
}

let result = solve2('in', [initialCube]);
dbg(JSON.stringify(result, null, 2));

let ans2 = 0;
result.forEach(cube => {
  let vol = 1;
  keys.forEach(key => {
    vol = vol*(cube[1][key]-cube[0][key] + 1);
  })
  ans2 += vol;
})

answer(2, ans2)