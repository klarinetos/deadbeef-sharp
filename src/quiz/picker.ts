import { MODE_IDS } from './modes';
import type { ModeId, Rng, Settings } from './types';

export type ModePicker = () => ModeId;

/**
 * Returns a function that chooses the type of each next question.
 *
 * - roundRobin: cycles through the selected types in a fixed order.
 * - uniform: picks a selected type at random, each equally likely.
 * - weighted: picks at random in proportion to each type's weight.
 */
export function createModePicker(settings: Settings, rng: Rng): ModePicker {
  const modes = MODE_IDS.filter((id) => settings.modes.includes(id));
  if (modes.length === 0) throw new Error('At least one question type must be selected.');

  switch (settings.order) {
    case 'roundRobin': {
      let next = 0;
      return () => modes[next++ % modes.length];
    }
    case 'uniform':
      return () => modes[Math.floor(rng() * modes.length)];
    case 'weighted': {
      const weighted = modes.filter((id) => settings.weights[id] > 0);
      if (weighted.length === 0) throw new Error('At least one selected type needs a weight above zero.');
      const total = weighted.reduce((sum, id) => sum + settings.weights[id], 0);
      return () => {
        let remaining = rng() * total;
        for (const id of weighted) {
          remaining -= settings.weights[id];
          if (remaining < 0) return id;
        }
        return weighted[weighted.length - 1];
      };
    }
  }
}
