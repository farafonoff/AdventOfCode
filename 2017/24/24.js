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
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[/]/).map(Number));

let pinz = [];

contents.forEach(line => {
    pinz.push([line[0], line[1], true])
})

let max = 0;
let maxlen = 0;
let maxmax = 0;
function rec(pin, acc, len) {
    let found = false;
    pinz.forEach(part => {
        if (part[2]) {
            if ((part[0]==pin)) {
                //console.log(part);
                part[2] = false;
                found = true;
                rec(part[1], acc+part[0]+part[1], len+1);
            }
            if ((part[1]==pin)) {
                //console.log(part);
                part[2] = false;
                found = true;
                rec(part[0], acc+part[0]+part[1], len+1);
            }
            part[2] = true;
        }
    })
    if (!found) {
        if (acc>max) max = acc;
        if (len > maxlen) {
            maxmax = acc;
            maxlen = len;
        }
        if (len == maxlen&&acc>maxmax) {
            maxmax = acc;            
        }
        console.log(max, maxlen, maxmax);
    }
}
rec(0,0, 0);
console.log(max, maxlen, maxmax)