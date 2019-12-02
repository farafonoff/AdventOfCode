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

let rint = (line) => {
    let ip = 0;
    for (let i = 0; ; ++i) {
        //console.log(ip, line.join(" "))
        switch (line[ip]) {
            case 1: {
                line[line[ip + 3]] = line[line[ip + 1]] + line[line[ip + 2]]
                ip += 4;
                break;
            }
            case 2: {
                line[line[ip + 3]] = line[line[ip + 1]] * line[line[ip + 2]]
                ip += 4;
                break;
            }
            case 99: {
                //console.log(line);
                throw 'halt';
            }
            default: {
                throw 'bad'
            }
        }
    }
}

//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0);
var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t,]/).map(Number));
//console.log(contents)
let or = [...contents[0]];
for (let i1 = 0; i1 < or.length; ++i1) {
    for (let i2 = 0; i2 < or.length; ++i2) {
        let cod = [...or];
        cod[1] = i1
        cod[2] = i2
        try {
            rint(cod)
        } catch (e) {
            if (e === 'halt' && i1 === 12 && i2 === 2) {
                console.log('s1', i1, i2, cod[0])
            }
            if (e === 'halt' && cod[0] === 19690720) {
                console.log('s2', i1*100+i2, cod[0])
            }
        }
    }
}
