import { Injectable } from '@angular/core';
import * as THREE from 'three';
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
  constructor() {}

  /** 초기화 메소드 */
  public initVrService(container: HTMLCanvasElement, text: string) {
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

    const hand1 = this.renderer.xr.getHand(0);
    const handModel1 = handModelFactory.createHandModel(hand1, 'boxes');
    hand1.add(handModel1);
    this.scene.add(hand1);

    // Hand 2
    const controllerGrip2 = this.renderer.xr.getControllerGrip(1);
    controllerGrip2.add(
      controllerModelFactory.createControllerModel(controllerGrip2)
    );
    this.scene.add(controllerGrip2);

    const hand2 = this.renderer.xr.getHand(1);
    const handModel2 = handModelFactory.createHandModel(hand2, 'boxes');
    hand2.add(handModel2);
    this.scene.add(hand2);

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
    this.createMovingSphere(text);
    this.createBlackSquare();
    this.add3DText(text);
    this.detectPinch(hand1, 0);
    this.detectPinch(hand2, 1);
    // 애니메이션 시작
    this.startAnimation();
  }

  private detectPinch(hand: THREE.Group, handIndex: number) {
    hand.addEventListener('pinchstart', () => {
      console.log(`Hand ${handIndex + 1} started pinching!`);
      this.onPinch(handIndex);
    });

    hand.addEventListener('pinchend', () => {
      console.log(`Hand ${handIndex + 1} stopped pinching!`);
    });
  }

  private onPinch(handIndex: number) {
    console.log(`Hand ${handIndex + 1} Pinch action triggered`);
    // 핀치에 따른 추가 동작 로직 구현
    this.scene.background = new THREE.Color(0x00ff00);
  }

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

        const material = new THREE.MeshBasicMaterial({ color: 0x0090f2 });
        const textMesh = new THREE.Mesh(geometry, material);

        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;

        if (boundingBox) {
          const textWidth = boundingBox.max.x - boundingBox.min.x;
          geometry.translate(-textWidth / 2, 0, 0);
        }

        this.scene.add(textMesh);
        textMesh.lookAt(this.camera.position.sub(textMesh.position));
        textMesh.position.set(0, 10, -30);
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

      void main() {
        // Normalize interpolated normal and position
        vec3 normal = normalize(vNormal);
        vec3 lightDir = normalize(lightPosition - vPosition);
        vec3 viewDir = normalize(viewPosition - vPosition);
        
        // Ambient component
        vec3 ambient = vec3(0.1, 0.1, 0.1);

        // Diffuse component
        float diff = max(dot(lightDir, normal), 0.0);
        vec3 diffuse = diff * vec3(0.6, 0.8, 1.0); // Assuming white light

        // Specular component
        vec3 reflectDir = reflect(-lightDir, normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 8.0);
        vec3 specular = spec * vec3(0.1, 0.1, 0.1); // Assuming white light

        // Combine components
        vec3 color = ambient + diffuse + specular;
        gl_FragColor = vec4(color, 1.0);
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
