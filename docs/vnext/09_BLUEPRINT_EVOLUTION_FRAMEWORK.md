# v0.6 Blueprint Evolution Framework

Status: implementation baseline on `vnext/text-mud-ui-v04`.

## One sentence

The main progression is not career level. It is the evolution of the player's creative genome: discover nodes in FIELD, combine them in WORKBENCH, expose them to environments, then preserve the resulting branches in RECORDS.

## Do not add a fourth primary system

The stable shell remains:

- FIELD — place / people / signals
- WORKBENCH — projects / capabilities / actions
- RECORDS — quests / archive / triumphs

Blueprint is a project representation inside WORKBENCH, not a new top-level menu.

## Blueprint graph

A work is serializable as `nmas-blueprint-v1`:

- node instances
- typed links
- title and revision
- optional parent blueprint id
- notes

Node categories:

1. material
2. media
3. process
4. behavior
5. interface
6. spatial
7. lineage
8. constraint

Link types:

- signal — data / image / sound / control flow
- physical — real spatial or structural relation
- concept — historical, methodological or interpretive relation
- dependency — one part requires another condition

The graph is deliberately more than a signal-processing workflow. It needs to express why a work exists, how it is physically installed, and what can make it fail.

## No universal art score

Every Blueprint gets three explainable operational lenses:

### RUN
Can the current graph actually operate?

Looks at signal chains, visible outputs, mastery blocks and invalid links.

### BUILD
Can the current player actually make and deploy it?

Looks at resource access, node count pressure and explicit constraints.

### READ
What relations are currently legible in the work?

Looks for spatial and lineage relations. It does not score artistic quality.

Each lens exposes a four-state band (none / blocked / fragile / ready) plus reasons. The UI may compress this to three marks, but the reasons remain inspectable.

## Mastery

Player-facing mastery has only four readable bands:

- 0 — unknown
- 1 — usable
- 2 — fluent
- 3 — internalized

Hidden points can accumulate underneath. Mastery changes available operations and interpretation, not an "art +15" stat.

At higher mastery a player can:

- expose parameters
- diagnose failure
- substitute compatible nodes
- transfer a method into another medium
- reduce setup cost or uncertainty

## Resources are access, not inventory clutter

The baseline resource model records:

- owned
- borrowable
- rentable
- rent cost

A missing resource produces a FIELD problem or lead instead of a generic "inventory insufficient" error.

Example: four CRTs required, two accessible. The game should surface ways to find, borrow, rent, substitute or redesign the graph.

## Sharing

Every Blueprint can become:

- `.nmas.json`
- `NMAS-BP1-...` share code
- Remix / Fork with `parentBlueprintId`

The current no-server share code stores the complete Blueprint payload. A future backend can replace the long payload with a short content-addressed or database id while preserving the same Blueprint schema.

Import must reveal missing nodes, mastery and resources. Imported work therefore becomes playable progression rather than just community decoration.

## Quest books

Tutorial is separate from expandable Quest Books.

Every Quest Book uses one lifecycle grammar:

1. encounter — meet a person, condition, invitation, object or contradiction
2. acquire — gain access, knowledge, resources or nodes
3. assemble — build / fork / alter a Blueprint
4. test — run it and expose evidence
5. deploy — put it into a real environment
6. archive — preserve the version, failure, lineage and deployment facts

This grammar makes later challenge packs data-driven. New Quest Books should not introduce bespoke minigames unless the core grammar truly cannot express the content.

Initial set:

- Tutorial / 第一条回路
- 任务书 01 / 一个能被别人看见的版本
- 任务书 02 / 房间不对，作品会变
- 任务书 03 / 死媒介还活着
- 挑战任务书 / 节点风暴

## Repeatability

The loop is:

FIELD discovery
→ node / method / resource access
→ Blueprint assembly
→ environment-conditioned test
→ failure / feedback
→ Blueprint mutation or fork
→ deployment
→ archive / mastery / unlock
→ new FIELD perception

The same Quest Book should remain replayable because different nodes, people, resources and environments create different solutions.

## Pressure design

Complexity tiers are currently:

- small: 1–6 nodes
- medium: 7–12
- dense: 13–23
- stress: 24+

The stress tier is not automatically bad. It exists to make dependency, maintenance, transport and resource pressure visible.

A memorable challenge should sometimes begin with an overbuilt 24–30 node graph and reward the player for removing nodes while preserving the work's behavior.

## Early memorable moments

The opening framework should deliberately produce moments such as:

- the first wire creates a real feedback loop
- an imported Blueprint contains nodes the player cannot use
- the same work fails when moved to a different room
- an obsolete machine's limitation becomes conceptually useful
- a 28-node monster becomes a stronger 14-node deployment
- missing hardware turns into a relationship / resource search
- failed versions remain visible as ancestors instead of being overwritten
- the archive eventually shows a genealogy of one idea across years and contexts

## Persistence direction

Short term:

- browser local persistence remains valid for world/profile state
- Blueprint JSON files provide manual portability
- share codes provide lightweight transfer

Next persistence split should be:

- PROFILE — mastery, unlocked nodes, archive, triumphs
- WORLD — time, money, contacts, quests, events
- PROJECTS — Blueprint graph + deployment branches
- SETTINGS

Full-save export/import should serialize these layers into a versioned `.nmas-save` bundle.

## Current experimental route

The implementation includes a hidden stress lab at:

`/v05/?lab=blueprint`

The lab is not a fourth navigation surface. It exists to test node density, diagnostics, share-code round trips, JSON export, Remix genealogy, Quest Books and several chart-like archive easter eggs before Blueprint is folded into the production Workbench UI.
