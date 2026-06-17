import { HostListener, Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class ScenegraphService {
  public scene: THREE.Scene = undefined as unknown as THREE.Scene;
  public camera: THREE.PerspectiveCamera =
    undefined as unknown as THREE.PerspectiveCamera;
  public sphere: THREE.Mesh = undefined as unknown as THREE.Mesh;
  public material: THREE.ShaderMaterial =
    undefined as unknown as THREE.ShaderMaterial;
  public renderer: THREE.WebGLRenderer =
    undefined as unknown as THREE.WebGLRenderer;
  public animationID: number = 0;
  // 마우스 목표값(-1~1). 애니메이션 루프에서 부드럽게 따라감.
  public mouseTarget = new THREE.Vector2(0, 0);
  // 구의 가로 배치 오프셋 (넓은 화면에선 우측, 좁은 화면에선 가운데)
  public sphereOffsetX = 0;
  constructor() {}

  /** 마우스 이동을 정규화(-1~1)해서 전달 */
  public setMouse(clientX: number, clientY: number) {
    this.mouseTarget.set(
      (clientX / window.innerWidth) * 2 - 1,
      -((clientY / window.innerHeight) * 2 - 1)
    );
  }

  /** 화면 폭에 따라 구를 우측/가운데로 배치 (좌측 소개 텍스트 공간 확보) */
  public setLayout(width: number) {
    this.sphereOffsetX = width >= 900 ? 1.7 : width >= 640 ? 0.9 : 0;
    if (this.sphere) {
      this.sphere.position.x = this.sphereOffsetX;
    }
  }

  public initService(container: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.renderer = new THREE.WebGLRenderer({
      canvas: container,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    //const geometry = new THREE.TorusGeometry(1, 0.5, 64, 64);
    //const geometry = new THREE.BoxGeometry(1, 1, 1, 64, 64, 64);
    //const geometry = new THREE.TorusKnotGeometry(1, 0.1, 100, 16);
    const vertexShader = `
      varying vec3 vNormal;
      varying vec3 vPosition;

      uniform float time;
      uniform vec2 mouse;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;

        vec3 v_x = vec3(1.0, 0.0, 0.0);
        vec3 v_y = vec3(0.0, 1.0, 0.0);
        vec3 v_z = vec3(0.0, 0.0, 1.0);
        vec3 v_xyz = vec3(1.0, 1.0, 1.0);

        float degree_x = acos(dot(v_x, normalize(position))) + time;
        float degree_y = acos(dot(v_y, normalize(position))) + time;
        float degree_z = acos(dot(v_z, normalize(position))) + time;
        float degree_xyz = acos(dot(normalize(v_xyz), normalize(position))) + time;

        float frequency = 50.0;

        float displacement = (((cos(frequency * degree_x) + 0.1) * (sin(frequency * degree_y) + 0.1) * (cos(frequency * degree_z) + 0.1) * (cos(frequency * degree_xyz) + 0.1)) + 0.1);

        // 커서가 향하는 쪽의 가시를 더 크게 — 구체를 "건드리는" 느낌
        vec3 mouseDir = normalize(vec3(mouse * 1.5, 1.0));
        float towards = dot(normalize(position), mouseDir); // -1~1
        displacement *= (1.0 + 0.9 * max(towards, 0.0));

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
        mouse: { value: new THREE.Vector2(0, 0) },
      },
    });
    this.sphere = new THREE.Mesh(geometry, this.material);
    this.sphere.position.x = this.sphereOffsetX;
    this.scene.add(this.sphere);
    startAnimation(this);
  }

  public onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.setLayout(window.innerWidth);
  }

  public destroyAnimation() {
    cancelAnimationFrame(this.animationID);
  }
}

/** 애니메이션 함수 */
const startAnimation = function (scene: ScenegraphService) {
  const animationFrame = function () {
    scene.material.uniforms['time'].value += 0.001;

    // 마우스 uniform 을 목표값으로 부드럽게 보간
    const m = scene.material.uniforms['mouse'].value as THREE.Vector2;
    m.lerp(scene.mouseTarget, 0.08);

    // 구체를 커서 쪽으로 살짝 기울임
    scene.sphere.rotation.y += (scene.mouseTarget.x * 0.6 - scene.sphere.rotation.y) * 0.05;
    scene.sphere.rotation.x += (-scene.mouseTarget.y * 0.6 - scene.sphere.rotation.x) * 0.05;

    // 카메라 parallax — 마우스를 따라 시점이 미세하게 움직여 깊이감
    scene.camera.position.x += (scene.mouseTarget.x * 0.5 - scene.camera.position.x) * 0.04;
    scene.camera.position.y += (scene.mouseTarget.y * 0.5 - scene.camera.position.y) * 0.04;
    scene.camera.lookAt(scene.sphere.position.x * 0.5, 0, 0);

    scene.renderer.render(scene.scene, scene.camera);
    scene.animationID = requestAnimationFrame(animationFrame);
  };
  animationFrame();
};
