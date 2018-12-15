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
var map = [];
var units = new HM();
contents.forEach((line, y) => {
    let last = [];
    map.push(last);
    line.split('').forEach((ch,x) => {
        if (ch=='E') {
            map.push('.')
            units.set([x,y],{t:'E',hp:200,a:3})
        } else
        if (ch=='G') {
            map.push('.')
            units.set([x,y],{t:'G',hp:200,a:3})
        } else
        map.push(ch)
    });
})
var moves = [[0,-1],[-1,0],[1,0],[0,1]]
function sv(v1,v2) {
    return v1.map((v,i)=>v+v2[i]);
}
function canAttack(key, ch, unit) {
    var result = undefined;
    moves.forEach(move => {
        var next = sv(key, move);
        var nunit = units.get(next);
        if (!result && ((_.get(nunit, 't', '.') !== '.' && _.get(nunit, 't', '.') !== ch))) {
            result = next;
        }
    })
    return result;
}
function identifyTargets(init, type) {
    function pmoves(coord) {
        var result = moves.filter(pmove => {
            var dst = sv(coord,pmove);
            if ((_.get(dst, 't', '.') === '.') && map[dst[1], dst[0] === '.']) {
                return true;
            } else return false;
        })
        return result;
    }
    var open = new HM();
    open.set(init, [0, null]);
    var closed = new HM();
    var found = false;
    do {
        var korder = open.keys().sort((k1,k2) => k1[1]===k2[1]?(k1[0]-k2[0]):(k1[1]-k2[1]));
        
    } while(!found);
}
function step() {
    var korder = units.keys().sort((k1,k2) => k1[1]===k2[1]?(k1[0]-k2[0]):(k1[1]-k2[1]))
    korder.forEach(currKey => {
        unit = units.get(currKey);
        //console.log(currKey, unit)
        var aTarget = canAttack(currKey, unit.t);
        if (aTarget) {
            //console.log(currKey, aTarget);
            let tunit = units.get(aTarget);
            tunit.hp -= unit.a;
            //console.log(unit, 'attacks', tunit);
            if (tunit.hp<=0) {
                units.remove(aTarget);
            }
        } else {

        }
    })
}
for(let i=0;i<20;++i) {
    step();
}