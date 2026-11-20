/**
 * Generate src/game/houseGhost.json: the Ghost raced when no player Ghost exists yet.
 * Run: npm run house-ghost
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { COURSE } from '../src/sim/course';
import { OBS_HIT } from '../src/sim/sim';
import { EXPERT } from '../src/sim/autopilot';
import { courseVersion } from '../src/sim/courseVersion';
import { recordFromSim } from '../src/booth/record';
import { HOUSE, runAutopilot } from './autopilotRuns';

const expert = runAutopilot(EXPERT);
const house = runAutopilot(HOUSE);
const hits = (s: typeof house.sim) => s.obsState.filter((x) => x === OBS_HIT).length;
console.log(`expert: ${(expert.sim.finishTick / 60).toFixed(2)} s, hits ${hits(expert.sim)}, perfects ${expert.sim.perfects.reduce((a, b) => a + b)}`);
console.log(`house:  ${(house.sim.finishTick / 60).toFixed(2)} s, hits ${hits(house.sim)}, perfects ${house.sim.perfects.reduce((a, b) => a + b)}`);
const ghost = recordFromSim(house.sim, house.log, {
  id: 'house',
  initials: 'GR',
  courseVersion: courseVersion(COURSE),
  rivalId: null,
  beatRival: false,
  createdAt: 0,
});
const out = fileURLToPath(new URL('../src/game/houseGhost.json', import.meta.url));
writeFileSync(out, JSON.stringify(ghost) + '\n');
console.log(`wrote ${out} (${JSON.stringify(ghost).length} bytes)`);
