//7   00:15:10   346      0   00:47:43   310      0
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
let rint = function* (line, inputs, limit) {
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
                if (inputs.length===0) {
                    inputs = yield;
                    //console.log('yield1', inputs);
                }
                line[line[ip+1]] = inputs.shift();
                ip += 2;
                break;
            }
            case 4: {
                let val = takeparam(opmode, 0, ip, line);
                let newinput = yield [val];
                //console.log(newinput);
                inputs = [...inputs, ...newinput];
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
                //return output;
                return;
            }
            default: {
                throw 'bad ' + ip
            }
        }
    }
}
let inputz = [5,6,7,8,9];
let shuf = (prf, inz) => {
    let variantz = [];
    if (inz.length>0) {
        inz.forEach(i => {
            let tmp = shuf([...prf, i], inz.filter(n => n!==i));
            variantz = variantz.concat(tmp);
        })
    } else {
        variantz = [prf];
    }
    return variantz;
}
let variantz = shuf([], inputz);
let program = contents[0];
let max = 0;
//variantz=[[9,8,7,6,5]];
variantz.forEach((vr) => {
    let generators = vr.map(v => {
        let line = [...program];
        return rint(line, [v]);
    })
    generators.forEach(gen => gen.next());
    try {
        let initial = [0];
        try {
            let adone = false;
            while (!adone) {
                generators.forEach((gen, idx) => {
                    let { value, done } = gen.next(initial);
                    /*console.log('genn1', value,done);
                    while (!value && !done) {
                        let obj = gen.next([]);
                        value = obj.value; done = obj.done;
                    }*/
                    adone = adone || done;
                    if (value === undefined) throw 'done';
                    //console.log('genn', idx, value, done, adone);
                    initial = value;
                });
            }
        } catch (e) { }
        console.log(initial);
        if (initial[0]>max) max = initial[0];
        //console.log(line);
    } catch(e) {
        console.log(e)
        //console.log(line)
    }     
});
console.log(max)
//console.log();
/*
line = [...contents[0]];
try {
    //console.log(line)
    rint(line, [1]);
    //console.log(line);
} catch(e) {
    console.log(e)
    //console.log(line)
}

line = [...contents[0]];
try {
    //console.log(line)
    rint(line, [5]);
    //console.log(line);
} catch(e) {
    console.log(e)
    //console.log(line)
}
*/
