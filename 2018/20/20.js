// 20   02:43:17   517      0   02:44:54   461      0
//1. js doesn't have native partial match (analog of .hitEnd in java)
//2. node.js on windows has limited stack size, so recursion can be done with setImmediate

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

let directions = {
    S: [0, 1],
    N: [0, -1],
    E: [1, 0],
    W: [-1, 0],
};
let save_stack = true;
let sw = (p1, p2) => [p1[0]+p2[0], p1[1] + p2[1]];
let distances = new HM();
let calcResult = () => {
    var md = 0;
    var a2 = 0;
    distances.keys().forEach(point => {
        var dd = distances.get(point)
        if (dd > md) {
            md = dd;
        }
        if (dd >= 1000) {
            ++a2;
        }
    });
    console.log([md, a2]);
    return [md, a2];
}
function solve(line) {
    var re = new RegExp(line).toPartialMatchRegex();
    function dfs(prefix, depth, point) {
        var matchez = false;
        if (!distances.has(point) || distances.get(point) > depth) {
            distances.set(point, depth)
            Object.keys(directions).forEach(key => {
                var s = prefix + key;
                if (re.exec(s)) {
                    //console.log(s);
                    if (save_stack) {
                        setImmediate(() => dfs(s, depth + 1, sw(point, directions[key])));
                    } else {
                        dfs(s, depth + 1, sw(point, directions[key]))
                    }
                }
            })
        }
    }
    dfs("", 0, [0, 0])
    if (save_stack) {
        process.on('exit', calcResult);
    } else {
        calcResult();
    }
    
}


contents.forEach(line => {
    solve(line);
})
