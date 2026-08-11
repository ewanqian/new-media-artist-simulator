export type ButterflyKnowledgeEntry = {
  id: string;
  title: string;
  short: string;
  body: string[];
  sceneNodeIds: string[];
  unlockNodeIds?: string[];
  methodIds?: string[];
};

export const butterflyScholarKnowledge: ButterflyKnowledgeEntry[] = [
  {
    id: 'know-butterfly-capture',
    title: '蝴蝶怎么进入数字作品？',
    short: '别把飞着的蝴蝶硬扫成 3D。记录个体、时间和行为；扫描它停留和依赖的植物与空间。',
    body: [
      '飞行中的蝴蝶很难用普通摄影测量稳定重建。更可靠的做法是把它拆成几种资料：照片、出现时间、行为、寄主植物、所在位置。',
      '真正适合扫描的是植物、地面、小径、标本和它们所在的空间。最后作品连接的是“蝴蝶和环境的关系”，不是强行得到一只完美 3D 蝴蝶。'
    ],
    sceneNodeIds: ['bs-03-field'],
    unlockNodeIds: ['butterfly-observation', 'plant-specimen'],
    methodIds: ['method-field-metadata']
  },
  {
    id: 'know-overlap',
    title: '什么叫照片重叠？',
    short: '相邻照片里要反复看到同一块表面，软件才知道它们彼此是什么关系。',
    body: [
      '摄影测量不是“照片越多越好”。关键是相邻照片之间有足够共同内容，而且拍摄位置真的发生了变化。',
      '如果一块叶片只在一张照片里出现，或者你站在原地只转相机，后面的匹配会变得不可靠。'
    ],
    sceneNodeIds: ['bs-03b-audit'],
    unlockNodeIds: ['capture-quality-check'],
    methodIds: ['method-check-before-leave']
  },
  {
    id: 'know-camera-solve',
    title: '什么是相机求解？',
    short: '软件先猜出每张照片是从哪里拍的；这一步错了，后面点云和高斯都会一起错。',
    body: [
      'Metashape 的 Align Photos、COLMAP 的 SfM，本质上都在先解决一件事：这些照片之间哪些特征能对应，以及每台相机当时在哪里。',
      '你先看“有多少照片成功注册、相机轨迹有没有突然跳走、稀疏点是不是像一个正常空间”。这些比直接追求稠密点数更重要。'
    ],
    sceneNodeIds: ['bs-04-process'],
    unlockNodeIds: ['process-metashape-align', 'process-colmap-sfm'],
    methodIds: ['method-diagnose-before-reconstruct']
  },
  {
    id: 'know-pointcloud-gaussian',
    title: '点云和 Gaussian 有什么区别？',
    short: '点云是一堆空间采样点；Gaussian 更擅长从不同视角连续重放照片里的外观。',
    body: [
      '点云很直接：你能看到采样密度、破洞和浮点，它也很适合继续进 Blender、TouchDesigner、Unity 或 Unreal 做程序化处理。',
      'Gaussian Splatting 更像用很多带颜色和方向信息的小体积去还原照片中的空间外观，移动视角时通常更连续。它不是“高级点云”，只是另一种表示。'
    ],
    sceneNodeIds: ['bs-04a-represent'],
    unlockNodeIds: ['process-dense-reconstruction', 'process-gaussian-splat']
  },
  {
    id: 'know-blender-motion',
    title: '扫描完以后怎么让它动起来？',
    short: '可以把点云/网格带进 Blender，用 Noise、Geometry Nodes 或位移做程序化运动。',
    body: [
      '扫描只是得到材料。进入 Blender 以后，你可以把位置、密度、时间变成动画参数，例如用 Noise 让局部缓慢漂移，或者按距离、植物类型、时间戳改变位移。',
      '重点不是“加一个炫酷特效”，而是先决定运动对应什么：风、记忆衰减、观察次数、季节，还是纯粹的空间呼吸。'
    ],
    sceneNodeIds: ['bs-04a-represent', 'bs-04c-browser'],
    unlockNodeIds: ['process-blender-procedural'],
    methodIds: ['method-procedural-motion']
  },
  {
    id: 'know-butterfly-authorship',
    title: '用了蝴蝶，就算抄别人吗？',
    short: '题材本身不属于某个人；真正需要比较的是具体形式、方法、叙事结构和来源是否被隐藏。',
    body: [
      '艺术圈经常会把一个反复出现的形象和某位创作者绑定，于是后来的人一用相似题材就容易被快速判断为“抄”。',
      '比较时更有用的问题是：你借用了什么具体形式？方法是否相似？有没有直接引用某件作品？你的材料来源和关系是否不同？需要引用时就明确写出来。'
    ],
    sceneNodeIds: ['bs-03c-reference', 'bs-05-public'],
    unlockNodeIds: ['method-source-attribution'],
    methodIds: ['method-source-attribution']
  },
  {
    id: 'know-supersplat',
    title: '浏览器里的 Splat 编辑器能干什么？',
    short: '适合快速裁剪、删浮点、调外观和做相机路径；它不等于完整制作流程。',
    body: [
      '浏览器工具的优势是打开快、预览快、分享方便。你可以先把明显漂浮的点删掉、裁掉无关区域、检查视角。',
      '如果后面要做复杂动画、合成或实时系统，仍然可能回到 Blender、TouchDesigner、Unity/Unreal 等工具。网页只是工作流中的一个节点。'
    ],
    sceneNodeIds: ['bs-04c-browser'],
    unlockNodeIds: ['process-point-clean'],
    methodIds: ['method-browser-splat-cleanup']
  }
];

export const butterflyKnowledgeById = new Map(butterflyScholarKnowledge.map((entry) => [entry.id, entry]));

export function knowledgeForNarrativeNode(nodeId: string) {
  return butterflyScholarKnowledge.filter((entry) => entry.sceneNodeIds.includes(nodeId));
}
