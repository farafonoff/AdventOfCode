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

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim().split('')).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/));
const slope = [1, 3]
const width = contents[0].length
let pos = [0,0]
let res = 0;
contents.forEach(line => {
    if (line[pos[1]] === '#') {
        ++res;
    }
    pos[1] += slope[1]
    pos[1] = pos[1]%width;
})
console.log(res)

const slopes = [[1,1], [1, 5], [1, 3], [1, 7], [2, 1]];
let r2 = 1;
slopes.forEach(slope => {
    let res = 0;
    pos = [0,0]
    contents.forEach((line, idx) => {
        if (idx < pos[0]) {
            return;
        }
        if (line[pos[1]] === '#') {
            ++res;
        }
        pos[1] += slope[1]
        pos[0] += slope[0]
        pos[1] = pos[1]%width;
    })
    r2*=res;
})
console.log(r2)
