import './v05-home.css';

export default function V05Home() {
  return (
    <main className="vh-shell">
      <section className="vh-card">
        <header>
          <small>NEW MEDIA ARTIST SIMULATOR</small>
          <h1>新媒体艺术家模拟器</h1>
          <p>FIELD / WORKBENCH / RECORDS 是世界结构；Blueprint 是工作台里的创作语言。</p>
        </header>
        <div className="vh-modes">
          <a className="primary" href="./?mode=story">
            <small>PRACTICE</small>
            <strong>实践模式</strong>
            <span>从任务、场域、人物和真实限制里逐步获得创作基因。</span>
          </a>
          <a href="./?lab=blueprint&mode=free&blank=1">
            <small>FREE</small>
            <strong>自由模式</strong>
            <span>从空白画布开始，自由拼接媒介、资源、制作流程和方法。</span>
          </a>
          <a href="./?lab=blueprint">
            <small>BLUEPRINT</small>
            <strong>节点编辑器</strong>
            <span>打开自动保存或已有蓝图，编辑、另存、导入、导出和分享。</span>
          </a>
        </div>
        <footer><span>v0.6 playground</span><span>浏览器本地自动保存</span></footer>
      </section>
    </main>
  );
}
