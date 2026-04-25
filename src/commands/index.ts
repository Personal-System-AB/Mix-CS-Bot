import { setupQueue } from './setupQueue.js';
import { profileCommand } from './profile.js';
import { setEloCommand } from './setElo.js';
import { queueStatusCommand } from './queueStatus.js';
import { cancelQueueCommand } from './cancelQueue.js';
import { mapPoolCommand } from './mapPool.js';
import { finalizeMatchCommand } from './finalizeMatch.js';
import { resultCommand } from './result.js';

export const commands = [
  setupQueue,
  profileCommand,
  setEloCommand,
  queueStatusCommand,
  cancelQueueCommand,
  mapPoolCommand,
  finalizeMatchCommand,
  resultCommand,
];
