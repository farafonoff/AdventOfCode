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

let droid = {
    pos: [0,0],
    map: new HM(),
    lastDir: 1
}
let guess = (droid) => {

}
let patchStatus = (droid, status) => {
    switch(status) {
        
    }
}
let code;
/*code = [...contents[0]]
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
};*/
let map = new HM();
let open = [{
    pos: [0,0],
    steps: 0,
    code: [...contents[0]],
    state: undefined,
}]
let closed = []
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
while (open.length > 0) {
    let node = open.shift();
    for (let direction = 1; direction < 5; ++direction) {
        let potentialPos = patchDir(node.pos, direction);
        if (map.has(potentialPos)) {
            continue;
        }
        let newNode = _.cloneDeep(node);
        let state = newNode.state;
        let code = newNode.code;
        state = rints(code, [], state)
        while (!state.shouldInput) {
            state = rints(code, [], state)
        };
        state = rints(code, [direction], state);
        while (state.output === undefined) {
            state = rints(code, [], state);
        }
        switch (state.output) {
            case 0: {
                map.set(potentialPos, 0)
                break;
            }
            case 1:
            case 2: {
                map.set(potentialPos, state.output)
                newNode.pos = potentialPos;
                newNode.state = state;
                newNode.code = code;
                newNode.steps += 1;
                open.push(newNode)
            }
        }
    }
    closed.push(node);
}
draw(map)
let oxy = closed.find(node => map.get(node.pos) === 2);
console.log('ans1', oxy.steps)
let open2 = [[...oxy.pos, 0]]
closed = []
while(open2.length) {
    let pos = open2.shift();
    for (let direction = 1; direction < 5; ++direction) {
        let potentialPos = patchDir(pos, direction);
        let mv = map.get(potentialPos)
        //console.log(potentialPos, mv)
        if (mv === 0 || mv === 2) {
            continue;
        }
        map.set(potentialPos, 2)
        open2.push([...potentialPos, pos[2]+1])
    }
    //console.log(open2)
    closed.push(pos);
}
draw(map)
console.log('ans2',closed[closed.length-1][2])
/*let map = new HM();

let dfs = (code, nextDir, len) => {
    let currentState = [...code];

}
*/
