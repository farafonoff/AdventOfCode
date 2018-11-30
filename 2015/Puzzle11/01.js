function next(sarr) {
  for(var i=7;i>=0;--i) {
    var c = sarr[i];
    var cc = c.charCodeAt(0);
    if (c<'z') {
      sarr[i] = String.fromCharCode(cc+1);
      return sarr;
    } else {
      sarr[i] = 'a';
    }
  }
}

function check1(sarr) {
  for(var i=2;i<8;++i) {
    var c0 = sarr[i-2].charCodeAt(0);
    var c1 = sarr[i-1].charCodeAt(0);
    var c2 = sarr[i].charCodeAt(0);
    if (c0+2==c2&&c1+1==c2) {
      return true;
    }
  }
  return false;
}

function check2(sarr) {
  for(var i=0;i<8;++i) {
    switch(sarr[i]) {
      case 'i': return false;
      case 'l': return false;
      case 'o': return false;
    }
  }
  return true;
}


function check3(sarr) {
  var pairs = 0;
  for(var i=1;i<8;++i) {
    if (sarr[i]==sarr[i-1]) {
      pairs+=1;
      i+=1;
    }
  }
  return pairs>1;
}

function check(sarr) {
  return check1(sarr)&&check2(sarr)&&check3(sarr);
}

function next_valid(str) {
  var sarr = str.split('');
  sarr = next(sarr);
  while(!check(sarr)) {
    sarr = next(sarr);
  }
  return sarr.join('');
}

console.log(next_valid('abcdefgh'));
console.log(next_valid('ghijklmn'));
console.log(next_valid('hxbxwxba'));
console.log(next_valid(next_valid('hxbxwxba')));
