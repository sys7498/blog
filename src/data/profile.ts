// 프로필 / CV 데이터. About 페이지와 CV export가 모두 이 파일을 사용합니다.
// 정보를 여기서만 수정하면 화면과 CV(PDF)에 함께 반영됩니다.

export interface CvEntry {
  period: string; // 예: "2023 – Present"
  title: string; // 학위 / 직책 / 역할
  org: string; // 소속
  location?: string;
  detail?: string;
}

export interface Profile {
  name: string;
  role: string;
  affiliation: string;
  email: string;
  location: string;
  photo: string; // 얼굴 사진 경로 (예: 'assets/avatar.svg' — 실제 사진으로 교체)
  tagline: string; // 랜딩/히어로용 한 줄 연구 소개
  bio: string[]; // 문단 배열
  links: { label: string; url: string }[];
  education: CvEntry[];
  experience: CvEntry[];
  skills: { group: string; items: string[] }[];
  interests: string[];
  news: { date: string; text: string }[];
}

export const PROFILE: Profile = {
  name: 'Yoonseok Shin',
  role: 'M.S. Student',
  affiliation: 'KAIST',
  email: 'sys7498@kaist.ac.kr',
  location: 'Daejeon, Republic of Korea',
  photo: 'assets/yoonseokshin_photo.jpg',
  tagline:
    'I research how machines perceive and understand the world inside virtual reality.',
  bio: [
    "I'm pursuing a master's degree at KAIST's Graduate School of Culture Technology, where my research focuses on computer vision within virtual reality environments at the UVR Lab.",
    'I build interactive 3D and WebXR experiences that double as research prototypes. Outside the lab, I cook, make coffee, and enjoy making things with my hands.',
  ],
  links: [
    { label: 'Email', url: 'mailto:uvrlab@gmail.com' },
    { label: 'GitHub', url: 'https://github.com/sys7498/' },
    {
      label: 'Google Scholar',
      url: 'https://scholar.google.com/citations?user=g8hg2zwAAAAJ&hl=en/',
    },
    {
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/yoonseok-shin-562055310/',
    },
  ],
  education: [
    {
      period: '2024 – Present',
      title: 'M.S. in Culture Technology',
      org: 'KAIST, Graduate School of Culture Technology',
      location: 'Daejeon, Korea',
    },
    {
      period: '2018 – 2024',
      title: 'B.S. in Software and Computer Engineering',
      org: 'Ajou University, College of Information & Communication',
      location: 'Suwon, Korea',
    },
  ],
  experience: [
    {
      period: '2023 – Present',
      title: 'Graduate Researcher',
      org: 'UVR Lab, KAIST',
      location: 'Daejeon, Korea',
      detail: 'Research on computer vision and interaction in immersive VR/XR.',
    },
  ],
  skills: [
    {
      group: 'Research',
      items: [
        'Computer Vision',
        'Virtual / Augmented Reality',
        'Human–Computer Interaction',
      ],
    },
    {
      group: 'Engineering',
      items: [
        'Three.js',
        'WebXR',
        'GLSL',
        'TypeScript / Angular',
        'Python',
        'OpenCV',
      ],
    },
  ],
  interests: ['Cooking', 'Coffee', 'Hands-on making'],
  news: [
    {
      date: 'YYYY.MM',
      text: 'News item placeholder.',
    },
    {
      date: 'YYYY.MM',
      text: 'News item placeholder.',
    },
    {
      date: 'YYYY.MM',
      text: 'News item placeholder.',
    },
  ],
};
