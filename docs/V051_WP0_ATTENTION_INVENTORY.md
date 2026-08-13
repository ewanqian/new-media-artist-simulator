# WP0 — Default-play attention inventory

Audited: `/v051/`, `/v051/?mode=core`, and reachable legacy entry routes on 2026-08-14.

This is an execution list, not a design memo. No new player-facing copy may be added until every row marked DELETE or REWRITE is resolved and reviewed.

## Scope rule

**Default play** means the route a first-time player reaches through the primary button. It must not require a player to understand any of the other systems. Advanced career setup, free creation, content tools, and Costa Rica are outside default play and must be visually secondary and explicitly labelled advanced/optional.

## /v051/ home

| Visible item | Decision | Reason | Required action |
|---|---|---|---|
| “新媒体艺术家模拟器” | KEEP | Identifies the game. | None. |
| “进入生涯与章节，或者直接打开工作图。” | DELETE | Announces system architecture before an experience. | Remove. |
| “开始第一件作品” | REWRITE | Better than “生涯/章节”, but still abstract. | Make it a concrete situation, e.g. “我的网页坏了”. |
| “七天后的首次委托：做一个选择、看到结果、留下第一件作品。” | REWRITE | Explains the loop instead of giving the player a situation. | Replace with one concrete hook only. |
| “自由创作” card | HIDE | Useful tool, but not a first-session decision. | Move beneath an “advanced tools” disclosure. |
| “内容管理” and settings cards | HIDE | Breaks the magic circle. | Remove from first screen; settings only behind icon. |
| Footer with version, READ/DECIDE, Blueprint language | DELETE | Internal/product language. | Delete. |

## /v051/?mode=core first loop

| Visible item | Decision | Reason | Required action |
|---|---|---|---|
| “第一周 · 你的桌面” | KEEP | Plain scene context. | Keep short. |
| “你的作品坏了。” | REWRITE | Direct, but still lacks the object in title. | “你做的网页黑屏了。” |
| Broken-page paragraph | REWRITE | Concrete, but too much setup at once and implies an unexplained deadline/audience. | Start with the black screen, say what the player sees, then explain the deadline only if it creates a choice. |
| “先让它能跑 / 查清楚 / 录下失败” | KEEP | Concrete alternatives. | Make each result show a visible page-state change, not only text. |
| Resource panel | HIDE | First action should not require a resource model. | Do not reveal until first result causes a cost. |
| “第一件作品” and Work explanation | HIDE | Meta-system explanation before it earns relevance. | Reveal as a plain “你做过的版本” entry after the first action. |
| “History” | REWRITE | Internal vocabulary. | Rename “刚才发生了什么”; only show after a choice. |
| “你不用莫名其妙发给任何人…” | DELETE | The game defending itself is exactly the problem. | Replace with a situation-led reason to seek feedback, or let the player continue privately without comment. |
| Feedback actions | REWRITE | Direction is correct but needs player motive and varied feedback. | Offer “发给朋友 / 发到平台 / 不发” only when the player has a completed visible version and explain what each audience can actually do. |
| “反馈” as a resource | DELETE | Turns people into an unexplained meter. | Store reactions as messages and future opportunities, not a default counter. |
| “这不是结局…” result explanation | DELETE | Explains progression instead of letting the next playable event prove it. | Replace with the next concrete event. |

## Existing legacy career entry (not default)

| Visible item | Decision | Reason | Required action |
|---|---|---|---|
| Chapter selection | HIDE from default | A first-time player should not choose a content taxonomy. | Reach only from an explicit advanced/continue route. |
| EP00 / Asset / Work Graph / Knowledge | DELETE or rewrite in advanced mode | Dense internal vocabulary. | Rebuild later under WP2; never surface in default play. |
| Work mode: story/hybrid/blueprint | HIDE | A player cannot choose a production interface before experiencing the game. | Settings after the first loop. |
| Preset origin / five-question modelling | HIDE | Premature role construction. | Postpone until player has played enough to understand differences. |
| Known people | DELETE | A relationship list has no meaning without meetings. | Introduce people only through a current event. |
| Costa Rica card | HIDE | Optional chapter is crowding the beginning. | Remove from new-player UI; bring back after main loop acceptance. |

## Costa Rica route (not default; blocked until WP5)

| Visible item | Decision | Reason | Required action |
|---|---|---|---|
| Costa Rica title and route progress | HIDE during default work | Optional pack must not be referenced before entry. | Keep isolated behind optional chapter gate. |
| Point cloud / Gaussian technical comparison | REWRITE | No player stake in the original presentation. | Converted to “show the break / make it easy to enter”; audit all remaining references. |
| Research / small operations | DELETE from main flow | Forces a study interruption. | Retain only as optional contextual help after a player chooses it. |
| Asset/Evidence/Knowledge labels | REWRITE/HIDE | Internal nouns break attention. | Replace with ordinary nouns in player view; retain IDs only in data. |
| Inés/Rojas | REWRITE | Names need a current role and first interaction. | Introduce one at a time, only at the moment they act. |

## Regressions to prevent

The following strings or concepts are blocked from first-session UI unless a reviewed exception documents the immediate player problem:

- Asset, Evidence, Knowledge, Work Graph, Blueprint, Node, phase, stage, content, system, archive, current version, impact.
- Costa Rica, Inés, Rojas, Lin, Chen, or any named NPC.
- Point cloud, Gaussian, camera solve, Noise, Geometry Nodes, LiDAR.
- Counts of people, evidence, threads, achievements, or “entered career”.

## WP0 exit criteria

- The default route has one clear CTA and no tool/management/chapter cards.
- The first screen has one concrete object, one visible failure, and 2–3 actions.
- Every word in default play has a row above with a reviewed status.
- All DELETE rows are gone; all REWRITE rows have a new screenshot and a human attention review.
- The original v05 route remains available as rollback; no deletion is irreversible.
