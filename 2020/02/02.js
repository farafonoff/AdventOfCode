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
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[: -]/));
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/));

let res = 0;
contents.forEach(line => {
    const [orig, ll, mm, cc, pw] = line;
    const nc = pw.split('').filter(ch => cc===ch).length;
    //console.log(pw, nc, cc, ll, mm)
    if (nc >= ll && nc <=mm) {
        //console.log(pw)
        ++res
    }
})
console.log(res)

res = 0
contents.forEach(line => {
    const [orig, ll, mm, cc, pw] = line;
    const ch1 = pw.charAt(ll - 1)
    const ch2 = pw.charAt(mm - 1)
    if (ch1 === cc ^ ch2 === cc) {
        ++ res
    }
})
console.log(res)
