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
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(''));

let map = [];
let msize = 10000;

for(let i=0;i<msize;++i) {
    map[i] = new Array(msize);
    map[i].fill('.',0,msize);
}

let mmid = msize/2;
let mid = mmid-(contents.length-1)/2;
contents.forEach((line,ln) => {
    line.forEach((cell, cn) => {
        map[mid+ln][mid+cn] = cell;
    })
})

let cpos = [mmid, mmid];
let dir = [-1, 0];
//map[mmid][mmid] = '*';

function walk(pos, dir, steps) {
    let inf = 0;
    for(let step=0;step<steps;++step) {
        switch(map[pos[0]][pos[1]]) {
            case '.': {
                dir = [-dir[1], dir[0]];
                map[pos[0]][pos[1]] = 'W';
                break;
            }
            case 'W': {
                map[pos[0]][pos[1]] = '#';
                ++inf;
                break;
            }
            case '#': {
                dir = [dir[1], -dir[0]];
                map[pos[0]][pos[1]] = 'F';
                break;
            }
            case 'F': {
                dir = [-dir[0], -dir[1]];
                map[pos[0]][pos[1]] = '.';
                break;
            }            
        }
        pos = [pos[0]+dir[0], pos[1]+dir[1]];
        //console.log(map);
    }
    return inf;
}

console.log(walk(cpos, dir, 10000000));
