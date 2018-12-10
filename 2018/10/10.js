//
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

var re = /position=< *(-?\d+), *(-?\d+)> velocity=< *(-?\d+), *(-?\d+)>/

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
let points = [];
contents.forEach(line => {
    let match = re.exec(line);
    if (match) {
        let [x,y,vx,vy] = match.slice(1).map(Number);
        points.push([x,y,vx,vy]);
    }
})
function step() {
    points.forEach(p => {
        p[0]+=p[2];
        p[1]+=p[3];
    })
}

function getBB() {
    let [xo,xm,yo,ym] = [...points[0].slice(0,2), ...points[0].slice(0,2)];
    points.forEach(p => {
        if (p[0]<xo) xo = p[0];
        if (p[0]>xm) xm = p[0];
        if (p[1]<yo) yo = p[1];
        if (p[1]>ym) ym = p[1];
    })
    return [xo,xm,yo,ym]
}

function log(bb) {
    let xa = bb[1]-bb[0]+1;
    let ya = bb[3]-bb[2]+1;
    let field = new Array(xa*ya).fill('.');
    points.forEach(p => {
        let [x,y] = p;
        field[(x-bb[0])*ya+(y-bb[2])] = '*';
    })
    for(let i=0;i<ya;++i) {
        let s = [];
        for(let j=0;j<xa;++j) {
            s.push(field[j*ya+i]);
        }
        console.log(s.join(''));
    }
}

let [mi,ms] = [0,Infinity]
for(let i=0;i<50000;++i) {
    step()
    let bb = getBB();
    let [xo,xm,yo,ym] = bb;
    let S = (xm-xo)*(ym-yo);
    if (i%1000==0) {
        console.log(i,S);
    }
    if (S<ms) {
        mi = i;
        ms = S;
    }
    //console.log(bb);
    //log(bb);
}
console.log(mi+1,ms);
points = [];
let bb;
contents.forEach(line => {
    let match = re.exec(line);
    if (match) {
        let [x,y,vx,vy] = match.slice(1).map(Number);
        points.push([x,y,vx,vy]);
    }
})
for(let i=0;i<mi+1;++i) {
    step()
    bb = getBB();
    //console.log(bb);
}
log(bb);