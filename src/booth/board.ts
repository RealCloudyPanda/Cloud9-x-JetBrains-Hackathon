import type { Sim } from '../sim/sim';
import type { InputLog } from '../sim/inputLog';
import { recordFromSim, type GhostRecord } from './record';
import { pickRival, type RivalChoice } from './rival';
import { nextStreak } from './streak';
import { cleanInitials } from './initials';
import { appendRun, dateKey, loadMeta, loadRuns, saveMeta, startNewDay, topRuns, updateRun, type KV, type Meta, type Settings } from './storage';

export class Board {
  meta: Meta;
  private records: GhostRecord[];

  constructor(private kv: KV, readonly version: string, private today = () => dateKey(new Date())) {
    this.meta = loadMeta(kv, today());
    this.records = loadRuns(kv, this.meta.currentDay);
  }

  get runs(): GhostRecord[] { return this.records; }
  get currentRuns(): GhostRecord[] { return this.records.filter(r => r.courseVersion === this.version); }
  get top(): GhostRecord[] { return topRuns(this.currentRuns, 10); }
  get last(): GhostRecord | undefined { return this.currentRuns.at(-1); }
  get champion(): GhostRecord | undefined { return topRuns(this.currentRuns.filter(r => r.inputs), 1)[0]; }

  refresh(): void {
    this.meta = loadMeta(this.kv, this.today());
    this.records = loadRuns(this.kv, this.meta.currentDay);
  }

  refreshDay(): void {
    if (this.meta.currentDay.split('~')[0] !== this.today()) this.refresh();
  }

  newDay(): void {
    this.meta = startNewDay(this.kv, this.meta, this.today());
    this.records = [];
  }

  settings(patch: Partial<Settings>): void {
    Object.assign(this.meta.settings, patch);
    saveMeta(this.kv, this.meta);
  }

  rival(champion: boolean, house: GhostRecord, verify: (record: GhostRecord) => boolean): RivalChoice {
    return pickRival(this.records, { champion, house, verify, version: this.version, forceHouse: this.meta.settings.forceHouse });
  }

  finish(sim: Sim, inputs: InputLog, rival: GhostRecord, createdAt: number): { record: GhostRecord; newBest: boolean } {
    const prevBest = this.top[0];
    const beatRival = !sim.dnf && (rival.dnf || sim.finishTick < rival.finishTick - 1);
    const record = recordFromSim(sim, inputs, {
      id: `${this.meta.currentDay}-${++this.meta.runCounter}`, initials: '???', courseVersion: this.version,
      rivalId: rival.id, beatRival, createdAt,
    });
    this.meta.relayStreak = nextStreak(this.meta.relayStreak, beatRival);
    this.meta.bestStreak = Math.max(this.meta.bestStreak, this.meta.relayStreak);
    saveMeta(this.kv, this.meta);
    this.records = appendRun(this.kv, this.meta.currentDay, record);
    return { record, newBest: !record.dnf && (!prevBest || record.finishTick < prevBest.finishTick) };
  }

  initials(record: GhostRecord, text: string): void {
    record.initials = cleanInitials(text);
    this.records = updateRun(this.kv, this.meta.currentDay, record.id, { initials: record.initials });
  }
}
