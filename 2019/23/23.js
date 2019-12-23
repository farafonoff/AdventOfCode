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
    state.inputs = state.inputs.concat(inputs);
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
            if (state.inputs.length === 0) {
                state.shouldInput = true;
                return state;
            }
            state.shouldInput = false;
            wparam(opmode, 0, ip, line, state.inputs.shift())
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

let comps = [];
for(let i=0;i<50;++i) {
    let code = [...contents[0]]
    let state = rints(code, [i]);
    //console.log(state)
    let queue = [];
    let send = [];
    let pc = {
        code, state, queue, send
    }
    comps.push(pc);
}


let nat = {
    state: null,
    history: null,
    part1done: false,
    nat: function(pak) {
        if (!this.part1done) {
            console.log('part 1', pak.Y);
            this.part1done = true;
        }
        //console.log('NAT', pak)
        this.state = pak;
    },
    idle: function() {
        //console.log(this)
        if (this.state) {
            if (this.history === this.state.Y) {
                console.log('part 2', this.state.Y);
                throw 'done'
            }
            this.history = this.state.Y;
            let pak = this.state;
            send(0, pak.X, pak.Y)
            //console.log('IDLE', pak);
            //console.log(this.history);
            this.state = null;
        }
    }
}
function send(A, X, Y) {
    if (A === 255) {
        //console.log(A, X, Y);
        nat.nat({X, Y});
        //throw 'done'
    } else {
        if (comps[A]) {
            comps[A].queue.push({ X, Y });
            //console.log(comps[A].queue)
        } else {
            //console.log('invalid', A, X, Y);
        }
    }
}

for(let i=0;;++i) {
    let idle = true;
    comps.forEach((comp, id) => {
        let nextState = rints(comp.code, [], comp.state);
        //console.log(id, nextState)
        if (nextState.output!==undefined) {
            //console.log(id, nextState.output, comp.send)
            comp.send.push(nextState.output);
            if (comp.send.length === 3) {
                //console.log(id, comp.send);
                send.apply(null, comp.send);
                comp.send = [];
            }
            comp.idle = false;
        }
        if (nextState.shouldInput) {
            if (!comp.queue.length) {
                nextState = rints(comp.code, [-1], comp.state)
                comp.idle = true;
                //console.log(id, 'recv', -1);
            } else {
                let pak = comp.queue.shift();
                nextState = rints(comp.code, [pak.X, pak.Y], comp.state);
                //console.log(id, 'recv', pak);
                comp.idle = false;
            }
        }
        comp.state = nextState;
        if (!comp.idle) {
            idle = false;
        }
        //console.log('comp', id, comp.state)
        //console.log(comp.state)
    })
    if (idle) {
        //console.log(idle)
        nat.idle();
    }
}
/*comps.forEach(comp => {
    console.log(comp.queue, comp.send, comp.state.ip);
    console.log(rints(comp.code, [], comp.state))
})*/

/*

code = [...contents[0]]
let state = rints(code, []);
while (!state.done) {
    //console.log(state);
    if (state.shouldInput) {
        console.log('input')
        state = rints(code, [1], state);
    }
    if (state.output!==undefined) {
        console.log(state.output);
        if (state.output === 0) break;
    }
    state = rints(code, [], state)
};
*/