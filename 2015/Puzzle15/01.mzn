var 0..100: Sprinkles;
var 0..100: PeanutButter;
var 0..100: Frosting;
var 0..100: Sugar;

%Sprinkles: capacity 5, durability -1, flavor 0, texture 0, calories 5
%PeanutButter: capacity -1, durability 3, flavor 0, texture 0, calories 1
%Frosting: capacity 0, durability -1, flavor 4, texture 0, calories 6
%Sugar: capacity -1, durability 0, flavor 0, texture 2, calories 8

constraint Sprinkles+PeanutButter+Frosting+Sugar=100;
var float: points1 = (5*Sprinkles  -1*PeanutButter  +0*Frosting  -1*Sugar);
var float: points2 = (-1*Sprinkles +3*PeanutButter  -1*Frosting  +0*Sugar);
var float: points3 = (0*Sprinkles  +0*PeanutButter  +4*Frosting  +0*Sugar);
var float: points4 = (0*Sprinkles  +0*PeanutButter  +0*Frosting  +2*Sugar);
var float: points = (max(0,points1)*max(0,points2)*max(0,points3)*max(0,points4));

solve maximize points;

output [show(points)]



