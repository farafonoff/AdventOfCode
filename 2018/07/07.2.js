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
var step = 0;
var result = "";
function dur(node) {
    return 61+node.charCodeAt(0)-"A".charCodeAt(0);
}
var workers = 5;
while((Object.keys(incomplete).length>0||Object.keys(opened).length>0)&&step<200000) {
    Object.keys(opened).forEach(node => {
        opened[node]--;
        if (opened[node]===0) {
            delete opened[node];
            completed[node] = 1;
        }
    })
    var candidates = Object.keys(incomplete).filter(node => {
        var deps = Object.keys(graph[node]).filter(inode => {
            return !!!completed[inode];
        })
        return deps.length === 0;
    })
    candidates.sort();
    while(candidates.length&&Object.keys(opened).length<workers) {
        var cd = candidates.splice(0,1)[0];
        opened[cd] = dur(cd);
        delete incomplete[cd];
    }
    console.log(step);    
    console.log("C",completed)    
    console.log("O",opened);
    console.log("I",incomplete);
    ++step;
}
console.log(step-1);

