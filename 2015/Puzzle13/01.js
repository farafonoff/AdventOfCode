const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");

var regex = /^([a-z]+) would (gain|lose) ([0-9]+) happiness units by sitting next to ([a-z]+)\.$/i

var persons = []
var persons_r = {}

/**
 *  * Creates a multidimensional Array
 *   * @param  {Number} length Number of dimensions the new Array should have
 *    * @return {Array}        The newly created Array
 *     */
function createArray(length) {
  var arr = new Array(length || 0),
  i = length;

  if (arguments.length > 1) {
    var args = Array.prototype.slice.call(arguments, 1);
    while(i--) arr[length-1 - i] = createArray.apply(this, args);
  }

  return arr;
}

var dims = createArray(9,9);

function person(str) {
  if (persons_r[str]!=undefined) {
    return persons_r[str];
  }
  var id = persons.length;
  persons.push(str);
  persons_r[str] = id;
  return id;
}

contents.forEach(function(str) {
  var match = str.match(regex);
  if (match===null) return;
  var id1 = person(match[1]);
  var id2 = person(match[4]);
  var val = Number(match[3]);
  var verb = match[2];
  if (verb==="lose") {
    val = -val;
  }
  dims[id1][id2] = val;
});

console.log(dims);
var bft_result = 0;

function bft_best(first,pc,sum, bfpersons) {
  var max = 0;
  if (bfpersons.length==0) {
    var tsum = dims[pc][first]+dims[first][pc]+sum;
    if (tsum>bft_result) {
      bft_result = tsum;
    }
  }
  for(var i = 0;i<bfpersons.length;++i) {
    var ct = bfpersons[i];
    var down = bfpersons.filter((n) => n!=ct);
    var add = 0;
    if (pc!=-1) {
      add = dims[pc][ct]+dims[ct][pc];
    } else { first = ct }
    bft_best(first,ct,sum+add,down);
  }
  return max;
}

function addMe() {
  var id = person('me');
  for(var i=0;i<id;++i) {
    dims[id][i] = 0;
    dims[i][id] = 0;
  }
}

var init = [];
for(var i=0;i<persons.length;++i) {
  init.push(i);
}
bft_best(null,-1,0,init)
console.log(bft_result);
bft_result = 0;
addMe();
console.log(dims);
init = [];
for(var i=0;i<persons.length;++i) {
  init.push(i);
}
bft_best(null,-1,0,init)
console.log(bft_result);

