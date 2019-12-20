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

var contents = fs.readFileSync('input', 'utf8').split("\n").map(row => {
    return row.split('').filter(ch => ch.charCodeAt(0)>31).join('')
}).filter(s => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
let AC = 'A'.charCodeAt(0);
let ZC = 'Z'.charCodeAt(0);
let isLC = (char) => char.charCodeAt(0)<=zc && char.charCodeAt(0)>=ac; 
let isUC = (char) => char.charCodeAt(0)<=ZC && char.charCodeAt(0)>=AC;
let toLC = (char) => String.fromCharCode(char.charCodeAt(0)-AC+ac);
let posExpand = (pos) => {
    let res = [
      [pos[0]+1,pos[1]],
      [pos[0]-1,pos[1]],
      [pos[0],pos[1]+1],
      [pos[0],pos[1]-1]
    ]
    return res;
}
let map = []
contents.forEach((line, y) => {
    let chars = line.split('')
    map.push(chars);
})
let portals = {};
map.forEach((row, y) => {
    row.forEach((char, x) => {
        if (isUC(char)) {
            let neighbours = posExpand([y,x]);
            let pp;
            let och;
            neighbours.forEach(np => {
                let ch = _.get(map,np, ' ')
                if (ch==='.') {
                    pp = np;
                }
                if (isUC(ch)) {
                    och = ch;
                }
            })
            if (pp) {
                let pname = [char, och];
                pname.sort();
                portals[pname.join('')] = portals[pname.join('')]||[];
                portals[pname.join('')].push(pp);
            }
        }
    })
})
let revportals = new HM();;
_.forOwn(portals, (pos, portal) => {
    pos.forEach((pp) => {
        revportals.set(pp, portal);
    })
    // outer
    if (pos.length>1) {
        if (pos[1][0] === 2 || pos[1][1] === 2 || pos[1][0] === map.length - 3 || pos[1][1] === map[0].length - 3) {
            pos = [pos[1], pos[0]]
            portals[portal] = pos;
        }
    }
})
let spos = portals['AA'][0];
let open = [];
_.set(open, [...spos, 0], 0)
let queue = [{pos: spos, step: 0, depth: 0}];
while(queue.length) {
    let state = queue.shift();
    if (revportals.has(state.pos)) {
        let portal = revportals.get(state.pos);
        if (portal == 'ZZ' && state.depth === 0) {
            break;
        }
        if (portal !== 'AA'&&portal !=='ZZ') {
            let exits = portals[portal];
            let otherExit;
            let oeid;
            exits.forEach((exit, eid) => {
                if (!_.isEqual(exit, state.pos)) {
                    otherExit = exit;
                    oeid = eid;
                }
            })
            state = {
                step: state.step + 1,
                pos: otherExit,
                depth: oeid === 0?state.depth + 1:state.depth - 1
            }
            if (state.depth < 0) continue;
        }
    }
    let neighbours = posExpand(state.pos);
    neighbours.forEach((np) => {
        let expanded = [...np, state.depth]
        if (_.get(open, expanded, Infinity)<state.step) return;
        if (_.get(map, np, '#') !== '.') return;
        let ns = {
            pos: np,
            step: state.step + 1,
            depth: state.depth
        };
        _.set(open, expanded, ns.step)
        queue.push(ns);
    })
}

console.log(_.get(open, [...portals['ZZ'][0], 0]))

/*map.forEach((row, y) => {
    console.log((open[y]||[]).join(','))
})*/
