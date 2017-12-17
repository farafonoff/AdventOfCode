solutions to AoC. Some has constant 'puzzle' inside (values are 1 and 2), others has two sources.

days 1-6 are mostrly trivial.

day 7: for part1, find node with no inbound edges. for part2, go deep from part1 solution, counting weights on backtrack.
'first' in order disbalanced node need to be checked.

day 13: period of scanner is (range-1) steps, multiply 2 (back and forth). scanner hits packet if (depth%period === 0)

day 16: after invalid optimisations, found period of dance.