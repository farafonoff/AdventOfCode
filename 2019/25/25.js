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

let pushstr = (code, state, str) => {
    let msg = [];
    str.split('').forEach(ch => {
        while (!state.shouldInput) {
            state = rints(code, [], state);
            if (state.done) throw 'didnt wait!!';
            if (state.output) {
                msg.push(String.fromCharCode(state.output))
            }
        }
        state = rints(code, [ch.charCodeAt(0)], state);
    })
    while (!state.shouldInput) {
        state = rints(code, [], state);
        if (state.done) throw 'didnt wait!!';
        if (state.output) {
            msg.push(String.fromCharCode(state.output))
        }
    }
    state = rints(code, [10], state);
    /*if (msg.length) {
        console.log(msg.join(''))
    }*/
    return state;
}


let states = new HM();


function dfs(code, state) {
    let line = [];
    let lines = [];
    while (!state.done) {
        if (state.shouldInput) {
            //console.log(lines);
            let roomName = lines[3];
            let descr = lines[4];
            let items = [];
            let directions = [];
            let di = lines.indexOf('Doors here lead:') + 1;
            while (lines[di] !== '') {
                directions.push(lines[di].split(' ')[1]);
                ++di;
            }
            let ii = lines.indexOf('Items here:') + 1;
            if (ii !== 0) {
                while (lines[ii] !== '') {
                    items.push(lines[ii].substr(2));
                    ++ii;
                }
            }
            //console.log(roomName, directions, items);
            if (states.has(roomName)) return;
            states.set(roomName, { roomName, descr, items, directions });
            lines = [];
            directions.forEach(dir => {
                let newcode = [...code];
                let newstate = pushstr(newcode, state, dir);
                //console.log(dir)
                dfs(newcode, newstate);
            })
            return;
        }
        if (state.output !== undefined) {
            if (state.output > 1000) {
                console.log(state.output)
            }
            if (state.output !== 10) {
                line.push(String.fromCharCode(state.output))
            } else {
                let lj = line.join('');
                //console.log(lj);
                lines.push(lj);
                line = [];
            }
            if (state.output === 0) break;
        }
        state = rints(code, [], state)
    };
}

let backtracks = {
    north: 'south',
    east: 'west',
    west: 'east',
    south: 'north'
}
function collectDFS(code, state, item, visited, backtrack) {
    let line = [];
    let lines = [];
    if (!state) {
        console.log(code, state, item, visited)
    }
    while (!state.done) {
        if (state.shouldInput) {
            //console.log(lines);
            let roomName = lines[3];
            if (!roomName.startsWith('==')) {
                console.log(lines)
                return null;
            }
            if (roomName === '== Pressure-Sensitive Floor ==') {
                let msg = lines[9];
                if (msg.indexOf('Alert') === -1) {
                    console.log(lines)
                }
                //console.log(msg);
                return { done: true, message: msg};
            }
            if (roomName === '== Security Checkpoint ==' && item !== '') {
                //console.log(lines)
                return null;                
            }
            let descr = lines[4];
            let items = [];
            let directions = [];
            let di = lines.indexOf('Doors here lead:') + 1;
            while (lines[di] !== '') {
                directions.push(lines[di].split(' ')[1]);
                ++di;
            }
            let ii = lines.indexOf('Items here:') + 1;
            if (ii !== 0) {
                while (lines[ii] !== '') {
                    items.push(lines[ii].substr(2));
                    ++ii;
                }
            }
            //console.log(roomName, directions, items, item);
            if (items.indexOf(item)!== -1) {
                //console.log(lines);
                let cmd = `take ${item}`;
                console.log(cmd, backtrack);
                let newcode = [...code];
                let newstate = pushstr(newcode, state, cmd);
                newstate = pushstr(newcode, newstate, backtrack);
                //collectDFS(newcode, newstate, '', visited, '');
                //code = newcode; state = newstate;
                return {code: newcode, state: newstate};
            }
            if (visited.has(roomName)) return;
            visited.set(roomName, { roomName, descr, items, directions });
            lines = [];
            try {
                directions.forEach(dir => {
                    let newcode = [...code];
                    let newstate = pushstr(newcode, state, dir);
                    //console.log(dir)
                    let res = collectDFS(newcode, newstate, item, visited, backtracks[dir]);
                    if (res) {
                        throw res;
                    }
                })
            } catch (result) {
                return result;
            }
            return;
        }
        if (state.output !== undefined) {
            if (state.output > 1000) {
                console.log(state.output)
            }
            if (state.output !== 10) {
                line.push(String.fromCharCode(state.output))
            } else {
                let lj = line.join('');
                //console.log(lj);
                lines.push(lj);
                line = [];
            }
            if (state.output === 0) break;
        }
        state = rints(code, [], state)
    };
    console.log(lines)
    console.log('DONE!!')
}
let code = [...contents[0]]
let state = rints(code, []);
dfs(code, state)
let allitems = [];
states.values().forEach(val => {
    //console.log(val)
    allitems = allitems.concat(val.items);
})
console.log(allitems.length, allitems)

function collectItems(myitems) {
    let code = [...contents[0]]
    let state = rints(code, []);
    let mstate = { code, state };
    myitems.forEach(item => {
        console.log('++++', item)
        let visited = new HM();
        mstate = collectDFS(mstate.code, mstate.state, item, visited)
        if (mstate === null) {
            throw 'badset'
        }
    })
    //console.log(mstate)
    let estate = collectDFS(mstate.code, mstate.state, '', new HM())
    let msg = estate.message;
    console.log(estate.message);
    if (msg.indexOf('lighter') !== -1) {
        return -1;
    }
    return 0;
    //console.log(visited)
    /*collectDFS(code, state, myitems);
    remitems.forEach((item, index) => {
        
    })*/
}
collectItems([ 'monolith', 'astrolabe', 'tambourine', 'dark matter' ]);
return;

let baditems = ['giant electromagnet', 'infinite loop', 'photons', 'molten lava', 'escape pod'];

function dfs2(myitems, remitems) {
    let fitem = remitems.shift();
    try {
        let res = 0;
        if (myitems.length) {
            console.log(myitems);
            res = collectItems(myitems);
        }
        if (fitem && res === 0) {
            dfs2([...myitems, fitem], remitems);
            dfs2([...myitems], remitems);
        }
    } catch (err) {
        console.log(err, myitems);
    }
    remitems.unshift(fitem);
}

allitems = allitems.filter(item => !baditems.includes(item));

dfs2([], allitems);
//collectItems(['cake']);