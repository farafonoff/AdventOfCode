//   2   00:07:42   531      0   00:12:53   321      0
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

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));

let twos = 0;
let tris = 0;
contents.forEach(line => {
    let chars = line.split('').sort();
    let counts = {};
    chars.forEach(c => {
        counts[c] = counts[c]||0; counts[c]++;
    })
    let h2, h3;
    Object.keys(counts).forEach(key => {
        if (counts[key]===2) h2 = true;
        if (counts[key]===3) h3 = true;
    })
    h2&&twos++;
    h3&&tris++;
})
console.log(twos*tris);
contents.forEach(line => {
    contents.forEach(line2 => {
        let c1 = line.split('');
        let c2 = line2.split('');
        let er = 0;
        let erp = 0;
        c1.forEach((v,i) => {
            if (c2[i]!==v) {
                ++er;
                erp = i;
            }
        })
        if (er==1) {
            c1.splice(erp, 1);
            console.log(c1.join(''));
        }
    })
})
