//  9   00:19:14   213      0   00:19:52   203      0
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

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t,]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
let parsecode = opcode => {
    let code = opcode%100;
    let opmode = Math.trunc(opcode/100);
    let paramlength = 0;
    switch (code) {
        case 3:
        case 4:
            paramlength = 1;
            break;
        case 5:
        case 6:
            paramlength = 2;
            break;
        default: paramlength = 3;
    }
    let modes = [];
    for(let i=0;i<paramlength;++i) {
        modes.push(opmode%10);
        opmode = Math.trunc(opmode/10);
    }
    return [code, modes];
}
let rint = function* (line, inputs, limit) {
    let ip = 0;
    let rb = 0;
    let takeparam = (opmode, num, ip, line) => {
        switch(opmode[num]) {
            case 1:
                return line[ip+num + 1]
            case 2:
                return line[rb+line[ip+num + 1]];
            default:
                return line[line[ip+num + 1]];
        }
    }
    let wparam = (opmode, num, ip, line, value) => {
        switch(opmode[num]) {
            case 1:
                line[ip+num + 1] = value;
            case 2:
                line[rb+line[ip+num + 1]] = value;
            default:
                line[line[ip+num + 1]] = value;
        }
    }
    limit = limit || Infinity;
    for (let i = 0; i<limit; ++i) {
        let [opcode, opmode] = parsecode(line[ip]);
        //console.log(opcode, opmode)
        switch (opcode) {
            case 1: {
                wparam(opmode, 2, ip, line, takeparam(opmode, 0, ip, line) + takeparam(opmode, 1, ip, line))
                ip += 4;
                break;
            }
            case 2: {
                wparam(opmode, 2, ip, line, takeparam(opmode, 0, ip, line) * takeparam(opmode, 1, ip, line))
                ip += 4;
                break;
            }
            case 3: {
                if (inputs.length===0) {
                    inputs = yield;
                    //console.log('yield1', inputs);
                }
                wparam(opmode, 0, ip, line, inputs.shift())
                ip += 2;
                break;
            }
            case 4: {
                let val = takeparam(opmode, 0, ip, line);
                let newinput = yield [val];
                //console.log(newinput);
                if (newinput) {
                    inputs = [...inputs, ...newinput];
                }
                //console.log(val, newinput);
                ip += 2;
                break;
            }
            case 5: {
                if (takeparam(opmode, 0, ip, line) !== 0) {
                    ip = takeparam(opmode, 1, ip, line)
                } else {
                    ip += 3;
                }
                break;
            }
            case 6: {
                if (takeparam(opmode, 0, ip, line) === 0) {
                    ip = takeparam(opmode, 1, ip, line)
                } else {
                    ip += 3;
                }
                break;
            }
            case 7: {
                if (takeparam(opmode, 0, ip, line) < takeparam(opmode, 1, ip, line)) {
                    wparam(opmode, 2, ip, line, 1)
                } else {
                    wparam(opmode, 2, ip, line, 0)
                }
                ip += 4;
                break;
            }
            case 8: {
                if (takeparam(opmode, 0, ip, line) === takeparam(opmode, 1, ip, line)) {
                    wparam(opmode, 2, ip, line, 1)
                } else {
                    wparam(opmode, 2, ip, line, 0)
                }
                ip += 4;
                break;
            }
            case 9: {
                rb += takeparam(opmode, 0, ip, line);
                ip += 2;
                break;
            }
            case 99: {
                //console.log(line);
                //return output;
                return;
            }
            default: {
                throw 'bad ' + ip
            }
        }
    }
}

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t,]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
let code = [...contents[0]]
let gen = rint(code, [1])
let outp = gen.next();
while (!outp.done) {
    console.log(outp)
    outp = gen.next();
};
code = [...contents[0]]
gen = rint(code, [2])
outp = gen.next();
while (!outp.done) {
    console.log(outp)
    outp = gen.next();
};

