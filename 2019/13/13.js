//11   00:23:11   527      0   00:33:11   552      0
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
                    //console.log('input', inputs)
                    //console.log('yield1', inputs);
                }
                //console.log(inputs)
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
                //console.log('output ', val, newinput)
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

let takeNext = (gen, callback) => {
    let output = gen.next();
    do {
        if (output.value) {
            return output.value[0];
        }
        if (output.done) {
            return null;
        }
        output = gen.next([callback()]);
    } while (!output.value);
    return output.value[0]
}

const msleep = milliSeconds =>
    Atomics.wait(
        new Int32Array(new SharedArrayBuffer(4)),
        0, 0, milliSeconds
    )
;

let draw = (map) => {
    let sprites = [' ', 'W', '#', '_', 'O'];
    let uc = [-Infinity, -Infinity], lc = [Infinity, Infinity];
    map.keys().forEach(poz => {
        uc[0] = Math.max(uc[0], poz[0])
        uc[1] = Math.max(uc[1], poz[1])
        lc[0] = Math.min(lc[0], poz[0])
        lc[1] = Math.min(lc[1], poz[1])
    })
    //console.log(uc,lc)
    let bufs = [];
    for (let y = uc[1]; y >= lc[1]; --y) {
        let buf = [];
        for (let x = lc[0]; x < uc[0]; ++x) {
            //console.log([x,y], map.get([x,y]))
            let val = map.get([x, y]);
            buf.push(sprites[val])
        }
        bufs.push(buf.join(''))
    }
    console.log(bufs.join('\n'));
}

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t,]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
/*let tr = (dir) => {
    return [dir[1], -dir[0]];
}
let tl = (dir) => tr(tr(tr(dir)))*/
let code = [...contents[0]]
let gen = rint(code, [])
let map = new HM();
let score = 0;

do {    
    let x = takeNext(gen);
    if (x===null) break;
    let y = takeNext(gen);
    let t = takeNext(gen);
    map.set([x,y], t)
} while (true);
//console.log()
let ans1 = map.values().filter(tt => tt === 2).length;
let guess = (map) => {
    let nv = 0;
    let paddleP = map.keys().find(key => {
        return map.get(key) === 3
    })
    let ballP = map.keys().find(key => {
        return map.get(key) === 4
    })
    if (paddleP && ballP) {
        if (paddleP[0] > ballP[0]) nv = -1; else
            if (paddleP[0] < ballP[0]) nv = 1; else nv = 0
        //console.log(paddleP, ballP, nv)
    }

    msleep(20)
    process.stdout.write('\033c');
    process.stdout.write("\u001b[2J\u001b[0;0H");
    draw(map)
    console.log('part1 answer was ', ans1)
    console.log('current score is ', score)
    return nv;
}

contents[0][0] = 2;
code = [...contents[0]]
gen = rint(code, [])
while (true) {
    let x = takeNext(gen, () => guess(map));
    if (x===null) break;
    let y = takeNext(gen, () => guess(map));
    let t = takeNext(gen, () => guess(map));
    //console.log(x,y,t)
    //console.log(x,y,t)
    if (x===-1&&y===0) {
        score = t;
    } else {
        map.set([x,y], t)
    }
};
console.log('part2 answer is ', score)
//console.log(map)