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

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s=>Number(s));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content

function check1(preamble, num) {
    //console.log(preamble, num)
    const pmap = {}
    let result = false;
    preamble.forEach(pm => pmap[String(pm)] = 1)
    preamble.forEach(pm => {
        const rem = num - pm
        if (pmap[String(rem)]) {
            result = true;
        }
    })
    return result
}
const preamble = contents.length>500?25:5
let ans1;
contents.forEach((line, idx) => {
    if (idx>=preamble) {
        let res = check1(contents.slice(idx-preamble, idx), line)
        if (!res) {
            console.log(line)
            ans1 = line
        }
    }
})

for(let i=0;i<contents.length-1;++i) {
    let res = contents[i]
    for(let j=i+1;j<contents.length;++j) {
        res += contents[j];
        if (res === ans1) {
            let sol = contents.slice(i, j + 1);
            let sol1 = Math.min.apply(null, sol)
            let sol2 = Math.max.apply(null, sol);
            console.log(sol1 + sol2)
        }
    }
}