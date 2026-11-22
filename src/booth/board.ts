import type { Sim } from '../sim/sim';
import type { InputLog } from '../sim/inputLog';
import { recordFromSim, type GhostRecord } from './record';
import { pickRival, type RivalChoice } from './rival';
import { nextStreak } from './streak';
import { cleanInitials } from './initials';
import { appendRun, dateKey, loadMeta, loadRuns, saveMeta, startNewDay, topRuns, updateRun, type KV, type Meta, type Settings } from './storage';

export class Board {
  private state: Meta;
  private records: GhostRecord[];

  constructor(private kv: KV, readonly version: string, private today = () => dateKey(new Date())) {
    this.state = loadMeta(kv, today());
    this.records = loadRuns(kv, this.state.currentDay);
  }

  get meta(): Readonly<Omit<Meta, 'settings'>> & { readonly settings: Readonly<Settings> } {
    return { ...this.state, settings: { ...this.state.settings } };
  }
  get runs(): readonly GhostRecord[] { return structuredClone(this.records); }
  private get currentRuns(): GhostRecord[] { return this.records.filter(r => r.courseVersion === this.version); }
  get top(): GhostRecord[] { return structuredClone(topRuns(this.currentRuns, 10)); }
  get last(): GhostRecord | undefined { return structuredClone(this.currentRuns.at(-1)); }
  get champion(): GhostRecord | undefined { return structuredClone(topRuns(this.currentRuns.filter(r => r.inputs), 1)[0]); }

  refresh(): void {
    this.state = loadMeta(this.kv, this.today());
    this.records = loadRuns(this.kv, this.state.currentDay);
  }

  refreshDay(): void {
    if (this.state.currentDay.split('~')[0] !== this.today()) this.refresh();
  }

  newDay(): void {
    this.state = startNewDay(this.kv, this.state, this.today());
    this.records = [];
  }

  settings(patch: Partial<Settings>): void {
    Object.assign(this.state.settings, patch);
    saveMeta(this.kv, this.state);
  }

  rival(champion: boolean, house: GhostRecord, verify: (record: GhostRecord) => boolean): RivalChoice {
    return structuredClone(pickRival(this.records, { champion, house, verify, version: this.version, forceHouse: this.state.settings.forceHouse }));
  }

  finish(sim: Sim, inputs: InputLog, rival: GhostRecord, createdAt: number): { record: GhostRecord; newBest: boolean } {
    const prevBest = this.top[0];
    const beatRival = !sim.dnf && (rival.dnf || sim.finishTick < rival.finishTick - 1);
    const record = recordFromSim(sim, inputs, {
      id: `${this.state.currentDay}-${++this.state.runCounter}`, initials: '???', courseVersion: this.version,
      rivalId: rival.id, beatRival, createdAt,
    });
    this.state.relayStreak = nextStreak(this.state.relayStreak, beatRival);
    this.state.bestStreak = Math.max(this.state.bestStreak, this.state.relayStreak);
    saveMeta(this.kv, this.state);
    this.records = appendRun(this.kv, this.state.currentDay, structuredClone(record));
    return { record, newBest: !record.dnf && (!prevBest || record.finishTick < prevBest.finishTick) };
  }

  initials(record: GhostRecord, text: string): void {
    record.initials = cleanInitials(text);
    this.records = updateRun(this.kv, this.state.currentDay, record.id, { initials: record.initials });
  }
}
