var inp=3310000;

var arr = new Array(inp+1).fill(0);

for(var i=1;i<inp;++i) {
  for(var j=i;j<inp;j+=i) {
    arr[j]+=i;
  }
  //console.log(arr);
}
arr.forEach((e,i)=>{if (e>inp) console.log(i);});
//console.log(arr);

