const fs = require('fs');

var contents = fs.readFileSync('input', 'utf8').split("\n");

var regex = /^([a-z]+) to ([a-z]+) = ([0-9]+)$/i

var cities = []
var cities_r = {}

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

var dims = createArray(100,100);

function city(str) {
  if (cities_r[str]!=undefined) {
    return cities_r[str];
  }
  var id = cities.length;
  cities.push(str);
  cities_r[str] = id;
  return id;
}

contents.forEach(function(str) {
  var match = str.match(regex);
  if (match===null) return;
  var id1 = city(match[1]);
  var id2 = city(match[2]);
  var len = Number(match[3]);
  dims[id1][id2] = len;
  dims[id2][id1] = len;
});
console.log(contents);
console.log(cities);

function bft_shortest(pc, bfcities) {
  var min = 10000000000000;
  if (bfcities.length==0) {
    return 0;
  }
  for(var i = 0;i<bfcities.length;++i) {
    var ct = bfcities[i];
    var down = bfcities.filter((n) => n!=ct);
    var res = bft_shortest(ct,down);
    if (pc!=-1) res+=dims[pc][ct];
    if (res<min) {
      min = res;
    }
  }
  return min;
}
function bft_longest(pc, bfcities) {
  var max = 0;
  if (bfcities.length==0) {
    return 0;
  }
  for(var i = 0;i<bfcities.length;++i) {
    var ct = bfcities[i];
    var down = bfcities.filter((n) => n!=ct);
    var res = bft_longest(ct,down);
    if (pc!=-1) res+=dims[pc][ct];
    if (res>max) {
      max = res;
    }
  }
  return max;
}

var init = [];
for(var i=0;i<cities.length;++i) {
  init.push(i);
}
console.log(bft_shortest(-1,init));
console.log(bft_longest(-1,init));

