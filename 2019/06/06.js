//  6   00:09:00   277      0   00:19:04   356      0
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

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(')'));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
let map = {};
contents.forEach(line => {
    let cen = line[0];
    let orb = line[1];
    if (!map[cen]) {
        map[cen] = [orb]
    } else {
        map[cen].push(orb);
    }
})
//console.log(map)
let targets = ['YOU', 'SAN'];
let sum = 0;
let ml = Infinity;
function dfs(node, len) {
    sum += len;
    let tlens = [Infinity, Infinity];
    targets.forEach((t, i) => {
        if (t === node) tlens[i] = 0;
    })
    if (map[node]) {
        map[node].forEach(n2 => {
            let tls = dfs(n2, len + 1);
            tlens = tlens.map((l, i) => {
                return Math.min(l, tls[i] + 1);
            })
        })
    }
    //console.log(node, tlens);
    if (tlens[0] + tlens[1] < ml) {
        console.log(node, tlens)
        ml = tlens[0] + tlens[1] - 2;
    }
    return tlens;
}
dfs('COM', 0);
console.log(sum, ml);
