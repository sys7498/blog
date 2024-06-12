import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root',
})
export class ScenegraphService {
  public scene: THREE.Scene = undefined as unknown as THREE.Scene;
  public camera: THREE.PerspectiveCamera =
    undefined as unknown as THREE.PerspectiveCamera;
  public cube: THREE.Mesh = undefined as unknown as THREE.Mesh;
  public renderer: THREE.WebGLRenderer =
    undefined as unknown as THREE.WebGLRenderer;
  constructor() {}

  public initService(container: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    // Add initialization code for your scene here
    // For example, you can set the background color:
    this.scene.background = new THREE.Color(0x000000);

    // Create a renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: container,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Create a camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

    // Create a geometry
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    this.cube = new THREE.Mesh(geometry, material);

    // Add the cube to the scene
    this.scene.add(this.cube);
    // Start the animation loop
    startAnimation(this);
  }
}

/** 애니메이션 함수 */
const startAnimation = function (scene: ScenegraphService) {
  const animationFrame = function () {
    // Rotate the cube
    scene.cube.rotation.x += 0.01;
    scene.cube.rotation.y += 0.01;

    // Render the scene with the camera
    scene.renderer.render(scene.scene, scene.camera);
    requestAnimationFrame(animationFrame);
  };
  animationFrame();
};
