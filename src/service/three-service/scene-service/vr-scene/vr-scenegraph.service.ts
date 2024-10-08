import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

@Injectable({
  providedIn: 'root',
})
export class VrScenegraphService {
  public scene: THREE.Scene = undefined as unknown as THREE.Scene;
  public camera: THREE.PerspectiveCamera =
    undefined as unknown as THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer =
    undefined as unknown as THREE.WebGLRenderer;
  public light: THREE.AmbientLight = undefined as unknown as THREE.AmbientLight;
  public animationID: number | undefined = undefined;
  public sphere: THREE.Mesh = undefined as unknown as THREE.Mesh;
  public material: THREE.ShaderMaterial =
    undefined as unknown as THREE.ShaderMaterial;
  public answers: string[] = [
    'ME by GenAI\n(answers and the shape of sculpture are generated by AI)',
    "My name is Yoonseok Shin. \nThis is a virtual ME that I've created using Three.js and WebXR.",
    "My major is Culture Technology, and I am currently pursuing\n a master's degree at KAIST's Graduate School of Culture Technology.",
    'My lab is the UVR Lab at KAIST, where I research computer vision in virtual reality environments.',
    'My hobbies include cooking and making coffee,\n which stemmed from my childhood love for building things like LEGO, science kits, and Gundam models.\n I enjoy activities that involve using my hands to create.',
    'My house is in Korea, where I am currently studying at KAIST.',
    'My research topic focuses on computer vision in virtual reality environments,\n specifically within the context of the UVR Lab at KAIST.',
  ];
  public nowAnswerOrder = 0;
  public textMesh: THREE.Mesh = undefined as unknown as THREE.Mesh;
  constructor() {}

  /** 초기화 메소드 */
  public initVrService(container: HTMLCanvasElement) {
    // 씬 생성
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    // 렌더러 생성 및 WebXR 활성화
    this.renderer = new THREE.WebGLRenderer({
      canvas: container,
      antialias: true,
      alpha: true,
      precision: 'highp',
    });
    this.renderer.setPixelRatio(Math.min(3, window.devicePixelRatio));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.setFramebufferScaleFactor(2.0);
    this.renderer.xr.enabled = true;

    const sessionInit = {
      requiredFeatures: ['hand-tracking'],
    };
    document.body.appendChild(
      VRButton.createButton(this.renderer, sessionInit)
    );

    // 카메라 생성
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.001,
      10000
    );
    this.camera.position.set(0, 0, 0);

    // 조명 생성
    this.light = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(this.light);
    this.createMovingSphere(this.answers[0]);
    this.createBlackSquare();
    this.add3DText(this.answers[0]);

    // controllers

    const controller1 = this.renderer.xr.getController(0);
    this.scene.add(controller1);

    const controller2 = this.renderer.xr.getController(1);
    this.scene.add(controller2);

    const controllerModelFactory = new XRControllerModelFactory();
    const handModelFactory = new XRHandModelFactory();

    // Hand 1
    const controllerGrip1 = this.renderer.xr.getControllerGrip(0);
    controllerGrip1.add(
      controllerModelFactory.createControllerModel(controllerGrip1)
    );
    this.scene.add(controllerGrip1);
    console.log(this.material);
    const hand1 = this.renderer.xr.getHand(0);
    hand1.addEventListener('pinchstart', () => {
      this.updateUnicodeValues();
    });
    hand1.addEventListener('pinchend', this.onPinchEnd);
    hand1.add(handModelFactory.createHandModel(hand1));

    this.scene.add(hand1);

    // Hand 2
    const controllerGrip2 = this.renderer.xr.getControllerGrip(1);
    controllerGrip2.add(
      controllerModelFactory.createControllerModel(controllerGrip2)
    );
    this.scene.add(controllerGrip2);

    const hand2 = this.renderer.xr.getHand(1);
    hand2.addEventListener('pinchstart', () => {
      this.updateUnicodeValues();
    });
    hand2.addEventListener('pinchend', this.onPinchEnd);
    hand2.add(handModelFactory.createHandModel(hand2));
    this.scene.add(hand2);
    // 애니메이션 시작
    this.startAnimation();
  }

  private updateUnicodeValues() {
    this.textMesh.removeFromParent();
    const newUnicodeValues = new Float32Array(15);
    const length = Math.min(
      15,
      Math.max(1, this.answers[this.nowAnswerOrder].split('').length / 5)
    );
    for (let i = 0; i < length; i++) {
      newUnicodeValues[i] = this.answers[this.nowAnswerOrder].charCodeAt(i); // 새로운 임의의 값 생성
    }

    // 셰이더에 값 업데이트
    this.material.uniforms['unicodeValues'].value = newUnicodeValues;
    this.material.uniforms['length'].value = length;

    this.nowAnswerOrder++;
    this.update3DText(this.answers[this.nowAnswerOrder]);
  }

  private onPinchEnd() {}

  add3DText(text: string): void {
    const loader = new FontLoader();
    loader.load(
      'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
      (font) => {
        const geometry = new TextGeometry(text, {
          font: font,
          size: 1,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.01,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 5,
        });

        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.textMesh = new THREE.Mesh(geometry, material);

        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;

        if (boundingBox) {
          const textWidth = boundingBox.max.x - boundingBox.min.x;
          geometry.translate(-textWidth / 2, 0, 0);
        }

        this.scene.add(this.textMesh);
        this.textMesh.lookAt(this.camera.position.sub(this.textMesh.position));
        this.textMesh.position.set(0, 15, -30);
      }
    );
  }

  update3DText(text: string): void {
    const loader = new FontLoader();
    loader.load(
      'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
      (font) => {
        const geometry = new TextGeometry(text, {
          font: font,
          size: 1,
          height: 0.2,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 0.01,
          bevelSize: 0.02,
          bevelOffset: 0,
          bevelSegments: 5,
        });

        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.textMesh = new THREE.Mesh(geometry, material);

        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;

        if (boundingBox) {
          const textWidth = boundingBox.max.x - boundingBox.min.x;
          geometry.translate(-textWidth / 2, 0, 0);
        }
        this.scene.add(this.textMesh);
        //this.textMesh.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
        //this.textMesh.lookAt(this.camera.position.sub(this.textMesh.position));
        this.textMesh.position.set(0, 15, -30);
      }
    );
  }

  private createMovingSphere(text: string) {
    const geometry = new THREE.SphereGeometry(2, 128, 128);

    // Convert input text to unicode values
    const unicodeValues = new Float32Array(15);
    const length = Math.min(15, text.length);
    for (let i = 0; i < length; i++) {
      unicodeValues[i] = text.charCodeAt(i);
    }

    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;

      uniform float time;
      uniform float unicodeValues[15];
      uniform int length;

      // Simplex Noise function
      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 permute(vec4 x) {
        return mod289(((x * 34.0) + 1.0) * x);
      }

      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }

      float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        // First corner
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        //  x0 = x0 - 0.0 + 0.0 * C.xxx;
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; //  x2 = x0 - 1.0 + 2.0 * C.xxx;
        vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

        // Permutations
        i = mod289(i);
        vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        float n_ = 0.142857142857; // 1.0/7.0
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 g0 = vec3(a0.xy, h.x);
        vec3 g1 = vec3(a0.zw, h.y);
        vec3 g2 = vec3(a1.xy, h.z);
        vec3 g3 = vec3(a1.zw, h.w);

        // Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(g0, g0), dot(g1, g1), dot(g2, g2), dot(g3, g3)));
        g0 *= norm.x;
        g1 *= norm.y;
        g2 *= norm.z;
        g3 *= norm.w;

        // Mix final noise value
        vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m * m, vec4(dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3)));
      }

      float textNoise(vec3 v) {
        float noiseValue = 0.0;
        for (int i = 0; i < length; i++) {
          noiseValue += snoise(v + unicodeValues[i] * 0.001);
        }
        return noiseValue * 0.5;
      }

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

        // Choose the type of noise you want to use
        float displacement = textNoise(position + time * 0.5) * 2.0;

        vec3 displacedPosition = position + vNormal * displacement;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
      }
    `;

    const fragmentShader = `
  varying vec3 vNormal;
varying vec3 vPosition;

uniform vec3 lightPosition;
uniform vec3 viewPosition;
uniform float unicodeValues[15];
uniform int length;
uniform float time; // 시간을 활용해 색상 변화를 동적으로 만들기

// Simplex Noise function
vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * vec3(0.5, 1.0, 1.5) - vec3(0.0, 0.5, 1.0);

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 g0 = vec3(a0.xy, h.x);
    vec3 g1 = vec3(a0.zw, h.y);
    vec3 g2 = vec3(a1.xy, h.z);
    vec3 g3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(g0, g0), dot(g1, g1), dot(g2, g2), dot(g3, g3)));
    g0 *= norm.x;
    g1 *= norm.y;
    g2 *= norm.z;
    g3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(g0, x0), dot(g1, x1), dot(g2, x2), dot(g3, x3)));
}

// 유니코드 값과 시간, 위치를 활용한 색상 계산
vec3 computeDynamicColor(float unicodeValue, vec3 position, float time) {
    // 유니코드 값과 시간, 위치에 기반하여 색상 변화를 동적으로 계산
    float r = mod(sin(unicodeValue * 0.1 + time + position.x * 0.5), 1.0);
    float g = mod(cos(unicodeValue * 0.2 + time + position.y * 0.5), 1.0);
    float b = mod(sin(unicodeValue * 0.3 + time + position.z * 0.5), 1.0);
    return vec3(r, g, b);
}

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(lightPosition - vPosition);
    vec3 viewDir = normalize(viewPosition - vPosition);

    // Ambient component
    vec3 ambient = vec3(0.1, 0.1, 0.1);

    // Diffuse component
    float diff = max(dot(lightDir, normal), 0.0);
    vec3 diffuse = diff * vec3(0.6, 0.8, 1.0);

    // Specular component
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), 8.0);
    vec3 specular = spec * vec3(0.1, 0.1, 0.1);

    // 유니코드 값에 기반한 동적 색상 계산
    vec3 dynamicColor = vec3(0.0);
    for (int i = 0; i < length; i++) {
      dynamicColor += computeDynamicColor(unicodeValues[i], vPosition, time);
    }
    dynamicColor = normalize(dynamicColor); // 색상 값을 0~1 범위로 정규화

    // Combine components
    vec3 finalColor = ambient + diffuse * dynamicColor + specular;

    gl_FragColor = vec4(finalColor, 1.0);
}
`;
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        lightPosition: { value: new THREE.Vector3(0, 0, 100) },
        viewPosition: { value: new THREE.Vector3(0, 0, 5) },
        time: { value: 0.0 },
        unicodeValues: { value: unicodeValues },
        length: { value: length },
      },
    });
    this.sphere = new THREE.Mesh(geometry, this.material);
    this.sphere.position.set(0, -5, -30);
    this.scene.add(this.sphere);
  }

  private createBlackSquare() {
    const element = document.createElement('div');
    element.style.width = '200px';
    element.style.height = '200px';
    element.style.backgroundColor = 'black';

    const htmlMesh = new HTMLMesh(element);
    htmlMesh.position.set(0, 1, -10); // 카메라와 충분히 떨어진 위치로 설정
    htmlMesh.rotation.set(Math.PI / 2, 0, 0);
    this.scene.add(htmlMesh);
  }

  /** 애니메이션 루프 */
  private startAnimation() {
    const animationCallback = () => {
      this.material.uniforms['time'].value += 0.001;

      // 씬 렌더링
      this.renderer.render(this.scene, this.camera);

      // 애니메이션 프레임 요청
      this.renderer.setAnimationLoop(animationCallback);
    };

    animationCallback();
  }

  /** 창 크기 조정에 따른 처리 */
  public onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  /** 애니메이션 중지 */
  public destroyAnimation() {
    this.renderer.setAnimationLoop(null);
    if (this.animationID !== undefined) {
      cancelAnimationFrame(this.animationID);
    }
  }
}
