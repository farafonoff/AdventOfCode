//  12   00:25:26   358      0   00:42:12   304      0
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
var re1 = /initial state: ([.#]+)/
var re2 = /([.#]+) => ([.#])/
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));

var is;
var patterns = {}

contents.forEach(line => {
    if (re1.exec(line)) {
        is = re1.exec(line)[1];
    } else {
        var m2 = re2.exec(line);
        if (m2) {
            patterns[m2[1]] = m2[2];
        }
    }
})
console.log(patterns);
var protector = '...';
var base = -protector.length;
is=protector+is+protector;
function next(s = '') {
    let output = ['.','.'];
    for(let i=0;i<s.length-2;++i) {
        Object.keys(patterns).forEach(p => {
            if (s.slice(i).startsWith(p)) {
                output[i+2] = patterns[p];
            }
        })
        if (!output[i+2]) output[i+2] = '.'
    }
    let sr = output.join('');
    let ps = sr.indexOf('#');
    if (ps < 3) {
        base -= protector.length;
        sr = protector+sr;
    } else {
        if (ps > 10) {
            sr = sr.slice(5);
            base += 5;
        }
    }
    if (sr.lastIndexOf('#') > sr.length-4) {
        sr += protector;
    }
    return sr;
}
function getAns(ts) {
    let ans = ts.split('').reduce((pv, cv, idx) => {
        //console.log(pv, cv, idx);
        return pv+(cv==='#'?(idx+base):0)
    },0)
    return ans;
}
var ts = is;
// solution for 2nd: run to 10000 and see progression
let last = 0;
let ans;
let diff;
let ans1;
let testlim = 500;
for(let g=0;g<testlim;++g) {
    ts = next(ts);
    last = ans;
    ans = getAns(ts);
    diff = ans - last;
    if (g===(20-1)) ans1 = ans;
    if (g%1000==999||g<1000) {
        console.log(g+1, base, ans, last-ans, ts);
    }
}
let ans2 = (50000000000-testlim)*diff + ans;
console.log(ans1, ans2);


//console.log(base);

