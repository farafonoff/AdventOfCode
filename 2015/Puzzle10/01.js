//var str = process.argv[2];

function next(str) {
  var res = "";
  var pc=str.charAt(0);
  var count = 1;
  for(var ci=1;ci<str.length;++ci) {
    var c = str.charAt(ci);
    if (c==pc) {
      ++count;
    } else {
      res = res+count.toString()+pc;
      pc = c;
      count = 1;
    }
  }
  res = res+count.toString()+pc;
  return res;
}

console.log(next("1"));
console.log(next("11"));
console.log(next("111221"));
console.log(next("1211"));
var str = "3113322113";
for(var i=0;i<40;++i) {
  str = next(str);
}
console.log(str.length);
for(var i=0;i<10;++i) {
  str = next(str);
}
console.log(str.length);

