//  14   00:11:28   183      0   00:16:50    72     29
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

var input = 290431;
var input2 = ''+input;
var offset = (3+input2.length);
var s2found = false;
var s2;

var recipes = [3,7]
var elves = [0,1]

function step() {
    let sum = elves.reduce((s,e) => s+recipes[e], 0)
    let sstr = ''+sum;
    let digits = sstr.split('').map(Number);
    digits.forEach(digit => recipes.push(digit));
    if (!s2found) {
        let tail = recipes.slice(recipes.length-offset, recipes.length).join('')
        let io2 = tail.indexOf(input2);
        if (io2!==-1) {
            s2found = true;
            s2 = recipes.length-offset+io2;
            console.log(s2);
        }    
    }
    elves = elves.map(elve => {
        let pos = elve + 1 + recipes[elve];
        pos = pos%recipes.length;
        return pos;
    })
}

while(recipes.length<input+10) {
    step();
    //console.log(elves, recipes);
}
console.log(recipes.slice(input, input+10).join(''))
while(!s2found) {
    step();
    //console.log(elves, recipes);
}
