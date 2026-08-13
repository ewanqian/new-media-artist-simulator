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

The source implementation is `src/v05/controlSystem.ts`. It does not decide that a word such as “Gaussian” is always bad. It asks whether a concept has been introduced by a reached event, solves the current player problem, enables an available action, and fits the current screen budget.

### This is not a keyword blacklist

The reusable decision is semantic:

```
may show concept
  = introduced by something the player reached
  + relevant to the problem on this screen
  + useful for an action available now
  + inside the screen's attention budget
```

`ConceptContract`, `PlayerProblem`, `SurfaceContract`, and `SurfaceItem` carry that information. New people, tools, places, and media use the same contract. No new hard-coded branch is needed for each noun.

Some route tests also assert that known leaked terms are absent. Those assertions are regression alarms for already observed failures. They are not the control model and cannot make an irrelevant new term acceptable.

## 2. Redundancy control

A visible item must affect at least one of:

- what the player can do;
- what happens next;
- a Work;
- a relationship/feedback source the player already chose to involve;
- the player’s understanding of the immediate problem.

Otherwise it is hidden or deleted.

This has removed or isolated these redundancies from accepted v05.1 play:

- home → chapter select → onboarding → origin → work-mode → dossier: too many starts;
- default exposure to free create, content manager, settings, archive, work graph;
- people/evidence/thread/achievement counts;
- research/small-operation interruptions;
- technical comparisons before the player needs them;
- Costa Rica and other content packs in a first-session route;
- legacy career, narrative, and world state from the v05.1 default save.

The optional Costa Rica chapter still mirrors its old narrative/world records for backward compatibility. Its authoritative v05.1 Work is stored under a separate key. Removing that legacy mirror is deferred until its old consumers are migrated.

## 3. Change control

Every work package has a ChangeRecord:

```ts
{
  playerProblem,
  changedFiles,
  stateEffect,
  automatedChecks,
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
- Pixel 7 mobile browser playthrough;
- manual first-time-player review with no side panels.

Build isolation is also tested. The accepted first session must not load the legacy frame, global feedback overlay, legacy simulator, or their storage keys. Entry JS, entry CSS, and first-session JS have fixed budgets in `scripts/audit-v051-build.mjs`.

## 6. Human stop rule

During review, the first line that makes the reviewer think “why is the game telling me this?” is marked DELETE. It is not rewritten unless removing it makes the current action unclear.

The build is not accepted because it is sophisticated, expressive, or technically correct. It is accepted only if the player stays inside the situation.

## 7. Current enforcement boundary

| Surface | State | Enforcement |
|---|---|---|
| `/v051/` two-day opening | accepted P0 | generic surface gate, 729 path test, save tests, desktop/mobile browser, build isolation |
| optional Costa Rica route | accepted focused pack | same generic surface gate, introduction contracts, dynamic-copy regression, separate Work/save, desktop/mobile browser |
| original `/v05/` home/career/story | rollback and advanced reference | isolated from default; not yet copy-clean |
| work graph / research cards | advanced reference | lazy-loaded; specialist language allowed only because the player explicitly opens the tool |
| Prep Loop, new NPCs, factions, places, chapters | frozen | no implementation in this cycle |

Acceptance applies per surface. Passing the v05.1 first session does not certify every legacy v05 screen.
