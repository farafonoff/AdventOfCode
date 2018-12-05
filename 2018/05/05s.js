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

function xmatch(c1,c2) {
    return c1&&c2&&c1!==c2&&c1.toLowerCase()===c2.toLowerCase()
}

function collapse(pol) {
    let result = [];
    pol.forEach(c => {
        if(xmatch(result[result.length-1], c)) {
            result.pop();
        } else {
            result.push(c);
        }
    })
    return result;
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
