//Day       Time  Rank  Score       Time  Rank  Score
//9   00:37:35   644      0   00:38:12   213      0
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

var re = /(\d+) players; last marble is worth (\d+) points/;

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));

var marblez = {}

var _init = marblez;
function log() {
    let cr = _init;
    let dump = [];
    do {
        if (cr===marblez) {
            dump.push(`(${cr.value})`);
        } else {
            dump.push(cr.value);
        }
        
        cr = cr.next;
    } while (_init !== cr);
    console.log(dump);
}

function cw() {
    marblez = marblez.next;
}

function ccw() {
    marblez = marblez.prev;
}

function ins(v) {
    var node = {}
    node.prev = marblez;
    node.next = marblez.next;
    marblez.next.prev = node;
    marblez.next = node;
    marblez = node;
    node.value = v;
}

function mrm() {
    let old = marblez;
    cw();
    marblez.prev = old.prev;
    old.prev.next = marblez;
    //console.log(old.value);
    return old.value;
}

function ins1(v) {
    cw();
    ins(v);
}

function ins23(v) {
    let scor = v;
    for(let i=0;i<7;++i) ccw();
    let removed = mrm();
    scor+=removed;
    //console.log(v,removed);
    return scor;
}

contents.forEach(line => {
    marblez = {}
    _init = marblez;
    marblez.prev = marblez;
    marblez.next = marblez;
    marblez.value = 0;
    console.log(line);
    let match = re.exec(line)
    let [players, marbles] = match.slice(1).map(Number)
    console.log(players, marbles);
    let scores = new Array(players).fill(0);
    for(let mbl = 1;mbl<=marbles;mbl++) {
        let pl = mbl%players;
        if (mbl%23===0) {
            let add = ins23(mbl);
            //console.log(add);
            scores[pl]+=add;
        } else {
            ins1(mbl);
        }
        //log();
    }
    console.log(Math.max.apply(null,scores));
})
