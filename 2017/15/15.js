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

function next(val, factor) {
    let nv = (val*factor)%2147483647;
    return nv;
}
function match(v1,v2) {
    return ((v1&65535) === (v2&65535));
}

function solve(a,b) {
    let ans = 0;
    for(let i=0;i<40000000;++i) {
        a = next(a, 16807);
        b = next(b, 48271);
        if (match(a,b)) {
            ++ans;
        }
    }
    return ans;
}
function solve2(a,b) {
    let ans = 0;
    for(let i=0;i<5000000;++i) {
        do { a = next(a, 16807); } while(a%4!=0);
        do { b = next(b, 48271); } while(b%8!=0);
        if (match(a,b)) {
            ++ans;
        }
    }
    return ans;
}
/*console.log(solve(65,8921))
console.log(solve(703,516))*/
console.log(solve2(65,8921))
console.log(solve2(703,516))
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));

contents.forEach(line => {
    console.log(line);
})
