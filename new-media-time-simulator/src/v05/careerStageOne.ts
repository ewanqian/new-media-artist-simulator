import { openingQuestProgress } from './questRuntime.ts';

export type CareerSceneChoice = {
  id: string;
  title: string;
  detail: string;
  cost: string;
  kind: 'build' | 'route' | 'commitment' | 'time';
};

export type CareerScene = {
  id: string;
  kicker: string;
  title: string;
  body: string[];
  note?: string;
  choices: CareerSceneChoice[];
  optionalWorkbench?: string;
};

function hasPendingReply(save: Record<string, any>) {
  return Array.isArray(save.pendingReplies) && save.pendingReplies.length > 0;
}

function hasOpenIssue(save: Record<string, any>) {
  const resolved = new Set(save.resolvedIssueIds || []);
  return (save.revealedIssueIds || []).some((id: string) => !resolved.has(id));
}

export function careerStageOneScene(save: Record<string, any>, workMode: 'story' | 'hybrid' | 'blueprint' = 'hybrid'): CareerScene {
  const progress = openingQuestProgress(save as any);

  if (progress.complete) {
    return {
      id: 'stage1-complete', kicker: 'STAGE 1 / ARCHIVED', title: '第一份生涯档案已经成立。',
      body: [
        '你没有因为“完成了五个任务”而升级。真正留下来的是一条因果链：一个原型离开桌面，被别人看见，在真实环境里坏掉，然后被你用某种方法重新带回来。',
        '从现在开始，旧版本、失败、关系和现场条件都可以在后面的项目里重新出现。'
      ],
      note: 'Stage 2 的完整剧情仍在内容制作中；当前版本已经把五阶段和三组 Episode 骨架接入，但不会假装后四阶段已经填满。',
      choices: [],
      optionalWorkbench: '你仍然可以回到 FIELD / WORKBENCH / RECORDS 继续整理第一阶段留下的项目和档案。'
    };
  }

  const questId = progress.active.id;
  if (questId === 'main-01-running') {
    return {
      id: 'scene-first-run', kicker: 'WEEK 01 / DESK', title: '今晚只做一个可以被证明存在的东西。',
      body: [
        '没有场地，也没有人等你的提案。你现在拥有的时间只够做一次明确选择。',
        '三条路都能形成第一个项目，但它们会让不同的人、媒介和证据更早进入你的生涯。'
      ],
      choices: [
        { id: 'story:prototype:minimal', title: '做一个最小反馈系统', detail: '只保留输入、规则、反馈。先让它运行，再决定它长什么样。', cost: '注意力 -2 · 系统 / 原型', kind: 'build' },
        { id: 'story:prototype:archive', title: '从一个打不开的旧格式开始', detail: '把失效媒介变成问题，而不是把它当成需要被修复的垃圾。', cost: '注意力 -1 · 档案 / M', kind: 'build' },
        { id: 'story:prototype:materials', title: '整理失败文件，找出一个仍然活着的问题', detail: '从截图、失败录像、安装图和版本文件里重新组织第一个项目。', cost: '注意力 -1 · 文档 / 旧材料', kind: 'build' }
      ],
      optionalWorkbench: workMode === 'blueprint' ? '你也可以先打开工作图，用节点表示“输入 → 规则 → 输出”，再回这里推进叙事。' : undefined
    };
  }

  if (questId === 'main-02-leave-desk') {
    return {
      id: 'scene-leave-desk', kicker: 'ROUTE / FIRST CONTEXT', title: '把它带到一个会改变判断的地方。',
      body: [
        '“出门”本身没有意义。重要的是环境必须改变你现在能做的动作。',
        '你只能把这个半成品带去一个地方。去哪里，会决定你先听见技术问题、媒介问题，还是别人的语言。'
      ],
      choices: [
        { id: 'story:context:studio', title: '去基础工作室，让它连续运行', detail: '风险更高：另一个设备和线材环境可能马上暴露摩擦，但你会更快知道它能不能工作。', cost: '注意力 -2 · 可能暴露故障', kind: 'route' },
        { id: 'story:context:archive', title: '去媒体考古与阅读空间', detail: '先把外部条件和旧媒介历史写成 Note，不急着扩大制作。', cost: '注意力 -1 · 文档 +1', kind: 'route' },
        { id: 'story:context:peer', title: '带着半成品去同行聚点', detail: '你会很早听见别人怎么描述它，也可能发现说明里没有写清的部分。', cost: '注意力 -1 · 关系 / 判断', kind: 'route' }
      ]
    };
  }

  if (questId === 'main-03-other-eyes') {
    if (Number(save.receivedFeedbackCount || 0) > 0) {
      return {
        id: 'scene-feedback-returned', kicker: `WEEK ${String(save.week || 1).padStart(2, '0')} / REPLY`, title: '回复回来了，但它不是评分。',
        body: [
          '对方真正留下来的不是“喜欢 / 不喜欢”，而是他看到了什么、没看懂什么、愿意继续帮你确认什么。',
          '这条反馈已经进入 Evidence。接下来你必须让项目在更真实的条件下暴露一次问题。'
        ],
        choices: [
          { id: 'story:test:blackbox', title: '用一个两小时黑盒测试把问题逼出来', detail: '不是演出。只验证当前最危险的一条链路，让失败变得可诊断。', cost: '注意力 -2 · 场地适配 +1', kind: 'route' }
        ]
      };
    }
    if (hasPendingReply(save)) {
      return {
        id: 'scene-wait-reply', kicker: `WEEK ${String(save.week || 1).padStart(2, '0')} / WAITING`, title: '你已经把版本发出去了。现在不能用刷新聊天窗口推进项目。',
        body: [
          '回复是延迟的。时间向前走时，固定支出也会一起发生。',
          '这不是“点击等待”的惩罚，而是第一次让关系、现金和项目进入同一个时间系统。'
        ],
        choices: [
          { id: 'story:time:wait', title: '结束本周', detail: '支付固定支出，让承诺和回复真正从未来回来。', cost: '时间 +1 周 · ¥450 固定支出', kind: 'time' }
        ]
      };
    }
    return {
      id: 'scene-first-witness', kicker: 'PEOPLE / FIRST WITNESS', title: '给一个真正相关的人看，不要给所有人发。',
      body: [
        '第一个见证人会改变后面的叙事。同行会追问“现在什么能跑”，记录者会追问“哪些失败值得留下”，场地会追问“它在哪里发生”。',
        '你不是在刷好感度。你是在决定谁第一次看见哪个版本。'
      ],
      choices: [
        { id: 'story:witness:lin', title: '发给林：只发当前能跑版本', detail: '告诉他你最不确定哪一块，不发完整提案。', cost: '注意力 -1 · 回复下周回来', kind: 'commitment' },
        { id: 'story:witness:m', title: '发给 M：请他先看失败和改动', detail: '把记录问题放在最终效果之前。', cost: '注意力 -1 · 过程证据', kind: 'commitment' },
        { id: 'story:witness:chen', title: '发给陈：压成一页版本', detail: '用发生地点、观众看到什么和当前缺什么来描述。', cost: '注意力 -1 · 机构语言', kind: 'commitment' }
      ]
    };
  }

  if (questId === 'main-04-why-breaks') {
    if (!hasOpenIssue(save)) {
      return {
        id: 'scene-force-failure', kicker: 'TEST / REAL CONDITION', title: '还没有真正的问题，说明测试条件还不够真实。',
        body: ['不要在桌面上继续猜。让项目进入一个更严格的运行条件，直到至少有一个问题可以被命名。'],
        choices: [
          { id: 'story:test:blackbox', title: '再跑一次黑盒测试', detail: '只盯最危险的输出 / 信号 / 恢复链路，不追求完整效果。', cost: '注意力 -2', kind: 'build' }
        ]
      };
    }
    return {
      id: 'scene-diagnose', kicker: 'INCIDENT / RECOVERY', title: '问题已经出现。现在决定“修好”到底是什么意思。',
      body: [
        '现场故障没有唯一正确答案。有时应该追根溯源，有时必须绕过，有时最专业的选择反而是主动少做一点。',
        '三种方案都会让主线继续，但留下的方法、债务和下一次可用动作不同。'
      ],
      choices: [
        { id: 'story:diagnose:trace', title: '沿信号链逐段排查', detail: '慢一点，但把问题转成一条以后可以重复使用的诊断方法。', cost: '注意力 -1 · 稳定性 +1', kind: 'build' },
        { id: 'story:diagnose:bypass', title: '临时绕过故障点', detail: '先让现场活下来；同时留下一笔“以后必须偿还”的制作债务。', cost: '注意力 -1 · 范围适配 · 新 Thread', kind: 'commitment' },
        { id: 'story:diagnose:degrade', title: '主动降级输出范围', detail: '少做一层效果，保住核心关系。把 Scope 当成恢复工具。', cost: '注意力 -1 · 范围适配', kind: 'commitment' }
      ]
    };
  }

  return {
    id: 'scene-first-public', kicker: 'PUBLIC / FIRST OUTPUT', title: '第一次公开不需要成为代表作，但必须是真实的。',
    body: [
      '现在的问题不是“够不够厉害”，而是你愿意拿什么换取一次可靠公开：缩小范围、花现金借能力，还是选择更小但更清楚的空间。',
      '这一次选择会成为 Stage 1 的结尾证据。'
    ],
    choices: [
      { id: 'story:public:blackbox-minimal', title: '两小时黑盒：主动收缩成可靠版本', detail: '成本最低。只保留当前能力最稳的输入、输出和恢复路径。', cost: '注意力 -2 · ¥150 · Scope 收缩', kind: 'commitment' },
      { id: 'story:public:project-space', title: '独立项目空间：把观看路径说清楚', detail: '多花一点制作成本，换一个更容易被完整看见和记录的第一次公开。', cost: '注意力 -2 · ¥300 · 文档 +1', kind: 'route' },
      { id: 'story:public:borrow-output', title: '借 / 租一套更稳定的输出', detail: '保住当前 Scope，但现金压力会直接进入下一周。', cost: '注意力 -2 · ¥800 · 输出临时达到 2', kind: 'commitment' }
    ],
    optionalWorkbench: workMode !== 'story' ? '如果你不想直接选方案，也可以回工作台 / 工作图自己解决，然后这条叙事会读取同一份状态。' : undefined
  };
}
