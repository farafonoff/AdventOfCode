var 0..100: b;
var 0..100: c;

constraint b+c=100;
var float: points1 = (2*c-b);
var float: points2 = (3*c-2*b);
var float: points3 = (6*b-2*c);
var float: points4 = (3*b-1*c);
var float: points = (max(0,points1)*max(0,points2)*max(0,points3)*max(0,points4));

solve maximize points;

output [show(points)]



