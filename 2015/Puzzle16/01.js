const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");
var regex = /^Sue ([0-9]+): ([a-z]+): ([0-9]+), ([a-z]+): ([0-9]+), ([a-z]+): ([0-9]+)$/i;
var lesser = /pomeranians|goldfish/i;
var greater = /cats|trees/i;

var template = {
    children: 3,
    cats: 7,
    samoyeds: 2,
    pomeranians: 3,
    akitas: 0,
    vizslas: 0,
    goldfish: 5,
    trees: 3,
    cars: 2,
    perfumes: 1
}

console.log(template);

var filter1 = aunt=>{
  if (aunt==null) return false;
  for(var key in aunt) {
    if (template[key]!=undefined) {
      if (aunt[key]!==template[key]) {
        return false;
      }
    }
  }
  return true;
}

var filter2 = function(aunt) {
  if (aunt==null) return false;
  for(var key in aunt) {
    if (template[key]!=undefined) {
      if (key.match(greater)) {
        if (aunt[key]<=template[key]) return false;
      } else
      if (key.match(lesser)) {
        if (aunt[key]>=template[key]) return false;
      } else
      if (aunt[key]!==template[key]) {
        return false;
      }
    }
  }
  return true;
}

var matches = contents.map(str=>{
  var match = str.match(regex);
  if (match==null) {
    return null;
  }
  var pat = {id:match[1]};
  pat[match[2]] = Number(match[3]);
  pat[match[4]] = Number(match[5]);
  pat[match[6]] = Number(match[7]);
  return pat;
}).filter(filter2);


console.log(matches);

