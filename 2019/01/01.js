//   1   00:02:10   298      0   00:05:16   184      0
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

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(Number);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
let acc1 = 0;
let acc2 = 0;
let fmf = (m) => (Math.floor(m/3)-2)
contents.forEach(line => {
    let fm = fmf(line);
    acc1 += fm;
    acc2 += fm;
    while(fm>0) {
        fm = fmf(fm);
        if (fm>0) acc2+=fm;
    }
    //console.log(line);
})
console.log(acc1, acc2)
