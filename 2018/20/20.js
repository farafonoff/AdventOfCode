const fs = require('fs');
const HM = require('hashmap')
const md5 = require('js-md5')
const PQ = require('js-priority-queue')
const _ = require('lodash')

RegExp.prototype.toPartialMatchRegex = function() {
    "use strict";
    
    var re = this,
        source = this.source,
        i = 0;
    
    function process () {
        var result = "",
            tmp;

        function appendRaw(nbChars) {
            result += source.substr(i, nbChars);
            i += nbChars;
        };
        
        function appendOptional(nbChars) {
            result += "(?:" + source.substr(i, nbChars) + "|$)";
            i += nbChars;
        };

        while (i < source.length) {
            switch (source[i])
            {
                case "\\":
                    switch (source[i + 1])
                    {
                        case "c":
                            appendOptional(3);
                            break;
                            
                        case "x":
                            appendOptional(4);
                            break;
                            
                        case "u":
                            if (re.unicode) {
                                if (source[i + 2] === "{") {
                                    appendOptional(source.indexOf("}", i) - i + 1);
                                } else {
                                    appendOptional(6);
                                }
                            } else {
                                appendOptional(2);
                            }
                            break;
                            
                        default:
                            appendOptional(2);
                            break;
                    }
                    break;
                    
                case "[":
                    tmp = /\[(?:\\.|.)*?\]/g;
                    tmp.lastIndex = i;
                    tmp = tmp.exec(source);
                    appendOptional(tmp[0].length);
                    break;
                    
                case "|":
                case "^":
                case "$":
                case "*":
                case "+":
                case "?":
                    appendRaw(1);
                    break;
                    
                case "{":
                    tmp = /\{\d+,?\d*\}/g;
                    tmp.lastIndex = i;
                    tmp = tmp.exec(source);
                    if (tmp) {
                        appendRaw(tmp[0].length);
                    } else {
                        appendOptional(1);
                    }
                    break;
                    
                case "(":
                    if (source[i + 1] == "?") {
                        switch (source[i + 2])
                        {
                            case ":":
                                result += "(?:";
                                i += 3;
                                result += process() + "|$)";
                                break;
                                
                            case "=":
                                result += "(?=";
                                i += 3;
                                result += process() + ")";
                                break;
                                
                            case "!":
                                tmp = i;
                                i += 3;
                                process();
                                result += source.substr(tmp, i - tmp);
                                break;
                        }
                    } else {
                        appendRaw(1);
                        result += process() + "|$)";
                    }
                    break;
                    
                case ")":
                    ++i;
                    return result;
                    
                default:
                    appendOptional(1);
                    break;
            }
        }
        
        return result;
    }
    
    return new RegExp(process(), this.flags);
};

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

/*function walk(arr, idx, paths) {
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
*/
let directions = {
    S: [0, 1],
    N: [0, -1],
    E: [1, 0],
    W: [-1, 0],
};
let sw = (p1, p2) => [p1[0]+p2[0], p1[1] + p2[1]];
let distances = new HM();
function solve(line) {
    let re = new RegExp(line).toPartialMatchRegex();
    function dfs(prefix, depth, point) {
        let matchez = false;
        if (!distances.has(point) || distances.get(point) > depth) {
            distances.set(point, depth)
        }
        Object.keys(directions).forEach(key => {
            let s = prefix+key;
            if (re.exec(s)) {
                //console.log(s);
                dfs(s, depth+1, sw(point, directions[key]));
            }
        })
    }
    dfs("", 0, [0,0])
    let md = 0;
    distances.keys().forEach(point => {
        if (distances.get(point) > md) {
            md = distances.get(point);
        }
    });
    return md;
}


contents.forEach(line => {
    console.log(solve(line));
})
