from z3 import *
import re
x, y, z, matches, mdist = Ints('x y z matches dist')
o = Optimize()
valid = re.compile('pos=<(-?\d+),(-?\d+),(-?\d+)>, r=(-?\d+)')
inf = open("input", "r")
def zabs(x):
  return If(x >= 0,x,-x)
indata = []
bots=[]
idx = 0
for line in inf:
    result = valid.match(line)
    if result:
        x1,y1,z1,r1 = int(result.group(1)),int(result.group(2)),int(result.group(3)),int(result.group(4))
        bot = Ints('bot_'+str(idx))[0]
        o.add(bot == If(zabs(x-x1)+zabs(y-y1)+zabs(z-z1)<=r1, 1, 0))
        idx += 1
        bots.append(bot)
        #indata.append((x1,y1,z1,r1))

o.add(matches == sum(bots))
o.add(mdist==zabs(x)+zabs(y)+zabs(z))
h1 = o.maximize(matches)
h2 = o.minimize(mdist)
print(o.check())
print(o.model()[x])
print(o.model()[y])
print(o.model()[z])
print(o.model()[matches])
print(o.model()[mdist])