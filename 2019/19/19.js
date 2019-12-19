//19   00:06:50   331      0   01:03:14   498      0
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
let rints = function (line, inputs, state) {
    if (!state) state = { ip: 0, rb: 0, inputs }
    let ip = state.ip;
    let rb = state.rb;
    state.output = undefined;
    let takeparam = (opmode, num, ip, line) => {
        switch (opmode[num]) {
            case 1:
                return line[ip + num + 1]
            case 2:
                return line[rb + line[ip + num + 1]];
            default:
                return line[line[ip + num + 1]];
        }
    }
    let wparam = (opmode, num, ip, line, value) => {
        switch (opmode[num]) {
            case 1:
                line[ip + num + 1] = value;
            case 2:
                line[rb + line[ip + num + 1]] = value;
            default:
                line[line[ip + num + 1]] = value;
        }
    }
    let [opcode, opmode] = parsecode(line[ip]);
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
            if (inputs.length === 0) {
                state.shouldInput = true;
                return state;
            }
            state.shouldInput = false;
            wparam(opmode, 0, ip, line, inputs.shift())
            ip += 2;
            break;
        }
        case 4: {
            let val = takeparam(opmode, 0, ip, line);
            state.output = val;
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
            return {...state, done: true};
        }
        default: {
            throw 'bad ' + ip
        }
    }
    state = {...state, ip, rb}
    return state;
}

var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t,]/).map(Number));

let patchDir = (pos, dir) => {
    switch(dir) {
        case 1: return [pos[0], pos[1] - 1];
        case 2: return [pos[0], pos[1] + 1];
        case 3: return [pos[0] -1, pos[1]];
        case 4: return [pos[0] +1, pos[1]];
    }
}
let draw = (map) => {
    let sprites = ['#', '.', 'O'];
    let undef = ' ';
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
        for (let x = lc[0]; x <= uc[0]; ++x) {
            //console.log([x,y], map.get([x,y]))
            let val = map.get([x, y]);
            buf.push(sprites[val] || undef)
        }
        bufs.push(buf.join(''))
    }
    console.log(bufs.join('\n'));
}


let sum = 0;
let toffset = 0;
let line = []
let getRay = (x,y) => {
    let code = [...contents[0]]
    let state = rints(code, []);
    while (!state.shouldInput) {
        state = rints(code, [], state);
    }
    state = rints(code, [x], state);
    while (!state.shouldInput) {
        state = rints(code, [], state);
    }
    state = rints(code, [y], state);
    while(state.output===undefined) {
        state = rints(code, [], state);
    }
    return state.output;
}

for(let y=0;y<50;++y) {
    let line = []
    for(let x=0;x<50;++x) {
        //console.log(state.output)
        let v = getRay(x,y)
        line.push(v);
        sum += v;
    }
    let l = line.indexOf(1);
    let r = line.lastIndexOf(1);
    console.log(line.join(''), l,r);
}
console.log(sum)

let l = 0;
let r = 0;
let check = (x,y) => {
    for(let i=0;i<100;++i) {
        let line = [];
        for(let j=0;j<100;++j) {
            line.push(getRay(j+x, i+y))
        }
        console.log(line.join(''));
    }
}
let ms = Infinity;
let ans = 0;
let ds = (x,y) => x*x+y*y;
let ss = 99;
for(let y=0;y<10000000;++y) {
    line = []
    for(let x=r;x<r+4;++x) {
        //console.log(state.output)
        let v = getRay(x,y)
        line.push(v);
    }
    //l = line.indexOf(1);
    let ru = line.lastIndexOf(1);
    if (ru!==-1) {
        r = r+ru;
    }
    line = [];
    for(let x=l;x<l+4;++x) {
        //console.log(state.output)
        let v = getRay(x,y)
        line.push(v);
    }
    let lu = line.indexOf(1);
    if (lu!==-1) {
        l = l+lu;
    }

    if (r>100&&y>100) {
        if (getRay(r-ss, y+ss)===1) {
            let dist = ds(r-ss, y)
            if (dist < ms) {
                ms = dist;
                ans = (r-ss)*10000+y;
            }
            //console.log(r-ss, y);
            //break;
        }
        if (getRay(l+ss, y-ss)===1) {
            //console.log(l, y-ss);
            let dist = ds(l, y-ss)
            if (dist < ms) {
                ms = dist;
                ans = (l)*10000+(y-ss);
            }
            //break;
        }
    }
    /*if (y%100===0||y<50) {
        console.log(l, r);
    }*/
    if (ms !== Infinity) {
        console.log(ans)
        break;
    }
    //
}