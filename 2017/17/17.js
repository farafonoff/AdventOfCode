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

function solve1(inp) {
    let cp = 0;
    let buffer = [0];
    for(let i=1;i<2017;++i) {
        buffer = buffer.slice(0,cp).concat([i],buffer.slice(cp));
        //console.log(cp,buffer);
        cp+=inp+1;
        cp = cp%buffer.length;
        //console.log(buffer[0]);
    }
    console.log('Puzzle 1',buffer[cp]);
    //console.log(cp,buffer[cp],buffer.slice(cp-2,cp+2), buffer[0], buffer[buffer.length-1]);
}

function solve2(inp) {
    let cp = 0;
    let bl = 1;
    let lbl = 0;
    for(let i=1;i<50000000;++i) {
        if (cp===0) {lbl = i}
        bl+=1;
        cp+=inp+1;
        cp = cp%bl;
        //console.log(cp,bl,lbl);
    }
    console.log('Puzzle 2',lbl);
}

solve1(371);
solve2(371);


//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));

contents.forEach(line => {
    console.log(line);
})
