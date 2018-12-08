// 8   00:18:26   574      0   00:27:47   513      0
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
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/ /).map(Number));

function sum(ar) {
    return ar.reduce((s,c)=>s+c,0)
}

var r1 = [];

function s1(input) {
    let [ch,md,...rest] = input;
    //console.log(ch, md, rest);
    if (ch === 0) {
        r1 = [...r1, ...rest.slice(0, md)];
        //console.log(rest.slice(0, md))
        return 2+md;
    } else {
        var chls = 0;
        for(let i=0;i<ch;++i) {
            var chl = s1(rest.slice(chls))
            chls += chl;
            //console.log(chl, chls, rest.slice(chls));
        }
        //console.log(chls, rest.slice(chls, chls+md))
        r1 = [...r1, ...rest.slice(chls, chls+md)];
        return 2+md + chls;
    }
}

function s2(input) {
    let [ch,md,...rest] = input;
    //console.log(ch, md, rest);
    if (ch === 0) {
        r1 = [...r1, ...rest.slice(0, md)];
        return [2+md, sum(rest.slice(0, md))];
    } else {
        var chls = 0;
        let values = [];
        for(let i=0;i<ch;++i) {
            var [chl, value] = s2(rest.slice(chls))
            values.push(value);
            chls += chl;
            //console.log(chl, chls, rest.slice(chls));
        }
        var mdd = rest.slice(chls, chls+md);
        var nv = 0;
        mdd.forEach(mde => nv+=(values[mde-1]||0));
        //console.log(chls, rest.slice(chls, chls+md))
        r1 = [...r1, ...mdd];
        return [2+md + chls, nv];
    }
}

contents.forEach(line => {
    //s1(line);
    var r2 = s2(line)
    console.log(sum(r1));
    console.log(r2);
})
