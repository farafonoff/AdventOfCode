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
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let nodes = []
let sedges = []
let edges = []
contents.forEach((line) => {
  const [left, rightS] = line.split(': ')
  const right = rightS.split(' ')
  nodes.push(left)
  const ln = nodes.length-1;
  right.forEach(r => {
    const lr = nodes.length;
    nodes.push(r)
    edges.push([ln, lr])
    sedges.push([left, r])
    sedges.push([left, r])
  })
});

dbg(nodes.length)
dbg(sedges.length)

function findBridge(adjMatrix) {
  let time = 0;
  let low = {}
  let disc = {}
  let visited = {}
  let bridges = []
  function dfs(current, parent = null) {
    ++time;
    visited[current] = true;
    disc[current] = time;
    low[current] = time;
    adjMatrix[current].forEach(node => {
      if (node === parent) {
        return;
      }
      if (!visited[node]) {
        dfs(node, current)
        low[current] = Math.min(low[current], low[node])
        if (disc[current]<low[node]) {
          bridges.push([current, node])
        }
      } else {
        low[current] = Math.min(low[current], disc[node])
      }
    })
  }
  dfs(Object.keys(adjMatrix)[0])
  return bridges;
}

let adj: Record<string, Set<string>> = {}
sedges.forEach((ed, iv) => {
  adj[ed[0]] = adj[ed[0]] || new Set()
  adj[ed[0]].add(ed[1])
  adj[ed[1]] = adj[ed[1]] || new Set()
  adj[ed[1]].add(ed[0])
})
/*let edi = ['hfx','pzl']
let edii = ['bvb', 'cmg']
adj[edi[0]].delete(edi[1])
adj[edi[1]].delete(edi[0])
adj[edii[0]].delete(edii[1])
adj[edii[1]].delete(edii[0])
findBridge(adj);*/
function compSize(snode, adj) {
  let visited = {}
  function dfs(node) {
    visited[node] = true;
    adj[node].forEach(child => {
      if (!visited[child]) {
        dfs(child)
      }
    })
  }
  dfs(snode)
  return Object.keys(visited).length
}
let walks = new HM<string[], number>()
sedges.forEach(edg => walks.set(edg, 0))
for(let monte = 0; monte<10000;++monte) {
  let keyCount = Object.keys(adj).length
  let rnd = Math.floor(Math.random()*keyCount)
  if (rnd === keyCount) --rnd;
  let snode = Object.keys(adj)[rnd]
  let visited = {}
  function dfs(dnode: string) {
    visited[dnode] = true
    let edgs = adj[dnode]
    let adjj;
    let ernd;
    adjj = [...edgs].filter(edg => !visited[edg])
    if (adjj.length === 0) return;
    ernd = Math.floor(Math.random() * adjj.length)
    if (ernd === adjj.length) --ernd;
    let child = adjj[ernd]
    let pair1 = [dnode, child]
    let pair2 = [child, dnode]
    if (walks.has(pair1)) {
      let ov = walks.get(pair1) as number;
      walks.set(pair1, ov + 1)
    }
    if (walks.has(pair2)) {
      let ov = walks.get(pair2) as number;
      walks.set(pair2, ov + 1)
    }
    dfs(child)
  }
  dfs(snode)
}
dbg(walks.keys())
dbg(walks.values())
const sortedEdges = [...walks.keys()]
sortedEdges.sort((a,b) => walks.get(b)-walks.get(a))
/*sortedEdges.forEach((edge) => {
  dbg([edge, walks.get(edge)])
})*/

for(let i=0;i<sortedEdges.length;++i) {
  let edi = sortedEdges[i];
  adj[edi[0]].delete(edi[1])
  adj[edi[1]].delete(edi[0])
  for(let ii=i+1;ii<sortedEdges.length;++ii) {
    let edii = sortedEdges[ii];
    adj[edii[0]].delete(edii[1])
    adj[edii[1]].delete(edii[0])
    let bridges = findBridge(adj);
    if (bridges.length) {
      let bridge = bridges[0];
      adj[bridge[0]].delete(bridge[1])
      adj[bridge[1]].delete(bridge[0])
      let parts = bridge.map(node => compSize(node, adj))
      dbg(parts)
      answer(1, parts[0] * parts[1])
      adj[bridge[0]].add(bridge[1])
      adj[bridge[1]].add(bridge[0])
    }
    adj[edii[0]].add(edii[1])
    adj[edii[1]].add(edii[0])
  }
  adj[edi[0]].add(edi[1])
  adj[edi[1]].add(edi[0])
}
