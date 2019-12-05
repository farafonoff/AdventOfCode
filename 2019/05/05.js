//5   00:36:23   871      0   00:50:27   778      0
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
let takeparam = (opmode, num, ip, line) => {
    if(opmode[num]) {
        return line[ip+num + 1];
    } else {
        return line[line[ip+num + 1]];
    }
}
let rint = (line, inputs, limit) => {
    let ip = 0;
    limit = limit || Infinity;
    for (let i = 0; i<limit; ++i) {
        let [opcode, opmode] = parsecode(line[ip]);
        //console.log(opcode, opmode)
        switch (opcode) {
            case 1: {
                line[line[ip + 3]] = takeparam(opmode, 0, ip, line) + takeparam(opmode, 1, ip, line)
                ip += 4;
                break;
            }
            case 2: {
                line[line[ip + 3]] = takeparam(opmode, 0, ip, line) * takeparam(opmode, 1, ip, line)
                ip += 4;
                break;
            }
            case 3: {
                line[line[ip+1]] = inputs.shift();
                ip += 2;
                break;
            }
            case 4: {
                console.log(takeparam(opmode, 0, ip, line));
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
                    line[line[ip + 3]] = 1;
                } else {
                    line[line[ip + 3]] = 0;
                }
                ip += 4;
                break;
            }
            case 8: {
                if (takeparam(opmode, 0, ip, line) === takeparam(opmode, 1, ip, line)) {
                    line[line[ip + 3]] = 1;
                } else {
                    line[line[ip + 3]] = 0;
                }
                ip += 4;
                break;
            }
            case 99: {
                //console.log(line);
                throw 'halt';
            }
            default: {
                throw 'bad ' + ip
            }
        }
    }
}
/*let line = [1002,4,3,4,33];
try {
    console.log(line)
    rint(line);
    console.log(line);
} catch(e) {
    console.log(e)
    console.log(line)
}
line = [3,0,4,0,99];
try {
    console.log(line)
    rint(line, [5]);
    console.log(line);
} catch(e) {
    console.log(e)
    console.log(line)
}*/
line = [...contents[0]];
try {
    //console.log(line)
    rint(line, [1]);
    //console.log(line);
} catch(e) {
    console.log(e)
    //console.log(line)
}

/*line = [3,12,6,12,15,1,13,14,13,4,13,99,-1,0,1,9];
try {
    console.log(line)
    rint(line, [0], 10);
    //console.log(line);
} catch(e) {
    console.log(e)
    //console.log(line)
}

line = [3,21,1008,21,8,20,1005,20,22,107,8,21,20,1006,20,31,
    1106,0,36,98,0,0,1002,21,125,20,4,20,1105,1,46,104,
    999,1105,1,46,1101,1000,1,20,4,20,1105,1,46,98,99];
try {
    //console.log(line)
    rint(line, [9]);
    //console.log(line);
} catch(e) {
    console.log(e)
    //console.log(line)
}*/


line = [...contents[0]];
try {
    //console.log(line)
    rint(line, [5]);
    //console.log(line);
} catch(e) {
    console.log(e)
    //console.log(line)
}