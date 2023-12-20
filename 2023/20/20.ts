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
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let config = {}
contents.forEach((line) => {
  let [source, targets] = line.split(' -> ')
  let mType = source.charAt(0);
  let mName = source.slice(1);
  if (mType === 'b') mName = source;
  let dests = targets.split(', ')
  config[mName] = { mType, dests, state: 0, sources: [] }
});

Object.keys(config).forEach(module => {
  const mod = config[module]
  mod.dests.forEach(dst => {
    if (config[dst]) {
      config[dst].sources.push(module);
    }
  })
})

Object.keys(config).forEach(module => {
  const mod = config[module]
  if (mod.mType === '&') {
    mod.state = {};
    mod.sources.forEach(src => mod.state[src] = 0)
  } else {
    mod.state = 0;
  }
})

let lastConj = Object.keys(config).find(key => config[key].dests[0] === 'rx')

function sim(): any[] {
  let pulses = [['broadcaster', 0, 'button']];
  let low = 0;
  let high = 0;
  let bestState = null
  let bestCount = 0;
  while (pulses.length) {
    let pulse = pulses.shift()
    if (pulse[1] === 0) ++low;
    if (pulse[1] === 1) ++high;
    let pname = pulse[0]
    let module = config[pulse[0]];
    if (!module) {
      //dbg(pulse, 'UNKNOWN DEST')
      continue;
    }
    if (pulse[0]==='tg') {
      let count = Object.values(module.state).filter(vl => vl === 1).length
      if (count > bestCount) {
        bestCount = count;
        bestState = {...module.state};
      }
    }
    switch (module.mType) {
      case 'b': {
        module.dests.forEach(dst => {
          pulses.push([dst, module.state, pname])
        })
        break;
      }
      case '%': {
        if (pulse[1] === 0) {
          module.state = 1 - module.state;
          module.dests.forEach(dst => {
            pulses.push([dst, module.state, pname])
          })
        }
        break;
      }
      case '&': {
        module.state[pulse[2]] = pulse[1];
        let allset = Object.values(module.state).findIndex(vl => vl === 0) === -1
        module.dests.forEach(dst => {
          pulses.push([dst, allset?0:1, pname])
        })
        break;
      }
    }
  }
  return [low, high, bestState, bestCount]
}

let tlow = 0;
let thigh = 0;

let origConfig = _.cloneDeep(config)
config = _.cloneDeep(origConfig)

for(let i=0;i<1000;++i) {
  let rr = sim();
  //dbg(config['tg'].state)
  tlow+=rr[0];
  thigh+=rr[1];
}
answer(1, tlow*thigh)

config = _.cloneDeep(origConfig)

let loops: Record<string, number> = {}
for(let i=0;i<100000;++i) {
  let rr = sim();
  //dbg(config['tg'].state)
  tlow+=rr[0];
  thigh+=rr[1];
  if (rr[2]) {
    Object.keys(rr[2]).forEach(k => {
      if (rr[2][k] === 1)
      loops[k] = Math.min(loops[k] || Infinity, i+1);
    })
  }
}

/*
dbg(loops)
let loops = [4091, 4007, 3929, 3923]
*/
dbg(loops)
answer(2, Object.values(loops).reduce((a,b) => a*b))