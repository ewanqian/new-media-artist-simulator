import { satiricalEvents } from './legacyDeck.ts';

// The old three-layer satire system returns after the player has learned the
// basic loop. It should not interrupt the first studio → explore → project →
// contact sequence.
for (const event of satiricalEvents) {
  event.unlockAt = Math.max(4, event.unlockAt);
}
