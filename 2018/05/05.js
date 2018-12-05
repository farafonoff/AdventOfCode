//5   00:12:47   589      0   00:19:13   422      0
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

function collapse(pol) {
    let reactions;
    do {
        let next = [];
        reactions = 0;
        let match;
        for(var i=1;i<pol.length;++i) {
            match = false;
            if (pol[i-1]!==pol[i]&&pol[i-1].toLowerCase()===pol[i].toLowerCase()) {
                match = true;
                //console.log(pol[i]);
            }
            if (!match) {
                next.push(pol[i-1])
            } else {
                i+=1;
                ++reactions;
            }
        }
        if (!match) {
            next.push(pol[i-1]);
        }
        pol = next;
        //console.log(pol, reactions, pol.length);
    } while (reactions > 0);
    return pol;
}
contents.forEach(line => {
    let pol = line.split('');
    pol = collapse(pol);
    console.log(pol.length)
})
var r2s = [];
for(let i="a".charCodeAt(0);i<"z".charCodeAt(0);++i) {
    contents.forEach(line => {
        let is = String.fromCharCode(i);
        let pol = line.split('');
        pol = pol.filter(c => c.toLowerCase()!==is);
        //console.log(pol);
        pol = collapse(pol);
        r2s.push(pol.length);
        //console.log(is, pol, pol.length)
    })      
}
console.log(Math.min.apply(null, r2s))