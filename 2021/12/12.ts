import * as fs from "fs";
import HM from "hashmap";
import md5 from "js-md5";
import PQ from "js-priority-queue";
import _ from "lodash";
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

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)
  .map((ln) => ln.split("-"));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
/*contents.forEach((line) => {
  console.log(line);
});*/
let nodeList = [];
let hasCave = new HM();
contents.forEach((ln) => {
  ln.forEach((nd) => {
    if (!nodeList.includes(nd)) {
      nodeList.push(nd);
    }
  });
  hasCave.set(ln, 1);
  hasCave.set(ln.reverse(), 1);
});
//console.log(nodeList);
function isLower(str) {
  return /[a-z]+/.test(str);
}
const VISITS = 1;
function countPaths(snode, endnode, visited: HM<string, number>) {
  if (snode === endnode) {
    return 1;
  }
  let cv = visited.get(snode);
  if (isLower(snode)) {
    visited.set(snode, cv ? cv + 1 : 1);
  }
  let adjs = nodeList
    .filter((nd) => hasCave.has([snode, nd]))
    .filter((nd) => {
      let ncv = visited.get(nd) || 0;
      if (nd === "start" && ncv > 0) return false;
      if (ncv < VISITS) return true;
      return false;
    });
  let subAns = 0;
  adjs.forEach((adj) => {
    subAns += countPaths(adj, endnode, visited);
  });
  visited.set(snode, cv);
  return subAns;
}

function countPaths2(
  snode,
  endnode,
  visited: HM<string, number>,
  usedTwice: boolean
) {
  if (snode === endnode) {
    return 1;
  }
  let cv = visited.get(snode);
  if (isLower(snode)) {
    visited.set(snode, cv ? cv + 1 : 1);
  }
  let adjs = nodeList
    .filter((nd) => hasCave.has([snode, nd]))
    .filter((nd) => {
      let ncv = visited.get(nd) || 0;
      if (nd === "start" && ncv > 0) return false;
      if (ncv < VISITS) return true;
      if (ncv === VISITS && !usedTwice) return true;
      return false;
    });
  let subAns = 0;
  adjs.forEach((adj) => {
    let ncv = visited.get(adj) || 0;
    subAns += countPaths2(adj, endnode, visited, ncv === VISITS || usedTwice);
  });
  visited.set(snode, cv);
  return subAns;
}

console.log(countPaths("start", "end", new HM()));
console.log(countPaths2("start", "end", new HM(), false));
