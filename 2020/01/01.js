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

try {
    contents.forEach(cn => {
        contents.forEach(cn1 => {
            if (cn + cn1 === 2020) {
                console.log('Part 1', cn*cn1)
                throw 0;
            }
        })
    })
}
catch(e) {}
try {
    contents.forEach(cn => {
        contents.forEach(cn1 => {
            contents.forEach(cn2 => {
                if (cn + cn1 + cn2 === 2020) {
                    console.log('Part 2', cn*cn1*cn2)
                    throw 0;
                }
            })
        })
    })    
}
catch(e) {}
