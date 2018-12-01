// 183 282
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

var reaches = [];

var result = 0;
var s2 = false;
var s1 = false;
reaches[result] = reaches[result]||0;reaches[result]++;
while(!s2) {
    contents.forEach(line => {
        result += Number(line);
        reaches[result] = reaches[result]||0;reaches[result]++;
        if (reaches[result]===2) {
            console.log(result);
            s2 = true;
            throw 's2 done'
        }
    })
    if (!s1) {
        console.log(result)
    }
    s1 = true;
}

