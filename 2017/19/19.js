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
var contents = fs.readFileSync('input', 'utf8').split("\r\n").filter(s => s.length > 0).map(s => s.split(''));

function vadd(v1,v2) {
    let vr = [];
    for(let i=0;i<v1.length;++i) {
        vr[i] = v1[i]+v2[i];
    }
    return vr;
}
function veq(v1,v2) {
    for(let i=0;i<v1.length;++i) {
        if (v1[i]!=v2[i]) {
            return false;
        }
    }
    return true;
}
function vrv(v) {
    let vr = [];
    for(let i=0;i<v.length;++i) {
        vr[i] = -v[i];
    }
    return vr;    
}
function isLet(ch) {
    return !!ch.match(/[A-Z]/);
}
function follow(data, pos) {
    let result = "";
    let dir = [0,1];
    let steps = 0;
    let end = false;
    function cat(pos) {
        if (pos[1]>=data.length||pos[1]<0) {
            return ' ';
        }
        if (pos[0]>=data[pos[1]].length||pos[0]<0) {
            return ' ';
        }
        return data[pos[1]][pos[0]];
    }
    while (!end) {
        let ch = cat(pos);
        while(ch!='+'&&ch!=' ') {
            let letter = ch.match(/[A-Z]/);
            if (letter) {
                result+=letter[0];
            }
            pos = vadd(pos,dir);
            ch = cat(pos);
            ++steps;
        }
        if (ch==' ') {
            end = true;
            return [result, steps];
        }
        let dirv = vrv(dir);
        let cand = [0,1];
        let nch = cat(vadd(pos,cand));
        if (!veq(dirv,cand)&&(nch=='|'||isLet(nch))) {
            dir = cand;
        }
        cand = [0,-1];
        nch = cat(vadd(pos,cand));
        if (!veq(dirv,cand)&&(nch=='|'||isLet(nch))) {
            dir = cand;
        }
        cand = [1,0];
        nch = cat(vadd(pos,cand));
        if (!veq(dirv,cand)&&(nch=='-'||isLet(nch))) {
            dir = cand;
        }
        cand = [-1,0];
        nch = cat(vadd(pos,cand));
        if (!veq(dirv,cand)&&(nch=='-'||isLet(nch))) {
            dir = cand;
        }
        pos = vadd(pos, dir);
        ++steps;
    }
    return [result, steps];
}

let pos = [contents[0].indexOf('|'),0]
console.log(pos);
console.log(follow(contents, pos));
