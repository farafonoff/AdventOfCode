// 15   00:52:32   321      0   01:05:59   281      0
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


code = [...contents[0]]
let state = rints(code, []);
let line = [];
let lines = [];
while (!state.done) {
    if (state.output!==undefined) {
        if (state.output !== 10) {
            line.push(String.fromCharCode(state.output))
        } else {
            console.log(line.join(''));
            lines.push([...line]);
            line = [];
        }
        if (state.output === 0) break;
    }
    state = rints(code, [], state)
};
let cat = (y,x) => {
    if (y>=0&&y<=lines.length) return lines[y][x] || '.';
    return '.';
}
let cata = (pos) => cat(pos[1], pos[0])
let tr = (dir) => {
    return [dir[1], -dir[0]];
}
let tl = (dir) => tr(tr(tr(dir)))
let fd = (pos, dir) => [pos[0]+dir[0], pos[1]-dir[1]];
let sum = 0;
let spos;
for(let i=0;i<lines.length;++i) {
    for(let j=0;j<lines[i].length;++j) {
        if (cat(i,j) === '#' && cat(i-1, j) === '#' && cat(i+1, j) === '#' && 
        cat(i, j-1) === '#' && cat(i, j+1) === '#'
        ) {
            //lines[i][j] = 'O';
            sum += i*j;
        }
        if (cat(i,j) === '^') spos = [i,j];
    }
}
console.log(sum);
let movs = [];
let pos = [spos[1], spos[0]];
let dir = [0,1]
while(true) {
    let nd = fd(pos, dir);
    if (cata(nd) === '.') {
        let ftr = tr(dir);
        let ftl = tl(dir);
        if (cata(fd(pos, ftr)) === '#') {
            movs.push('R');
            dir = ftr;
        } else
        if (cata(fd(pos, ftl)) === '#') {
            movs.push('L');
            dir = ftl;
        } else {
            break;
        }
        movs.push(0);
    } else {
        pos = nd;
        movs[movs.length-1]++;
    }
}
let prlen = movs.join(',');
console.log(prlen, prlen.length);
let matchy = (arr, offs, oth) => {
    let result = true;
    for(let i=0;i<oth.length;++i) {
        if (arr[i+offs] !== oth[i]) { 
            result = false;
        }
    }
    return result;
}
const msleep = milliSeconds =>
    Atomics.wait(
        new Int32Array(new SharedArrayBuffer(4)),
        0, 0, milliSeconds
    )
;

const cls = () => {
    process.stdout.write('\033c');
    process.stdout.write("\u001b[2J\u001b[0;0H");
}

let computeAns = (main, funcs) => {
    let niceArt = false;
    let code = [...contents[0]]
    code[0] = 2;
    let state = rints(code, []);
    let pushStr = (str) => {
        str.split('').forEach((char) => {
            while(!state.shouldInput) {
                state = rints(code, [], state)
            }
            //console.log(char, char.charCodeAt(0))
            state = rints(code, [char.charCodeAt(0)], state);
        })
        while(!state.shouldInput) {
            state = rints(code, [], state)
        }
        state = rints(code, [10], state);
    }
    let line = [];
    pushStr(main)
    funcs.forEach(f => pushStr(f));
    pushStr('y');
    let lb = [];
    while (!state.done) {
        if (state.output !== undefined) {
            //console.log(state.output)
            if (state.output > 200) {
                console.log(state.output);
                throw 'ans 2'
            }
            if (niceArt) {
                if (state.output !== 10) {
                    line.push(String.fromCharCode(state.output))
                } else {
                    console.log(line.join(''));
                    lb.push(line.join(''));
                    if (line.length < 3) {
                        lb.forEach(l => console.log(l));
                        msleep(100)
                        cls();
                        lb = [];
                    }
                    line = [];
                }
            }
        }
        state = rints(code, [], state)
    };
}
let compr = (movs, cid, programs) => {
//    console.log(cid)
    if (cid === 4) {
        let done = movs.filter(m => m>0||!Number.isInteger(m)).length === 0;
        //console.log(movs, programs)
        //throw('done')
        if (done) {
            let mp = movs.map(mov => -mov).map(mov => ['X', 'A','B','C'][mov]).join(',');
            let sprs = programs.map(program => program.join(','));
            let bad = sprs.filter(pr => pr.length > 20);
            if (mp.length <= 20 && bad.length === 0) {
                console.log(mp, sprs)
                computeAns(mp, sprs)
            }
            //console.log(movs, programs)
        }
        return;
    }
    for (let vas = 0; vas < movs.length; ++vas) {
        for (let ae = vas + 2; ae < movs.length; ++ae) {
            let af = movs.slice(vas, ae);
            let ap = af.join(',');
            if (ap.length > 20) break;
            if (ap.indexOf('-')!==-1) break;
            let cres = [];
            let pl = af.length;
            for (let j = 0; j < movs.length; ++j) {
                if (matchy(movs, j, af)) {
                    cres.push(-cid);
                    j += pl-1;
                } else {
                    cres.push(movs[j]);
                }
            }
            //console.log(movs, cres, af, pl)
            compr(cres, cid + 1, [...programs, af]);
            //console.log(cres);
        }
    }
}
let R = 'R';
let L = 'L';
/*console.log([R,8,R,8,R,4,R,4,R,8,L,6,L,2,R,4,R,4,R,8,R,8,R,8,L,6,L,2])
compr([R,8,R,8,R,4,R,4,R,8,L,6,L,2,R,4,R,4,R,8,R,8,R,8,L,6,L,2], 1, [])*/
compr(movs, 1, [])
/*let compress = (movs, cid) => {
    let sp = 0;
    while(movs[sp] < 0) ++sp;
    for(let i=1;i<20;++i) {
        let af = movs.slice(0, i);
        if (af.join(',').length>20) break;
        if (af.indexOf('-')) break;
        let pozz = [];
        let toks = new HM();
        let patched = [];
        for(let j=i;j<movs.length;++j) {
            if (matchy(movs, j, i)) {
                pozz.push([j,i,cid])
                toks.set(j, [i, cid])
                j+=i;
            }
        }
                
        //console.log(af.length, af.join(',').length * pozz.length)
        //console.log(pozz);
    }
}*/
