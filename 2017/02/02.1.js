const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));

let a = contents.reduce((pv, cv) => {
    let mx = Math.max.apply(Math, cv);
    let mi = Math.min.apply(Math, cv);
    let df = mx - mi;
    return pv + df;
}, 0)

console.log(a);