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

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/,? /).map(Number));

let adj = new Array(contents.length);
for(let i=0;i<adj.length;++i) {
    adj[i] = new Array(contents.length);
    _.fill(adj[i], Infinity);
}

contents.forEach(line => {
    line.slice(2).forEach(v => {
        adj[line[0]][v] = 1;
    })
})
let l = contents.length;

function flood(v) {
    let open = new PQ();
    let closed = new HM();
    adj[v][v] = 0;
    open.queue(v);
    while(open.length>0) {
        let cv = open.dequeue();
        //console.log(cv);
        //console.log(adj[cv]);
        adj[cv].forEach((_val,av) => {
            if (adj[cv][av]<Infinity&&!closed.has(av)) {
                open.queue(av);
                adj[v][av] = adj[v][cv] + 1;
                adj[av][v] = adj[v][av];
            }
        })
        closed.set(cv, adj[v][cv]);
    }
    //console.log(adj);
}

//flood(0);

let groups = new Array(l);

for(let g=0;g<l;++g) {
    if (groups[g]==null) {
        flood(g);
        for(let i=0;i<l;++i) {
            if (adj[g][i]<Infinity) {
                groups[i] = g;
            }
        }
        //console.log(groups);
    }
}

let a1 = 0;
let difgroups = [];
for(let i=0;i<l;++i) {
    if (groups[i] === 0) a1+=1;
    if (difgroups.indexOf(groups[i])==-1) {
        difgroups.push(groups[i]);
    }
}
//console.log(groups);
console.log(a1);
console.log(difgroups.length);