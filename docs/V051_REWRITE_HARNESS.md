# v05.1 Rewrite Harness

This is the operating contract for the v05.1 rewrite. It replaces ad-hoc copy edits. The job is to make a playable artist-life simulation, not a more legible arts-industry interface.

## Source of truth and rollback

- Working branch: `v05.1/core-hardening`.
- Canonical source: `new-media-time-simulator/src/v05/`.
- Generated `gh-pages` assets are never edited.
- Each work package is one focused commit. A failed gate is reverted or corrected before the next package starts.
- The current deployed `/v05/` artifact remains the rollback preview. CI publishes this branch only under `/v051/`.

## Non-negotiable player contract

At every moment the player must be able to answer, without opening help:

1. What just happened?
2. Why does it matter to me now?
3. What can I do next?
4. What will visibly change if I do it?

If the screen cannot answer all four, it is blocked.

## Attention / magic-circle rules

### Banned from default play

- Any concept whose provenance chain is missing: it was not introduced by a reached event, does not solve the current player problem, or enables no available action.
- Explanation of why a system, person, chapter, counter, or UI exists.
- Decorative counters, progress terms, achievement language, and internal labels that change nothing.
- A choice whose consequence is only a statement of taste or a hidden system change.
- Text that pre-defends, apologizes for, or explains the game.

### Allowed only when earned

- A person: introduced by the player choosing to contact them, or by a concrete role in the current situation.
- A technical term: introduced after the player has seen the relevant failure and actively requests or needs a fix.
- A history/archive entry: shown only after the action that created it.
- Feedback: only after the player chooses to send, show, post, exhibit, or ask.
- Costa Rica: a later optional chapter, never a first-session reference.

### Copy test

Every player-facing sentence must be one of:

- a concrete observation;
- a concrete request;
- an available action;
- a visible consequence;
- a short human reaction.

Anything else is deleted by default. “Good writing” does not exempt a sentence.

This test is not a word blacklist. A term is allowed when its concept has provenance, current relevance, and action value. Route-specific blocked-word assertions exist only to catch previously observed leaks.

## Content grammar

Only these node types can appear in play:

- Observation: something concrete happens; no forced choice.
- Transition: time/place changes; one sentence plus an optional continue action.
- Decision: 2–3 actions, each with a visible cost, result, or later callback.

A Decision cannot introduce more than one new concept. It cannot be preceded by a research card, glossary, or technical comparison unless the player opened it.

## Work packages and gates

### WP0 — freeze and baseline

- Freeze NPC, faction, place, chapter, simulator, prep-loop, and information-architecture expansion.
- Record a screenshot/video baseline of v05 and /v051/.
- Inventory default-play text and mark each line KEEP / REWRITE / DELETE.

Gate: no new content enters without a content-review ticket.

### WP1 — primary first session

- Make the default entry one clear first-session loop.
- Start with a concrete, ordinary problem and one line of black humour only if it improves comprehension.
- No Costa Rica, named NPC, work graph, archive, industry role, technical term, or unexplained number.
- Player creates the first Work, sees result, then can voluntarily seek feedback.

Gate:
- A new player can explain the situation and next action after 30 seconds.
- A fresh run reaches Work + history + save/resume without AI.
- Reviewer finds no sentence whose purpose is to explain the game to itself.

### WP2 — attention scrub

- Remove system labels from the default career UI.
- Hide people, counts, resources, and panels until they alter a current action.
- Replace indirect titles with literal situation titles.
- Remove all “research / small operation” interruptions from the main route.

Gate:
- One primary action per screen.
- No unfamiliar proper noun or technical term appears without setup.
- The screen remains understandable if all side panels are hidden.

### WP3 — feedback loop

- Add player-led feedback actions: friend, simulated social post, collaborator, venue test.
- Feedback must react to a specific version of a Work.
- Player may ignore feedback and continue.
- Feedback changes a future choice, relationship, budget, or Work direction; it is never random flavor.

Gate: every feedback item names what it reacted to and unlocks a visible follow-up.

### WP4 — making loop

- Add varied making actions only after the first loop is fun: build, test, document failure, revise, publish, ask for help, rest.
- Every action consumes or changes only a small, comprehensible resource set.
- Resource labels are plain language and explained at the moment of first use.

Gate: each action changes the Work, time, a relationship, or a later event. No fake choices.

### WP5 — Costa Rica as an optional content pack

- Rebuild its opening from context first: why the player went, what they are allowed to do, what is physically happening.
- Replace technical comparisons with player stakes.
- Technical detail is optional and on-demand only.
- Introduce each named person through current role and one concrete interaction.

Gate: a player unfamiliar with art tech can complete the route and accurately describe its conflict.

## Automated checks

The following must block a merge:

- fresh start -> first action -> result -> Work -> history -> refresh/resume;
- malformed and legacy save resets safely;
- AI-disabled primary loop;
- default start contains no Costa Rica reference;
- no Decision has fewer than 2 or more than 3 actions;
- no Decision action lacks a structured consequence;
- content budget lint;
- route-specific regression assertions for previously observed system-label and technical-term leaks;
- browser smoke at 1024px and 1440px.
- desktop and mobile playthrough of every accepted player route.
- entry-bundle checks proving legacy engines, overlays, and CSS are absent from default play.

## Human review ritual

For every work package:

1. Reset storage and start as a first-time player.
2. Read only what is visible; do not use developer knowledge.
3. Mark the first sentence that feels like an explanation, a pitch, an industry in-joke, or a system speaking.
4. Delete it before adding any replacement.
5. Play through once without opening optional panels.
6. Play through once after refresh.
7. Record: changed files, removed text/systems, tests, preview URL, rollback commit, and unresolved risks.

## Execution order

WP0 -> WP1 -> WP2 -> WP3 -> minimum WP4 -> WP5. This P0 chain is complete. The next chain begins with continuity after the first delivery, then legacy-screen migration. No content expansion comes before those two problems.

## Current status

| Package | Status | Accepted commit | Roll back to |
|---|---|---:|---:|
| Gate 0: canonical source and Pages pipeline | complete | `9f83b44` | previous branch state |
| generic attention/redundancy/change contracts | complete | `356dfd5` | `9f83b44` |
| RunState v2, migration/reset, Work, direct first session | complete | `aabf268` | `356dfd5` |
| player-led feedback with use/retest/ignore | complete | `48d34db` | `aabf268` |
| legacy route and bundle isolation | complete | `dcef346` | `48d34db` |
| focused optional Costa Rica route | complete | `96abdda` | `dcef346` |

P0 is complete for the accepted `/v051/` first session and the optional Costa Rica pack. It is not a claim that the entire legacy career is rewritten.

## Known remaining work

1. `/v051/` stops after the first delivery. It needs a second playable day that starts from the Work and consequence just created, not a menu.
2. Original `/v05/` career/story screens still contain dense internal language. They are isolated, not repaired.
3. Costa Rica retains legacy narrative/world persistence beside the separate v05.1 RunState mirror. Migrate consumers before deleting it.
4. The advanced work graph and research cards intentionally retain specialist language. They must remain opt-in and lazy-loaded.
5. Full Prep Loop, new NPCs, factions, locations, and chapters remain frozen.

## First-principles admission test for future content

For every proposed visible item, stop at the first “no”:

1. Does the player currently have a concrete problem?
2. Did a reached event introduce this item?
3. Does it change an action, a visible result, a Work, or an already chosen feedback relationship?
4. Is it needed now rather than later?
5. Does it fit one primary focus, 2–3 actions, at most one new concept, and the text budget?
6. Can its effect be expressed as a deterministic state delta and history line?

No: delete, defer, or move behind voluntary help. Do not add an explanation to justify its presence.
