import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class VrScenegraphService {
  public scene: THREE.Scene = undefined as unknown as THREE.Scene;
  public camera: THREE.PerspectiveCamera =
    undefined as unknown as THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer =
    undefined as unknown as THREE.WebGLRenderer;
  public animationID: number | undefined = undefined;

  constructor() {}

  /** 초기화 메소드 */
  public initVrService(container: HTMLCanvasElement) {
    // 씬 생성
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // 렌더러 생성 및 WebXR 활성화
    this.renderer = new THREE.WebGLRenderer({
      canvas: container,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;

    // 카메라 생성
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 20);

    // 기본적인 장면 요소 추가 (예: 큐브)
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    // 애니메이션 시작
    this.startAnimation();
  }

  /** 애니메이션 루프 */
  private startAnimation() {
    const animationCallback = () => {
      // 간단한 회전 애니메이션
      this.scene.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.rotation.x += 0.01;
          child.rotation.y += 0.01;
        }
      });

      // 씬 렌더링
      this.renderer.render(this.scene, this.camera);

      // 애니메이션 프레임 요청
      this.animationID = this.renderer.setAnimationLoop(animationCallback)!;
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
    cancelAnimationFrame(this.animationID!);
  }
}
