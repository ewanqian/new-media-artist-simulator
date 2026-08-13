# v05.1 Rewrite Harness

This is the operating contract for the v05.1 rewrite. It replaces ad-hoc copy edits. The job is to make a playable artist-life simulation, not a more legible arts-industry interface.

## Source of truth and rollback

- Working branch: `v05.1/core-hardening`.
- Canonical source: `new-media-time-simulator/src/v05/`.
- Generated `gh-pages` assets are never edited.
- Each work package is one focused commit. A failed gate is reverted or corrected before the next package starts.
- The current deployed v05 preview remains intact while `/v051/` is the rewrite preview.

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
- forbidden-default-copy scan for system labels and premature technical terms;
- browser smoke at 1024px and 1440px.

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

WP0 -> WP1 -> WP2 -> WP3 -> WP4 -> WP5. No package may be advanced because another part of the UI looks polished.

## Current status

- Gate 0 source provenance: complete.
- RunState/save/action/work contracts: partially complete; the new contract must become the only default-play persistence route during WP1.
- First-session slice: present, but under active rewrite and not accepted until the attention scrub passes.
- Costa Rica: not accepted; it is a later content-pack rewrite, not a reference for default play.
- Full P0 is not complete.
