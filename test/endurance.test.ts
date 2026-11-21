import { describe, it, expect } from 'vitest';
import { Booth } from '../src/booth/stateMachine';
import { FakeStorage } from './helpers/fakeStorage';
import { appendRun, loadMeta, saveMeta, storedBytes, updateRun } from '../src/booth/storage';
import { pickRival } from '../src/booth/rival';
import { recordFromSim, type GhostRecord } from '../src/booth/record';
import { nextStreak } from '../src/booth/streak';
import { verifyGhost } from '../src/game/ghost';
import { COURSE } from '../src/sim/course';
import { courseVersion } from '../src/sim/courseVersion';
import { botRun } from './helpers/bot';
import { createAutopilot } from '../src/sim/autopilot';
import { createSim, step } from '../src/sim/sim';
import { createRecorder, record } from '../src/sim/inputLog';
import house from '../src/game/houseGhost.json';

class FakeChannel {
  listeners = 0;
  sent = 0;
  post() {
    this.sent++;
  }
}

describe('endurance', () => {
  it('1000 consecutive Turns through state machine, sim, storage and broadcast stubs', () => {
    let now = 0;
    const kv = new FakeStorage();
    const channel = new FakeChannel();
    channel.listeners = 1;
    const version = courseVersion(COURSE);
    const HOUSE = house as unknown as GhostRecord;
    const booth = new Booth(() => now);
    let meta = loadMeta(kv, '2026-11-20');
    let runs: GhostRecord[] = [];
    let totalTicks = 0;
    let replayOk = 0;
    const TURNS = 1000;

    for (let t = 0; t < TURNS; t++) {
      expect(booth.state).toBe('attract');
      booth.press({ champion: t % 10 === 0 });
      const rival = pickRival(runs, { champion: booth.champion, version, house: HOUSE, verify: () => true });
      while (booth.state === 'countdown') {
        now += 100;
        booth.update();
      }
      expect(booth.state).toBe('run');
      let sim;
      let log;
      if (t % 2 === 0) ({ sim, log } = botRun(COURSE, t + 1));
      else {
        sim = createSim(COURSE);
        const rec = createRecorder();
        const pilot = createAutopilot({ jumpAt: 30 + (t % 30), slideAt: 30, pitAt: 10 + (t % 20), mistakes: [] });
        while (!sim.finished) {
          const m = pilot(sim);
          record(rec, sim.tick, m);
          step(sim, m);
        }
        log = rec.log;
      }
      expect(sim.finishTick).toBeLessThanOrEqual(3600);
      totalTicks += sim.finishTick;
      now += Math.round((sim.finishTick * 1000) / 60);
      channel.post();
      const beat = !sim.dnf && (rival.record.dnf || sim.finishTick < rival.record.finishTick - 1);
      const rec = recordFromSim(sim, log, { id: `d-${t}`, initials: '???', courseVersion: version, rivalId: rival.record.id, beatRival: beat, createdAt: t });
      meta = { ...meta, runCounter: meta.runCounter + 1, relayStreak: nextStreak(meta.relayStreak, beat) };
      saveMeta(kv, meta);
      runs = appendRun(kv, meta.currentDay, rec);
      booth.runFinished();
      while (booth.state !== 'attract') {
        now += 250;
        if (booth.state === 'initials' && t % 2 === 0) {
          runs = updateRun(kv, meta.currentDay, rec.id, { initials: 'ABC' });
          booth.initialsDone();
        }
        booth.update();
      }
    }
    for (const r of runs) if (r.inputs && verifyGhost(COURSE, r)) replayOk++;
    const withInputs = runs.filter((r) => r.inputs).length;
    const bytes = storedBytes(kv);
    const summary = `endurance: ${TURNS} turns, mean run ${(totalTicks / TURNS / 60).toFixed(2)} s, ${replayOk}/${withInputs} stored ghosts replay-verified, ${bytes} bytes stored, listeners ${channel.listeners}`;
    console.log(summary);
    expect(replayOk).toBe(withInputs);
    expect(bytes).toBeLessThan(1_000_000);
    expect(channel.listeners).toBe(1);
  });
});
