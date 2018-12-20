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
let directions = {
    S: [0, 1],
    N: [0, -1],
    E: [1, 0],
    W: [-1, 0],
};

function walk(arr, idx, paths) {
    let result = '';
    for(let i=idx;i<arr.length;++i) {
        console.log(arr[i])
        if (arr[i] === '(') {
            let branches = [];
            while(arr[i]!==')') {
                let [res, nidx] = walk(arr, i+1, paths);
                console.log(res)
                i = nidx;
                branches.push(res);
            }
            console.log(branches);
            result += Math.min.apply(null, branches);
        } else
        if (arr[i] === '|') {
            return [result, i]
        } else
        if (arr[i] === ')') {
            return [result, i]
        } else {
            result += arr[i];
        }
    }
    return [result];
}

function solve(str) {
    let arr = `(${str.slice(1, str.length-1)})`.split('');
    return walk(arr, 0)
}



contents.forEach(line => {
    console.log(solve(line));
})
