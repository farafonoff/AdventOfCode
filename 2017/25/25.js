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
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
console.log(contents);
let tm = {};
let state = 'A';
let pos = 0;
let steps = 0;
let cv;
let cs;
contents.forEach(line => {
    let mt;
    if (mt=line.match(/Begin in state ([A-Z])/)) {
        state = mt[1];
    }
    if (mt=line.match(/Perform a diagnostic checksum after ([0-9]+) steps./)) {
        steps = Number(mt[1]);
    }
    if (mt=line.match(/In state ([A-Z])/)) {
        cs = mt[1];
        tm[cs] = [];
    }
    if (mt=line.match(/If the current value is ([01])/)) {
        cv = Number(mt[1]);
    }
    if (mt=line.match(/Write the value ([01])/)) {
        tm[cs][0+cv*3] = Number(mt[1]);
    }
    if (mt=line.match(/Move one slot to the right/)) {
        tm[cs][1+cv*3] = 1;
    }
    if (mt=line.match(/Move one slot to the left/)) {
        tm[cs][1+cv*3] = -1;
    }
    if (mt=line.match(/Continue with state ([A-Z])/)) {
        tm[cs][2+cv*3] = mt[1];
    }
})

let tape = new HM();

for(let i=0;i<steps;++i) {
    let val;
    if (tape.has(pos)) {
        val = tape.get(pos);
    } else {
        val = 0;
    }
    let line = tm[state];
    tape.set(pos, line[0+val*3]);
    pos += line[1+val*3];
    state = line[2+val*3];
}
let ans = 0;
tape.keys().forEach( key => {
    let val = tape.get(key);
    if (val === 1) {
        ++ans;
    }
})
console.log(ans);