const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8');//.split("\n");

var json = JSON.parse(contents);

function sum(json) {
  if (typeof json == "number") {
    return Number(json);
  }
  if (typeof json == "string") {
    return 0;
  }
  var res = 0;
  for(key in json) {
    res += sum(json[key]);
  }
  return res;
}
function sumNotRed(json) {
  if (typeof json == "number") {
    return Number(json);
  }
  if (typeof json == "string") {
    return 0;
  }
  var res = 0;
  var isObj = !Array.isArray(json);
  var hasRed = false;
  for(key in json) {
    var val = json[key];
    if (val==="red") hasRed = true;
    res += sumNotRed(val);
  }
  if (isObj&&hasRed) return 0;
  return res;
}

console.log(sum(JSON.parse("[[3]]")));
console.log(sum(JSON.parse('{"a":2,"b":4}')));
console.log(sum(JSON.parse('{"a":{"b":4},"c":-1}')));
console.log(sum(JSON.parse('{}')));
console.log(sum(json));

console.log(sumNotRed(JSON.parse("[[3]]")));
console.log(sumNotRed(JSON.parse('{"a":2,"b":4}')));
console.log(sumNotRed(JSON.parse('{"a":{"b":4, "c":"red"},"c":-1}')));
console.log(sumNotRed(JSON.parse('{}')));
console.log(sumNotRed(json));

