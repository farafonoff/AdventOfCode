//   3   00:09:28   248      0   00:13:00   186      0
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

var match = /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/
var table = new Array(1000*1000).fill(0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));

contents.forEach(line => {
    var parsed = match.exec(line);
    [l,t,w,h] = parsed.slice(2).map(Number);
    for(let i=l;i<l+w;++i) {
        for(let j=t;j<t+h;++j) {
            table[1000*i+j]++;
        }
    }
})
console.log(table.filter(v=>v>1).length)
contents.forEach(line => {
    var parsed = match.exec(line);
    [n,l,t,w,h] = parsed.slice(1).map(Number);
    let solution = true;
    for(let i=l;i<l+w;++i) {
        for(let j=t;j<t+h;++j) {
            if (table[1000*i+j]!=1) solution = false;
        }
    }
    if (solution) {
        console.log(n);
    }
})