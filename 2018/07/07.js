const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
const _ = require('lodash')
function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}
var re = /Step (.) must be finished before step (.) can begin./
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
var graph = {}
var incomplete = {}
var opened = {}
var completed = {}
contents.forEach(line => {
    let match = re.exec(line);
    if (match) {
        let [dst,src] = match.slice(1);
        graph[dst] = graph[dst]||{};
        graph[src] = graph[src]||{};
        graph[src][dst] = 1;
        incomplete[src] = 1;
        incomplete[dst] = 1;
    }
})
console.log(graph);
var root = Object.keys(graph).sort().find(node => Object.keys(graph[node]).length===0);
opened[root] = 1;
var step = 0;
var result = "";
while(Object.keys(incomplete).length>0&&step<200) {
    var openeds = Object.keys(opened).sort();
    var target = openeds[0];
    result+=target;
    delete opened[target];
    completed[target] = 1;
    delete incomplete[target];
    var candidates = Object.keys(incomplete).filter(node => {
        var deps = Object.keys(graph[node]).filter(inode => {
            return !!!completed[inode];
        })
        return deps.length === 0;
    })
    candidates.forEach(node => opened[node] = 1);
    ++step;
}
console.log(result);

