const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue');
const { isFinite } = require('lodash');
const bigInt = require('big-integer')
const _ = require('lodash')
const infile = process.argv[2] || "input"
function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

var contents = fs.readFileSync(infile, 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
const time1 = Number(contents[0])
const times = contents[1].split(',').map(Number)
const vtimes = times.filter(t => Number.isFinite(t))
const ress = vtimes.map(vt => {
    const rem = time1 % vt;
    const nex = vt - rem;
    const nt = time1 + nex;
    return nt;
})
let timedep = Math.min.apply(null, ress);
let mid = vtimes[ress.indexOf(timedep)]
let ans = mid * (timedep - time1)
console.log(ans)

const eqs = []
times.forEach((tt, idx) => {
    if (isFinite(tt)) {
        eqs.push([(tt - idx) % tt, tt])
    }
})

const M = eqs.reduce((m, eq) => m.times(eq[1]), bigInt(1))
let ans2 = bigInt(0)
eqs.forEach(eq => {
    Mi = M.divide(eq[1])
    Mi1 = Mi.modInv(eq[1])
    const Xi = Mi.times(Mi1).times(eq[0])
    ans2 = ans2.plus(Xi)
})
ans2 = ans2.mod(M)
console.log(ans2.toString())