//  13   00:59:36   495      0   01:28:50   521      0
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

var contents = fs.readFileSync('input', 'utf8').split("\n").filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
var map = [];
contents.forEach((line, y) => {
    let ln = line.split('');
    map.push(ln);
})
/*
cartState
*/
dump();
function dump() {
    let out = map.map(row => row.join('')).join('\n');
    console.log(out);
}
var states = new HM();
var crash = false;
var step = 0;
/*var dirz = []
dirz[1] = ['>']
dirz[-1] = ['<']
dirz[0] = { 1: 'v', '-1': '^'}*/
var is2 = true;
var dirz = ['^','>','v','<']
var lt = (ch) => {
    let dir = dirz.indexOf(ch);
    dir -=1;
    if (dir<0) return dirz[3]; else return dirz[dir];
}
var rt = (ch) => {
    let dir = dirz.indexOf(ch);
    dir +=1;
    if (dir>3) return dirz[0]; else return dirz[dir];
}
function moveCart(x,y,dx,dy,ch,cartState) {
    if (cartState === undefined) {
        cartState = {
            x, y,
            turn: 0,
            underchar: dx==0?'|':'-',
            ch
        }
    }
    let turn = cartState.turn;
    let myc = [x,y];
    map[y][x] = cartState.underchar;
    //console.log(x,y,dx,dy)
    x+=dx;
    y+=dy;
    if (dirz.includes(map[y][x])) {
        if (is2) {
            console.log(`removing ${x},${y}`);
            let oldState = states.get([x,y]);
            states.remove([x,y])
            states.remove(myc);
            map[y][x] = oldState.underchar;
            console.log(states.count(), states)
            if (states.count() === 1) {
                let left = states.values()[0];
                switch(left.ch) {
                    case '^': left.y-=1;break;
                    case 'v': left.y+=1;break;
                    case '>': left.x+=1;break;
                    case '<': left.x-=1;break;
                }
                console.log(`${left.x},${left.y}`)
                crash = true;
            }
            return undefined;
        } else {
            console.log(`${x},${y}`);
            crash = true;
        }
    }
    let rch = ch;
    let underchar = map[y][x];
    if (underchar === '|' || underchar === '-') {
    } else if (underchar === '/') {
        if (ch === '^') rch = '>';
        if (ch === '<') rch = 'v';
        if (ch === '>') rch = '^';
        if (ch === 'v') rch = '<';
    }else if (underchar === '\\') {
        if (ch === '^') rch = '<';
        if (ch === '>') rch = 'v';
        if (ch === '<') rch = '^';
        if (ch === 'v') rch = '>';
    }else if (underchar === '+') {
        switch(turn) {
            case 0: {
                rch = lt(ch);
                break;
            }
            case 1: {
                //
                break;
            }
            case 2: {
                rch = rt(ch);
            }
        }
        turn++;
        turn = turn%3;
    } else {
        console.log(`${x},${y}`);
        crash = true;
    }
    map[y][x] = rch;
    //console.log(cartState, rch);
    cartState = {
        x,y,turn,underchar,ch
    }
    //console.log(cartState);
    return cartState;
}
function advance() {
    states.values().forEach(st => st.moved = false);
    map.forEach((row, y) => {
        row.forEach((ch, x) => {
            let cartState = states.get([x,y]);
            if (cartState&&cartState.moved) return;
            let newState;
            switch (ch) {
                case '>': newState = moveCart(x,y,1,0,ch,cartState); break;
                case '<': newState = moveCart(x,y,-1,0,ch,cartState); break;
                case '^': newState = moveCart(x,y,0,-1,ch,cartState); break;
                case 'v': newState = moveCart(x,y,0,1,ch,cartState); break;
            }
            if (newState) {
                states.remove([x,y]);
                newState.moved = true;
                states.set([newState.x, newState.y], newState)
            }
        })
    })
}
while ((!crash) && step < 500000000) {
    advance();
    //dump();
    ++step;
}
//dump();
//{ x: 70, y: 76, turn: 0, underchar: '-', ch: '>', moved: false }
//{ x: 6, y: 5, turn: 0, underchar: '|', ch: '^', moved: false }