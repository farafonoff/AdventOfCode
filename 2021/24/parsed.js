let DEBUG = false;
let w = 0;
let x = 0;
let y = 0;
let z = 0;
let l = 0;
function d(v) {
  if (DEBUG) {
    console.log("HND", data[l], l, v);
    ++l;
  }
}
d([x, y, z]);
w = data[0]; // 0
//x *= 0;
//x += z;
//x = x % 26;
//z = Math.trunc(z / 1);
//x += 10;
//x = x === w ? 1 : 0;
//x = 1; //x = x === 0 ? 1 : 0;
//y *= 0;
//y = 25;
//y *= x;
//y += 1;
//z *= y;
//y *= 0;
//y = w;
//y += 2;
// y *= x;
//z = y;
y = w + 2;
z = y;
d([x, y, z]);
w = data[1]; // 1
//x = 0;
//x += z;
//x = 0; // x = x % 26;
// z = Math.trunc(z / 1);
//x += 15;
//x = x === w ? 1 : 0;
//x = 1; //x = x === 0 ? 1 : 0;
//y *= 0;
//y += 25;
//y = 25; //y *= x;
//y = 26; //y += 1;
//z *= y;
//y *= 0;
//y = w; //y += w;
//y += 16;
// y *= x;
//z += y;
y = w + 16;
z = z * 26 + y;
d([x, y, z]);
w = data[2]; // 2
//x *= 0;
//x += z;
//x = x % 26;
//x = y;
// z = Math.trunc(z / 1);
//x += 14;
//x = x === w ? 1 : 0;
//x = 1; //x = x === 0 ? 1 : 0;
//y *= 0;
//y += 25;
//y *= x;
//y += 1;
//z *= y;
//y *= 0;
//y += w;
//y += 9;
//y *= x;
//z += y;
y = w + 9;
z = z * 26 + y;
d([x, y, z]);
w = data[3]; // 3
//x *= 0;
//x += z;
//x = x % 26;
//x = y;
//z = Math.trunc(z / 1);
//x += 15;
//x = x === w ? 1 : 0;
//x = 1; //x = x === 0 ? 1 : 0;
//y *= 0;
//y += 25;
//y *= x;
//y += 1;
//z *= y;
//y *= 0;
//y += w;
//y += 0;
//y *= x;
//z += y;
y = w;
z = z * 26 + y;
d([x, y, z]);
w = data[4]; // 4
//x *= 0;
//x += z;
//x = x % 26;
//x = y;
//x += -8;
y = z % 26;
z = Math.trunc(z / 26);
//d([y - 8, w]);
if (y - 8 === w) {
  // x==0
  y = 0;
  //z = z;
} else {
  // x==1
  y = w + 1;
  z = z * 26 + y;
}
//x = x === w ? 1 : 0;
//x = x === 0 ? 1 : 0;
//y *= 0;
//y += 25;
//y *= x;
//y += 1;
//z *= y;
//y *= 0;
//y += w;
//y += 1;
//y *= x;
//z += y;
d([x, y, z]);
w = data[5]; // 5
/*x *= 0;
x += z;
x = x % 26;
z = Math.trunc(z / 1);
x += 10;
x = x === w ? 1 : 0;
x = x === 0 ? 1 : 0;
y *= 0;
y += 25;
y *= x;
y += 1;
z *= y;
y *= 0;
y += w;
y += 12;
y *= x;
z += y;*/
y = w + 12;
z = z * 26 + y;
d([x, y, z]);
w = data[6];
y = z % 26;
z = Math.trunc(z / 26);
if (y - 16 === w) {
  // x==0
  //z = z;
  y = 0;
  z = z + y;
} else {
  // x==1
  y = w + 6;
  z = z * 26 + y;
}
/*
x *= 0;
x += z;
x = x % 26;
z = Math.trunc(z / 26);
x += -16;
x = x === w ? 1 : 0;
x = x === 0 ? 1 : 0;
y *= 0;
y += 25;
y *= x;
y += 1;
z *= y;
y *= 0;
y += w;
y += 6;
y *= x;
z += y;*/
d([x, y, z]);
w = data[7];
y = z % 26;
z = Math.trunc(z / 26);
//d([y - 4, w]);
if (y - 4 === w) {
  // x==0
  //z = z;
  y = 0;
  z = z + y;
} else {
  // x==1
  y = w + 6;
  z = z * 26 + y;
}
/*x *= 0;
x += z;
x = x % 26;
z = Math.trunc(z / 26);
x += -4;
x = x === w ? 1 : 0;
x = x === 0 ? 1 : 0;
y *= 0;
y += 25;
y *= x;
y += 1;
z *= y;
y *= 0;
y += w;
y += 6;
y *= x;
z += y;*/
d([x, y, z]);
w = data[8];
/*x *= 0;
x += z;
x = x % 26;
z = Math.trunc(z / 1);
x += 11;
x = x === w ? 1 : 0;
x = x === 0 ? 1 : 0;
y *= 0;
y += 25;
y *= x;
y += 1;
z *= y;
y *= 0;
y += w;
y += 3;
y *= x;
z += y;*/
y = w + 3;
z = z * 26 + y;
d([x, y, z]);
w = data[9];
y = z % 26;
z = Math.trunc(z / 26);
if (y - 3 === w) {
  // x==0
  //z = z;
  y = 0;
  z = z + y;
} else {
  // x==1
  y = w + 5;
  z = z * 26 + y;
}
/*x *= 0;
x += z;
x = x % 26;
z = Math.trunc(z / 26);
x += -3;
x = x === w ? 1 : 0;
x = x === 0 ? 1 : 0;
y *= 0;
y += 25;
y *= x;
y += 1;
z *= y;
y *= 0;
y += w;
y += 5;
y *= x;
z += y;*/
d([x, y, z]);
w = data[10];
y = w + 9;
z = z * 26 + y;
/*x *= 0;
x += z;
x = x % 26;
z = Math.trunc(z / 1);
x += 12;
x = x === w ? 1 : 0;
x = x === 0 ? 1 : 0;
y *= 0;
y += 25;
y *= x;
y += 1;
z *= y;
y *= 0;
y += w;
y += 9;
y *= x;
z += y;*/
d([x, y, z]);
w = data[11];
y = z % 26;
z = Math.trunc(z / 26);
if (y - 7 === w) {
  // x==0
  //z = z;
  y = 0;
  z = z + y;
} else {
  // x==1
  y = w + 3;
  z = z * 26 + y;
}
/*x *= 0;
x += z;
x = x % 26;
z = Math.trunc(z / 26);
x += -7;
x = x === w ? 1 : 0;
x = x === 0 ? 1 : 0;
y *= 0;
y += 25;
y *= x;
y += 1;
z *= y;
y *= 0;
y += w;
y += 3;
y *= x;
z += y;*/
d([x, y, z]);
w = data[12];
y = z % 26;
z = Math.trunc(z / 26);
if (y - 15 === w) {
  // x==0
  //z = z;
  y = 0;
  z = z + y;
} else {
  // x==1
  y = w + 2;
  z = z * 26 + y;
}
/*x *= 0;
x += z;
x = x % 26;
z = Math.trunc(z / 26);
x += -15;
x = x === w ? 1 : 0;
x = x === 0 ? 1 : 0;
y *= 0;
y += 25;
y *= x;
y += 1;
z *= y;
y *= 0;
y += w;
y += 2;
y *= x;
z += y;*/
d([x, y, z]);
w = data[13];
y = z % 26;
z = Math.trunc(z / 26);
d([y - 7, w]);
if (y - 7 === w) {
  // x==0
  //z = z;
  y = 0;
  z = z + y;
} else {
  // x==1
  y = w + 3;
  z = z * 26 + y;
}
d([x, y, z]);
/*x *= 0;
x += z;
x = x % 26;
z = Math.trunc(z / 26);
x += -7;
x = x === w ? 1 : 0;
x = x === 0 ? 1 : 0;
y *= 0;
y += 25;
y *= x;
y += 1;
z *= y;
y *= 0;
y += w;
y += 3;
y *= x;
z += y;*/
return { x, y, z, w };
