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
var rex = /pos=<(-?\d+),(-?\d+),(-?\d+)>, r=(-?\d+)/
let bots = []
contents.forEach(line => {
    if (rex.exec(line)) {
        bots.push(rex.exec(line).slice(1).map(Number))
    }
})
let max = bots.reduce((max, current) => current[3]>max[3]?current:max,bots[0]);
let inrange = bots.filter(bot => {
    let dist = bot.slice(0,3).map((c,idx)=>Math.abs(max[idx]-c)).reduce((s,v)=>s+v,0)
    return dist<=max[3];
})
console.log(max, inrange.length)

console.log(`array[0..${bots.length-1}] of var int: cubes;`)
bots.forEach((bot,idx) => {
    console.log(`constraint cubes[${idx}]=if (abs(x- ${bot[0]})+abs(y- ${bot[1]})+abs(z- ${bot[2]})<=${bot[3]}) then 1 else 0 endif;`)
})
