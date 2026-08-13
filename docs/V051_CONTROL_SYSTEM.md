# v05.1 Control System

## First principle

The game exists to let a player **do something recognisable, see what it causes, and decide what to do next**.

A system earns its place only if it improves one of those three things. If it only describes the art world, displays production vocabulary, or proves that the game has systems, it is redundant.

## One control loop

Every change follows this loop:

```
Player problem
  -> proposed change
  -> structured state effect
  -> attention + redundancy lint
  -> automated play test
  -> human “did I leave the game?” review
  -> preview
  -> accept or revert
```

No direct copy/design change skips the loop.

## 1. Attention control

A player only sees information that is necessary for the current problem.

| Moment | May appear | Must not appear |
|---|---|---|
| First screen | object, failure, goal, 2–3 actions | jargon, named NPCs, locations, counters, settings, lore |
| During action | material needed to act, action cost in plain language | glossary, research card, system explanation |
| After action | immediate result and what changed | archive taxonomy, future systems, achievement language |
| Optional help | technical explanation requested by player | forced interruption |

The source implementation is `src/v05/controlSystem.ts`. It blocks premature terms on default start and requires a player problem for every new concept.

## 2. Redundancy control

A visible item must affect at least one of:

- what the player can do;
- what happens next;
- a Work;
- a relationship/feedback source the player already chose to involve;
- the player’s understanding of the immediate problem.

Otherwise it is hidden or deleted.

This removes current redundancies:

- home → chapter select → onboarding → origin → work-mode → dossier: too many starts;
- default exposure to free create, content manager, settings, archive, work graph;
- people/evidence/thread/achievement counts;
- research/small-operation interruptions;
- technical comparisons before the player needs them;
- Costa Rica and other content packs in a first-session route;
- duplicate career/narrative/world local-storage state.

## 3. Change control

Every work package has a ChangeRecord:

```ts
{
  playerProblem,
  changedFiles,
  stateEffect,
  automatedCheck,
  humanReview,
  rollbackCommit
}
```

A change without this record is not merged into the preview branch. Each work package has one commit so the last accepted state can be restored without touching unrelated work.

## 4. Runtime state control

The core path uses:

```
Observation or Decision
-> action ID
-> deterministic result
-> state delta
-> Work/history
-> next event
```

AI may write optional flavor only. It never creates Works, resources, flags, phase changes, or progress.

## 5. Test control

Required checks:

- fresh start → action → result → Work → history → refresh/resume;
- malformed/legacy save recovery;
- AI-off core loop;
- default-start attention lint;
- redundancy lint;
- 1024px and 1440px browser smoke;
- manual first-time-player review with no side panels.

## 6. Human stop rule

During review, the first line that makes the reviewer think “why is the game telling me this?” is marked DELETE. It is not rewritten unless removing it makes the current action unclear.

The build is not accepted because it is sophisticated, expressive, or technically correct. It is accepted only if the player stays inside the situation.
