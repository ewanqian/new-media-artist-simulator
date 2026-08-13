import { lazy, Suspense } from 'react';

const V03CorePreview = lazy(() => import('./v03/web/V03CorePreview.jsx'));
const V05Experience = lazy(() => import('./v05/web/V05CareerExperienceShell.jsx'));
const V05BlueprintEditor = lazy(() => import('./v05/web/V05BlueprintEditor.jsx'));
const V05Home = lazy(() => import('./v05/web/V05Home.jsx'));
const V05CareerEntry = lazy(() => import('./v05/web/V05CareerEntry.jsx'));
const V05ContentManager = lazy(() => import('./v05/web/V05ContentManager.jsx'));
const V05CostaRicaRoute = lazy(() => import('./v05/web/V05ButterflyScholarRoute.jsx'));
const V05Ep00Route = lazy(() => import('./v05/web/V05Ep00Route.jsx'));
const V051VerticalSlice = lazy(() => import('./v05/web/V051VerticalSlice.jsx'));
const V05LegacyFrame = lazy(() => import('./v05/web/V05LegacyFrame.jsx'));
const LegacySimulator = lazy(() => import('./legacy/LegacySimulator.jsx'));

function V05Frame({ children }) {
  return <Suspense fallback={<main className="app-shell"><section className="panel">正在载入…</section></main>}><V05LegacyFrame>{children}</V05LegacyFrame></Suspense>;
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const corePreview = params.get('core');
  const pathPreview = window.location.pathname.includes('/v051/')
    ? 'v051'
    : window.location.pathname.includes('/v05/') ? 'v05'
      : window.location.pathname.includes('/v03/') ? 'v03' : null;
  const preview = corePreview || pathPreview;
  const lab = params.get('lab');
  const mode = params.get('mode');

  // v05.1 opens inside play. Original v05 stays available as rollback.
  if (preview === 'v051') {
    return <Suspense fallback={<main className="app-shell"><section className="panel">正在打开网页…</section></main>}><V051VerticalSlice /></Suspense>;
  }
  if (preview === 'v05' && mode === 'core') {
    return <V05Frame><Suspense fallback={<main className="app-shell"><section className="panel">正在载入首局…</section></main>}><V051VerticalSlice /></Suspense></V05Frame>;
  }
  if (preview === 'v05' && lab === 'blueprint') {
    return (
      <V05Frame><Suspense fallback={<main className="app-shell"><section className="panel">正在载入节点编辑器…</section></main>}><V05BlueprintEditor /></Suspense></V05Frame>
    );
  }
  if (preview === 'v05' && (mode === 'costarica' || mode === 'butterfly')) {
    return (
      <V05Frame><Suspense fallback={<main className="app-shell"><section className="panel">正在载入哥斯达黎加驻地…</section></main>}><V05CostaRicaRoute /></Suspense></V05Frame>
    );
  }
  if (preview === 'v05' && mode === 'ep00') {
    return (
      <V05Frame><Suspense fallback={<main className="app-shell"><section className="panel">正在建立第一张工作台…</section></main>}><V05Ep00Route /></Suspense></V05Frame>
    );
  }
  if (preview === 'v05' && mode === 'career') {
    return (
      <V05Frame><Suspense fallback={<main className="app-shell"><section className="panel">正在建立生涯档案…</section></main>}><V05CareerEntry /></Suspense></V05Frame>
    );
  }
  if (preview === 'v05' && mode === 'content') {
    return (
      <V05Frame><Suspense fallback={<main className="app-shell"><section className="panel">正在载入内容管理…</section></main>}><V05ContentManager /></Suspense></V05Frame>
    );
  }
  if (preview === 'v05' && mode === 'story') {
    return (
      <V05Frame><Suspense fallback={<main className="app-shell"><section className="panel">正在载入新媒体艺术家模拟器…</section></main>}><V05Experience /></Suspense></V05Frame>
    );
  }
  if (preview === 'v05') {
    return (
      <V05Frame><Suspense fallback={<main className="app-shell"><section className="panel">正在载入…</section></main>}><V05Home /></Suspense></V05Frame>
    );
  }
  if (preview === 'v03') {
    return (
      <Suspense fallback={<main className="app-shell"><section className="panel">正在载入 v0.3 Core Engine…</section></main>}>
        <V03CorePreview />
      </Suspense>
    );
  }
  return <Suspense fallback={<main className="app-shell"><section className="panel">正在载入…</section></main>}><LegacySimulator/></Suspense>;
}
