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
let computerSet = new Set<string>();
let linkMap = new HM<[string,string], boolean>();
let linksOf = new HM<string, Set<string>>();
let links = []
contents.forEach((line) => {
  let link = line.split('-')
  computerSet.add(link[0]);
  computerSet.add(link[1]);
  let llink = [link[0], link[1]]
  linkMap.set([link[0], link[1]], true)
  linkMap.set([link[1], link[0]], true)
  linksOf.set(link[0], (linksOf.get(link[0]) || new Set()).add(link[1]));
  linksOf.set(link[1], (linksOf.get(link[1]) || new Set()).add(link[0]));
  links.push(llink);
});

let triplets = new Set<string>();

links.forEach(ll => {
  for(let comp of linksOf.get(ll[0])) {
    //dbg({ll, comp})
    if (comp !== ll[0] && comp !== ll[1] && linkMap.get([ll[0], comp]) === true && linkMap.get([ll[1], comp]) === true) {
      let triplet = [ll[0], ll[1], comp];
      triplet.sort();
      triplets.add(triplet.join('-'))
    }
  }
})

//triplets = _.uniqWith(triplets, _.isEqual)

let ans1 = 0;
dbg(triplets.size, 'TRIPLETS')
triplets.forEach(trp => {
  let triplet = trp.split('-')
  if (triplet.some(tv => tv.startsWith('t'))) {
    ans1 += 1;
  }
})

answer(1, ans1)

let clusters = new Set<string>(triplets);

DEBUG = false;
computerSet.forEach(comp => {
  let nextClusters = new Set<string>();
  dbg(comp, 'COMP')
  clusters.forEach(clust => {
    let parts = new Set(clust.split('-'))
    dbg({comp, parts})
    if (!parts.has(comp)) {
      dbg({comp, parts})
      if ([...parts].every(part => linksOf.get(comp).has(part))) {
        parts.add(comp)
        let aparts = [...parts];
        aparts.sort();
        nextClusters.add(aparts.join('-'))
      } else {
        nextClusters.add(clust)
      }
    } else {
      nextClusters.add(clust)
    }
  })
  clusters = nextClusters;
})

DEBUG = false;
dbg(clusters, 'CLUSTERS')
let arrCl = [...clusters]
let bestCluster = arrCl[0];
arrCl.forEach(cl => {
  if (cl.length > bestCluster.length) {
    bestCluster = cl;
  }
})
//clusters.forEach()
//let bestCluster = 'ar-ep-ih-ju-jx-le-ol-pk-pm-pp-xf-yu-zg'
answer(2, bestCluster.split('-').join(','))