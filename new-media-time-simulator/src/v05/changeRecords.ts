import type { ChangeRecord } from './controlSystem.ts';

export const v051ChangeRecords: ChangeRecord[] = [
  {
    id: 'wp-attention-contract',
    playerProblem: 'Unintroduced concepts and dead interface elements could enter any screen without a reusable rule.',
    changedFiles: ['src/v05/controlSystem.ts', 'src/v05/tests/controlSystem.test.mjs'],
    stateEffect: 'None. This gate validates visible surfaces and action traceability before runtime.',
    automatedChecks: ['generic provenance/relevance/action contract', 'redundancy and duplicate-fact checks'],
    humanReview: 'passed',
    rollbackCommit: '9f83b44'
  },
  {
    id: 'wp-first-session',
    playerProblem: 'A first-time player met menus, systems, people, and specialist language before a concrete situation.',
    changedFiles: ['src/v05/firstWeekContent.ts', 'src/v05/runState.ts', 'src/v05/web/V051VerticalSlice.jsx'],
    stateEffect: 'Four deterministic actions create and update one Work, versions, feedback, history, and a resumable save.',
    automatedChecks: ['all first-session surfaces pass control gate', 'malformed save', 'refresh resume', 'AI-off', 'desktop and mobile browser'],
    humanReview: 'passed',
    rollbackCommit: '356dfd5'
  },
  {
    id: 'wp-feedback-loop',
    playerProblem: 'Feedback existed as flavor but did not alter what the player could make or ignore.',
    changedFiles: ['src/v05/firstWeekContent.ts', 'src/v05/runState.ts'],
    stateEffect: 'Feedback is attached to a Work version and can be used, retested, or ignored with different later outcomes.',
    automatedChecks: ['81 deterministic paths', 'source-specific follow-up actions', 'feedback response trace'],
    humanReview: 'passed',
    rollbackCommit: 'aabf268'
  },
  {
    id: 'wp-route-isolation',
    playerProblem: 'The clean first session still downloaded legacy engines, overlays, and global repair styles.',
    changedFiles: ['src/App.jsx', 'src/legacy/LegacySimulator.jsx', 'src/v05/web/V05LegacyFrame.jsx'],
    stateEffect: 'None. Legacy v05 and the original simulator remain available but load only when their routes are opened.',
    automatedChecks: ['entry bundle budget', 'v051 legacy-request browser check', 'full legacy v05 browser suite'],
    humanReview: 'passed',
    rollbackCommit: '48d34db'
  },
  {
    id: 'wp-costa-rica-focused-route',
    playerProblem: 'The optional chapter introduced unexplained people, specialist terms, side systems, and archive labels before the player understood the situation.',
    changedFiles: ['src/v05/butterflyScholarPack.ts', 'src/v05/web/V05ButterflyScholarRoute.jsx', 'src/v05/costaRicaAttention.ts'],
    stateEffect: 'Twelve traceable decisions create one chapter-specific Work and save; people enter through scenes and player-chosen feedback changes later text.',
    automatedChecks: ['generic attention and redundancy gate on every scene', 'dynamic-copy vocabulary regression', 'separate save and public Work browser path', 'desktop and mobile browser'],
    humanReview: 'passed',
    rollbackCommit: 'dcef346'
  }
];
