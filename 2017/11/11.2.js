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
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[,]/));

function dist(row) {
    let sx = 0;
    let sy = 0;
    let sz = 0;
    let dists = [];
    //console.log(row);
    row.forEach(val => {
        [sx,sy,sz] = mov(val, sx,sy,sz);
        dists.push(Math.max(Math.abs(sx),Math.abs(sy),Math.abs(sz)));
    })
    console.log(Math.max(Math.abs(sx),Math.abs(sy),Math.abs(sz)));
    console.log(Math.max.apply(Math,dists));
}

function mov(dir, sx, sy, sz){
    switch(dir) {
        case 'n': sy+=1; sz-=1; break;
        case 'ne': sx+=1; sz-=1; break;
        case 'se': sx+=1; sy-=1; break;
        case 's': sy-=1; sz+=1; break;
        case 'sw': sx-=1; sz+=1; break;
        case 'nw': sx-=1; sy+=1; break;
    }
    return [sx,sy,sz];
}

let dirs = ['n','ne','se','s','sw','nw'];


contents.forEach(line => {
    dist(line);
})
