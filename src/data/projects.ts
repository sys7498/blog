// 프로젝트 데이터. embedUrl 이 있으면 상세 페이지에서 iframe 으로 인터랙티브 데모를 임베드합니다.
// 직접 만든 데모를 src/assets/demos/ 에 두고 'assets/demos/xxx/index.html' 로 지정하거나,
// 외부에 배포한 데모 URL 을 넣으면 됩니다. routerLink 로 내부 라우트(예: '/vr')도 가능합니다.

export interface Project {
  slug: string;
  title: string;
  year: number;
  summary: string;
  description?: string[]; // 상세 본문 문단
  tags: string[];
  thumbnail?: string; // 썸네일 이미지 경로 (예: 'assets/thumbs/foo.jpg'). 없으면 플레이스홀더

  embedUrl?: string; // iframe 으로 임베드할 인터랙티브 데모 (선택)
  internalRoute?: string; // 앱 내부 라우트로 이동하는 데모 (예: '/vr')
  links?: { label: string; url: string }[];
}

export const PROJECTS: Project[] = [
  {
    slug: 'virtual-me',
    title: 'Virtual ME',
    year: 2025,
    summary:
      'A GenAI-driven virtual self you meet in VR. Pinch to cycle answers; the sphere reshapes to each text.',
    description: [
      'A WebXR experience where a generative "virtual me" answers questions about myself. Hand-tracking pinch gestures cycle through answers, and a shader-displaced sphere reshapes to each text via its unicode values.',
      'Built with Three.js, WebXR hand-tracking, and custom GLSL shaders.',
    ],
    tags: ['Three.js', 'WebXR', 'GLSL', 'Hand-tracking'],
    internalRoute: '/vr',
    links: [],
  },
  {
    slug: 'noise-sphere',
    title: 'Noise Sphere',
    year: 2025,
    summary:
      'Real-time simplex-noise vertex displacement on a sphere — the interactive toy on the home page.',
    description: [
      'A mouse-reactive sphere driven by a custom vertex shader. The home-page centerpiece — move the cursor to push the spikes around.',
    ],
    tags: ['Three.js', 'ShaderMaterial', 'GLSL'],
    internalRoute: '/sphere',
    links: [],
  },
  {
    slug: 'embed-example',
    title: 'Embeddable Demo (template)',
    year: 2026,
    summary:
      'Template entry showing how an interactive web demo gets embedded via iframe. Replace embedUrl with your own.',
    description: [
      'Drop your interactive build under src/assets/demos/<name>/ and set embedUrl to "assets/demos/<name>/index.html", or point it at a deployed URL. It will render full-width in a sandboxed iframe below.',
    ],
    tags: ['Template'],
    embedUrl: 'https://example.com/',
    links: [],
  },
];
