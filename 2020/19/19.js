const fs = require("fs");
const HM = require("hashmap");
const md5 = require("js-md5");
const PQ = require("js-priority-queue");
const { isNumber } = require("lodash");
const _ = require("lodash");
const infile = process.argv[2] || "input";
function decimalToHex(d, padding) {
  var hex = Number(d).toString(16);
  padding =
    typeof padding === "undefined" || padding === null
      ? (padding = 2)
      : padding;

  while (hex.length < padding) {
    hex = "0" + hex;
  }

  return hex;
}

var contents = fs
  .readFileSync(infile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.split(/[ \t]/).map(Number));
//var contents = fs.readFileSync('input', 'utf8').split("\n").map(s => s.trim()).filter(s => s.length > 0).map(s => s.match(/(\d+)-(\d+) (\w): (\w+)/)); // [orig, g1, g2 ...] = content
let ruleset = [];
let messages = [];
function trnum(val) {
  let nn = Number(val);
  if (isFinite(nn)) {
    return nn;
  }
  return val;
}
contents.forEach((line) => {
  let m1 = line.match(/^(\d+): (.*)$/);
  if (m1) {
    m1 = m1.slice(1);
    let rest = m1[1]
      .split(" ")
      .filter((ch) => !!ch)
      .map(trnum);
    if (rest.length === 1 && !isNumber(rest[0])) rest = [rest[0].slice(1, 2)];
    ruleset.push([trnum(m1[0]), ...rest]);
  } else {
    messages.push(line);
  }
});
const rmap = new Map(ruleset.map((r) => [r[0], r.slice(1)]));

function solver(part2) {
  const patch = part2;
  function mkrex2(irule) {
    if (patch) {
      if (irule === 8) {
        return `((${mkrex2(42)})+)`;
      }
      if (irule === 11) {
        let parts = [];
        for (let i = 1; i < 6; ++i) {
          parts.push(`(((${mkrex2(42)}){${i}})((${mkrex2(31)}){${i}}))`);
        }
        return `(${parts.join("|")})`;
      }
    }
    const rule = rmap.get(irule);
    if (!rule) {
      console.log(irule, rmap.get(irule));
    }
    if (rule.indexOf("|") !== -1) {
      const cindex = rule.indexOf("|");
      const p1 = rule
        .slice(0, cindex)
        .map((r) => mkrex2(r))
        .join("");
      const p2 = rule
        .slice(cindex + 1)
        .map((r) => mkrex2(r))
        .join("");
      return `((${p1})|(${p2}))`;
    }
    if (!isNumber(rule[0])) {
      return rule[0];
    }
    const res = rule.map((r) => mkrex2(r)).join("");
    return `(${res})`;
  }

  //console.log(mkrex2(0))
  vrule = new RegExp(new RegExp(`^${mkrex2(0)}$`));
  let ans2 = messages.filter((msg) => {
    //console.log(msg, !!msg.match(vrule));
    return !!msg.match(vrule);
    //msg.match(vrule)
  });
  return ans2.length;
}

console.log(solver(false));
console.log(solver(true));

/*
function rematch(irule, str, start) {
  const rule = rmap.get(irule);
  let match;
  if (!isNumber(rule[0])) {
    match = str[start] === rule[0];
    return match ? [start + 1] : null;
  }
  let cpos = rule.findIndex('|')
  if (cpos === -1) {
  }
}
*/
/*
let grammar = "start = r_0 \n";
function gtok(i) {
  if (isNumber(i)) {
    return `r_${i}`;
  } else {
    return `"${i}"`;
  }
}
function rp(val) {
  return val.map((rv) => gtok(rv)).join(" ");
}
function gramm(key, val) {
  const rule = gtok(key) + " = " + rp(val);
  return rule;
}
rmap.forEach((val, key) => {
  if (val.indexOf("|") === -1) {
    grammar += gramm(key, val) + "\n";
  } else {
    let ii = val.indexOf("|");
    grammar +=
      gtok(key) +
      " = " +
      rp(val.slice(0, ii)) +
      " / " +
      rp(val.slice(ii + 1)) +
      "\n";
  }
});
console.log(grammar);
var peg = require("pegjs");

var parser = peg.generate(grammar);
let ans2 = messages.filter((msg) => {
  try {
    parser.parse(msg);
    console.log(msg)
    return true;
    e;
  } catch (pe) {
    console.log(msg, pe)
    return false;
  }
}).length;
console.log(ans2);
*/
/*let grammar = "start : r_0 \n";
function gtok(i) {
  if (isNumber(i)) {
    return `r_${i}`;
  } else {
    return `'${i}'`;
  }
}
function rp(val) {
  return val.map((rv) => gtok(rv)).join(" ");
}
function gramm(key, val) {
  const rule = gtok(key) + " : " + rp(val);
  return rule;
}
rmap.forEach((val, key) => {
  if (val.indexOf("|") === -1) {
    grammar += gramm(key, val) + ";\n";
  } else {
    let ii = val.indexOf("|");
    grammar +=
      gtok(key) +
      " : " +
      rp(val.slice(0, ii)) +
      " | " +
      rp(val.slice(ii + 1)) +
      ";\n";
  }
});
console.log(grammar);
/*
const nearley = require("nearley");
const compile = require("nearley/lib/compile");
const generate = require("nearley/lib/generate");
const nearleyGrammar = require("nearley/lib/nearley-language-bootstrapped");

function compileGrammar(sourceCode) {
  // Parse the grammar source into an AST
  const grammarParser = new nearley.Parser(nearleyGrammar);
  grammarParser.feed(sourceCode);
  const grammarAst = grammarParser.results[0]; // TODO check for errors

  // Compile the AST into a set of rules
  const grammarInfoObject = compile(grammarAst, {});
  // Generate JavaScript code from the rules
  const grammarJs = generate(grammarInfoObject, "grammar");

  // Pretend this is a CommonJS environment to catch exports from the grammar.
  const module = { exports: {} };
  eval(grammarJs);

  return module.exports;
}

const cgr = compileGrammar(grammar);

let ans2 = messages.filter((msg) => {
  try {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(cgr));
    let res = parser.feed(msg);
    console.log(msg);
    if (msg === "aaaabbaaaabbaaa") console.log(res)
    return true;
  } catch (pe) {
      //console.log(msg, pe)
      return false
  }
}).length;
console.log(ans2);
*/
