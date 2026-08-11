# v0.5 Play Structure Reset — Environment → Body → Mind

> Status: authoritative gameplay structure for the next v0.5 iteration.
> Scope: gameplay architecture only. Do not redesign the visual language yet.
> Principle: stop adding parallel menus. Every future feature must belong to one of the three layers below.

## 0. Why the current structure is wrong

The current playable build exposes HOME / EPISODE / MAP / STUDIO / PROJECT / CONTACTS / WORKBENCH / ARCHIVE as parallel first-level systems. This makes several systems compete for the same job:

- Studio and Workbench both answer “what can I do?”
- Map and Studio both answer “where do I work?”
- Project and Episode both answer “what should I do next?”
- Contacts are detached from the places and situations where relationships actually happen.
- Episode is exposed as a player-facing product surface even though it should be an internal pacing/checkpoint mechanism.
- City geography currently carries more visual weight than gameplay meaning.

The new structure removes these overlaps before more content is added.

---

# 1. The whole game has only three first-level systems

```text
NEW MEDIA ARTIST SIMULATOR

1. FIELD / 场域       — 环境：现在身处什么条件里？
2. WORKBENCH / 工作台 — 身体：在这些条件下，我实际能做什么？
3. RECORDS / 记录     — 意识：我如何理解、记住并重新选择？
```

The causal order is:

```text
ENVIRONMENT
  ↓ changes available conditions
BODY / PRACTICE
  ↓ creates consequences and evidence
MIND / RECORD
  ↓ changes what the player notices, pursues and can name
ENVIRONMENT changes again
```

This is a loop, not three independent dashboards.

## Core rule

**Environment decides available action. Capability decides executable action. Experience decides interpretation.**

A button is not a game mechanic by itself.

A real action exists only when these three things meet:

```text
Available Action = Environment × Capability × Current Project State
```

Examples:

- A blackbox + Output Lv.1 + prototype project → “single-screen signal test” is available.
- The same blackbox + Output Lv.3 + mapped project → “multi-output mapping test” appears instead.
- A peer café + an unfinished prototype → “show current version / ask about one uncertainty” appears.
- A fabrication workshop + a project with no dimensions → fabrication is unavailable, but “measure / produce fabrication brief” becomes relevant.

The player should not choose “go somewhere” and then choose from an unrelated generic action deck. The place must change the verbs.

---

# 2. FIELD / 场域 — Environment

FIELD is not a Shanghai map and not a travel simulator.

It is the new-media artist’s **practice network**: different environments produce different constraints, people, information and possible actions.

The player sees a spatial/network representation, but geography is secondary. Shanghai, Hangzhou, Shenzhen, overseas residencies, old Babel spaces, fictional spaces and online spaces can all become concrete instances later.

FIELD has exactly three primary groups, each with three initial families.

## 2.1 PLACE / 空间

### A. MAKE — 制作环境
1. Personal Workspace / 自有工作位
2. Shared Lab or Studio / 合作实验室・工作室
3. Fabrication & Supplier / 加工・供应

### B. PRESENT — 展示环境
1. Blackbox / Club / 黑盒・俱乐部
2. Gallery / Institution / 展厅・机构空间
3. Public / Screen / Online / 公共空间・屏幕・线上

### C. NETWORK — 社会环境
1. Peer Place / Café / 同行聚点・咖啡馆
2. Backstage / Institution Office / 机构后台・办公室
3. Client / Market / Residency / 客户・市场・驻留

These are topology families, not fixed venue names.

A concrete place instance contains:

```text
Place
- type family
- physical / social constraints
- cost / time cost
- available people
- available signals
- supported action verbs
- required capabilities
- possible evidence produced
- possible failure modes
- texts / rumors / public language attached to it
```

A place matters only if entering it changes play.

### Delete this pattern

```text
Shanghai map node → click → generic location card → spend 1 attention
```

### Keep this pattern

```text
Blackbox
- 2h only
- 16:9 screen + unknown converter
- Li is present
- no audience
- can test signal / long-run / mapping
- cannot fabricate structure
- creates technical evidence
- may reveal a technical debt
```

The old Shanghai geography remains content data, but it no longer defines the main game taxonomy.

---

## 2.2 PEOPLE / 人

People are part of the environment, not a detached address book.

There is no affection meter.

Relationships are represented by:

```text
- how you met
- which project you shared
- what you asked them
- what they saw
- what they promised
- what they owe / what you owe
- how reliable their information has been
- who else they connect to
```

The index uses a 3 × 3 structure so it feels large without creating fake NPC quantity.

### A. CREATIVE / 创作
1. Peer artist / 同行
2. Performer / sound / image collaborator / 表演・声音・影像合作者
3. Research / writing / critique / 研究・写作・批评

### B. PRODUCTION / 制作
1. Technical / signal / network / 技术・信号・网络
2. Fabrication / transport / install / 制作・运输・安装
3. Documentation / photo / media / 记录・摄影・传播

### C. ORGANIZATION / 组织
1. Curator / producer / program / 策划・制作人
2. Institution / venue / education / 机构・场地方・教育
3. Client / brand / commercial / 客户・品牌・商业

A person may carry multiple tags. The 3 × 3 is an index, not a class system.

Current seeded people can occupy only some slots. Empty slots remain “undiscovered”, which gives scale without NPC inflation.

### Contact interaction

Do not show four generic “ask” buttons forever.

Conversation options are generated from:

```text
Current Place
× Shared Project History
× Unresolved Thread
× What this person actually knows
```

Examples:

- At blackbox with Li → “check signal chain / ask for spare test slot / clarify backup path”.
- In chat after a failed test → “send error log / ask whether this is cable or frame-sync / ask who else has seen this problem”.
- With a curator who has never seen the project → “send one-page version” appears; “ask for production budget” may not yet appear.

---

## 2.3 SIGNALS / 信号

Signals are things in the world that pull the player toward action.

They replace the idea that every playable thing must be a card sitting in Studio.

### A. OPPORTUNITY / 机会
1. Invitation / 邀请
2. Open call / commission / 征集・委托
3. Test slot / residency / resource / 测试档期・驻留・资源

### B. PRESSURE / 压力
1. Deadline / 截止
2. Cash / rent / 现金流
3. Responsibility / scope / 制作责任・范围变化

### C. INCIDENT / 事件
1. Technical failure / 技术故障
2. Social misunderstanding / communication / 沟通与误读
3. Unexpected return / old material / callback / 旧材料与回流

Signals may be public, direct, secondhand or rumor. Existing Text Ecology becomes the information layer of SIGNALS.

A signal does not immediately become a quest.

The player can:

```text
ignore → observe → verify → commit → act → receive consequence
```

This keeps information ecology playable.

---

# 3. WORKBENCH / 工作台 — Body / Practice

Studio is removed as a first-level system.

**Studio + Workbench are one thing: WORKBENCH.**

The simulator itself is the artist’s workbench.

WORKBENCH is where the player selects an active project and performs actual work. It is not a hardware shop.

WORKBENCH has three primary groups.

## 3.1 PROJECTS / 项目

Projects are the objects that actions modify.

Initial grouping:

1. ACTIVE / 当前
2. SIDE / 支线
3. ARCHIVED / 已归档

A project has no generic “art quality” score.

Its state is legible through concrete dimensions:

```text
- question / scope
- prototype state
- runtime stability
- site fit
- documentation
- commitments
- unresolved threads
- attached people
- attached places
- evidence
- lineage / reused methods
```

Only one project is foregrounded at a time, but later 1–2 side projects can coexist.

---

## 3.2 CAPABILITIES / 能力

Capabilities are the body of practice: tools, methods and infrastructure that determine what actions are physically possible.

Do not turn this into PCPartPicker.

Use capability thresholds, not hardware fetish stats.

Initial 3 × 3:

### A. INPUT / 输入
1. Image / video capture / 影像采集
2. Scan / spatial capture / 扫描・空间采集
3. Sensor / live input / 传感・实时输入

### B. COMPUTE / 处理
1. Realtime / 实时图形
2. Reconstruction / generation / 重建・生成
3. Automation / system integration / 自动化・系统整合

### C. OUTPUT / 输出
1. Single display / 单屏
2. Multi-output / mapping / 多输出・Mapping
3. Spatial / special display / 空间・特殊显示

Storage, networking, backup and transport are supporting conditions and can become project-specific infrastructure instead of four universal upgrade bars.

Methods are learned through Records and proven through action. Equipment raises or changes capability thresholds.

A capability upgrade matters because it opens a verb in a real context.

Bad:

```text
Output Lv.2 → number bigger
```

Good:

```text
Output Lv.2 → blackbox now exposes “dual-output test”
```

---

## 3.3 ACTIONS / 工作

All “what should I do now?” work actions live here.

The Workbench action grammar is 3 × 3.

### A. MAKE / 制作
1. Build / 构建
2. Compose / 编排
3. Integrate / 整合

### B. TEST / 测试
1. Run / 运行
2. Preview / 场地预演
3. Diagnose / 诊断

### C. PREPARE / 准备
1. Package / 打包・交付
2. Document / 记录・文档
3. Maintain / Upgrade / 维护・升级

These nine are **verbs**, not nine permanent buttons.

The current environment decides which of them are meaningful.

Example:

```text
At personal workspace:
Build / Compose / Run / Diagnose / Document / Maintain

At blackbox:
Integrate / Run / Preview / Diagnose / Package / Document

At fabrication workshop:
Build / Integrate / Package / Diagnose

At peer café:
Workbench is mostly backgrounded; People / Signal interaction dominates.
```

This removes the duplicated “go somewhere” screen and “do something” screen. Environment changes the Workbench.

---

# 4. RECORDS / 记录 — Mind / Consciousness

RECORDS is not a dead archive.

It is the layer that turns experience into knowledge, goals, memory and completion.

It contains exactly three systems:

1. QUESTS / 任务
2. ARCHIVE / 档案
3. TRIUMPHS / 成就

---

## 4.1 QUESTS / 任务

The player sees quests.

The player does **not** see Episode as a main navigation system.

Visible hierarchy:

```text
QUEST LINE / 长线任务
  └─ QUEST / 任务
      └─ OBJECTIVE / 小目标
```

Initial quest types:

1. MAIN / 主线
2. SIDE / 支线
3. REPEATABLE / 可重复

A long quest line is a chain of several quests. A quest contains 1–4 concrete objectives.

Objectives do not need to be “click the marked button”. They can be state conditions:

```text
- make one testable prototype
- receive feedback from a person who has seen it
- produce one piece of technical evidence
- verify whether an opportunity is real
- solve one unresolved technical thread
- enter a place with a specific capability
```

### Dialogue is part of quests

Early game should use dialogue aggressively to focus attention.

A quest can contain:

```text
start dialogue
→ objective
→ mid-dialogue / message
→ changed objective
→ consequence
→ completion dialogue
```

This is how an MMORPG quest line can pull the player through multiple systems without exposing the underlying tutorial machinery.

---

## 4.2 EPISODE is hidden runtime infrastructure

Episode remains in code, but changes role.

```text
Episode ≠ menu
Episode ≠ quest book
Episode = content package + checkpoint + state boundary
```

An Episode contains:

```text
- entry conditions
- initial world changes
- quest lines introduced
- people / places / signals activated
- checkpoint snapshot
- completion conditions
- unlock bundle
- rollback / replay policy
```

Player-facing example:

```text
MAIN QUEST LINE
“第一个能被别人看见的版本”
```

Internal authoring:

```text
Episode 01
- loads the quest line
- stores entry snapshot
- knows completion state
- can reset / replay / rewind this content package
```

This allows future rollback and chapter replay without making EPISODE a giant button in the HUD.

---

## 4.3 ARCHIVE / 档案

Archive starts large and hierarchical, closer to a codex / collection than a reading list.

It has six top-level categories from the beginning:

1. PEOPLE / 人物
2. PLACES / 场域
3. PROJECTS / 项目
4. METHODS / 方法
5. MEDIA / 媒介
6. ECOLOGY / 生态

Each category can recurse:

```text
Category
  → Set / Collection
    → Entry
      → Fragment / Evidence / Source
```

Example:

```text
MEDIA
  → Time-based media
    → Realtime image
      → Frame sync
        → field note
        → technical message
        → reference text
```

or:

```text
PLACES
  → Presentation spaces
    → Blackbox
      → signal conditions
      → audience conditions
      → old venue texts
```

This is where the old Babel text corpus can be poured back in over time without redesigning the game.

The Archive must support unknown entries and silhouettes so players can see that more exists than they have discovered.

---

## 4.4 TRIUMPHS / 成就

Triumphs are not Steam-style decorative badges only.

They are one of the ways the game teaches the player what kinds of practice are possible.

Internal grouping:

1. CHALLENGES / 挑战
2. SETS / 成就组
3. TITLES / 称号

Examples:

```text
Challenge:
“连续运行”
Keep one project running for 60 minutes without a critical failure.

Challenge:
“不是效果图”
Complete three site tests in three different presentation-space families.

Set:
“现场基础”
- make a technical rider
- complete a site test
- document a failure
- use a backup path once

Title:
“能跑就行” / “现场生物” / later naming pass
```

Important rule:

**Triumph completion can unlock Archive entries, methods, titles or new ways of reading old evidence.**

Therefore Archive and Triumphs reinforce one another instead of becoming two dead completion menus.

---

# 5. The real gameplay loop

The player loop should be understandable without naming any UI panel.

```text
1. Something changes in the world.
   A person writes, a deadline appears, an old problem returns, a place becomes available.

2. Player chooses what deserves attention.
   Ignore / verify / commit / postpone.

3. Player enters a context.
   Place + people + signal define current environment.

4. Workbench changes because of that context.
   Only relevant verbs become available.

5. Player acts on a project.
   Spend time / attention / cash. Use capability + method.

6. Action produces evidence and consequences.
   Prototype, test result, document, message, debt, callback, money, failure.

7. Time advances.
   Replies, costs, deadlines and delayed consequences return.

8. Records update.
   Quest state changes, Archive fills, Challenge progress changes.

9. Mind changes what the player can perceive next.
   New language, methods, people, routes and signals become legible.

10. Return to a changed world.
```

The important fun is **not clicking cards**.

The fun is choosing a context, assembling a viable method, testing it against reality, and living with what comes back.

---

# 6. Three types of player decision

To keep the game small but deep, every substantial turn should contain at least one of these decisions.

## 6.1 ROUTE DECISION — 去哪里 / 跟谁 / 接不接

Examples:
- use a cheap workspace or spend money on a real blackbox test
- ask a peer first or go directly to an institution
- verify a rumor or commit before confirmation

## 6.2 BUILD DECISION — 怎么做

Examples:
- reduce scope or increase capability
- build a backup path or trust one machine
- document failure or spend the last attention point on another test

## 6.3 COMMITMENT DECISION — 为它付出什么

Examples:
- spend cash to upgrade output
- consume a week on a residency
- take commercial work and lose project time
- accept a venue slot before the project is stable

If a screen has no route, build or commitment decision, it is probably informational UI, not gameplay.

---

# 7. Opening game should not expose Episode

Replace current player-facing EP.01 with a visible main quest line.

Suggested first main quest line:

## 主线：第一个能被别人看见的版本

The quest line can still be authored internally as Episode 01.

### Quest 1 — 一个东西开始运行
- dialogue / text hook
- make one concrete prototype action
- result: first Project appears

### Quest 2 — 它离开你的桌面
- a person or signal points to a test environment
- enter one meaningful external context
- use a context-specific Workbench verb

### Quest 3 — 别人怎么理解它
- send or show current version to one relevant person
- receive delayed feedback
- Archive gains one source fragment

### Quest 4 — 它为什么会坏
- encounter or reveal one unresolved thread
- diagnose or resolve it through Workbench
- unlock a relevant method entry

### Quest 5 — 第一次真正公开
- choose one presentation environment
- meet capability requirement or adapt scope
- complete public / live / institutional output
- close quest line

The five quests together create the first complete artist experience.

The player never needs to know that these five quests equal one Episode package.

---

# 8. What happens to current systems

## REMOVE AS FIRST-LEVEL NAVIGATION
- EPISODE
- STUDIO
- MAP as a separate geographic product
- CONTACTS as a detached address book
- PROJECT as a disconnected management screen

## MERGE / REHOME

```text
EPISODE → hidden runtime under QUESTS
STUDIO → WORKBENCH
MAP → FIELD / PLACE
CONTACTS → FIELD / PEOPLE
OPPORTUNITIES → FIELD / SIGNALS
PROJECT → WORKBENCH / PROJECTS
METHODS + equipment → WORKBENCH / CAPABILITIES
ARCHIVE → RECORDS / ARCHIVE
ACHIEVEMENTS → RECORDS / TRIUMPHS
TASKS → RECORDS / QUESTS
```

## KEEP
- current low-fi white UI direction
- attention / cash / week
- delayed replies and callbacks
- unresolved threads
- project dimensions
- text ecology
- archive corpus
- contact-to-contact network
- venue test idea
- old Babel research-space content
- deterministic state / tests

---

# 9. UI consequence — but do not redesign yet

The next UI should eventually have only three persistent primary entries:

```text
FIELD      WORKBENCH      RECORDS
场域        工作台          记录
```

HOME can exist as a neutral summary / current-context view, but it is not a fourth game system.

A likely mental model:

```text
HOME
┌──────────────────────────────┐
│ current signal / current quest│
│ current project              │
│ current environment          │
│ next delayed consequence     │
└──────────────────────────────┘

FIELD
Places / People / Signals

WORKBENCH
Projects / Capabilities / Actions

RECORDS
Quests / Archive / Triumphs
```

The interface may still look like a white productivity tool for now. The gameplay architecture should be correct before adding a more expressive visual shell.

---

# 10. Non-negotiable implementation rules

1. No new feature gets its own first-level navigation item without proving it cannot live in FIELD / WORKBENCH / RECORDS.
2. No place exists only to decorate a map. It must modify actions, people, signals, costs or evidence.
3. No contact is only a message menu. Their available conversation depends on context and history.
4. No capability upgrade exists only to increase a number. It must unlock or modify an action.
5. No Archive entry is just exposition if it can be attached to evidence, challenge, place, project or method.
6. No Triumph is purely decorative at first; it should unlock knowledge, method, title or visibility.
7. No quest objective should say “open menu X”. Objectives describe world state or practice state.
8. Episode remains hidden authoring/runtime infrastructure.
9. Shanghai / city names are content instances, never the top-level ontology.
10. Studio and Workbench are one system from now on.

---

# 11. Next implementation order

Do not add more content before these steps.

## Step 1 — typed 3 × 3 skeleton
Create FIELD / WORKBENCH / RECORDS schemas and migrate current systems into them without deleting underlying content.

## Step 2 — quest runtime over Episode
Keep Episode as checkpoint container. Add visible QuestLine → Quest → Objective data model.

## Step 3 — environment-conditioned actions
Make a place alter the Workbench verbs available for the active project.

## Step 4 — merge Studio + Workbench
All current action cards become Workbench action templates. Remove Studio as a separate concept.

## Step 5 — replace city-first map
Render practice-space families first. Concrete Shanghai / other city instances appear underneath them.

## Step 6 — Records shell
Create Quests / Archive / Triumphs. Archive starts with six visible categories and recursive unknown entries.

## Step 7 — first playable quest line
Re-author current five-part opening as visible quests and hide Episode from the player.

Only after these seven steps should the game add more NPCs, places, episodes or visual polish.
