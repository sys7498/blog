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
  constructor() {}

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
      },
    });
    this.sphere = new THREE.Mesh(geometry, this.material);
    //this.sphere.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI / 4);
    this.scene.add(this.sphere);
    startAnimation(this);
  }

  public onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  public destroyAnimation() {
    cancelAnimationFrame(this.animationID);
  }
}

/** 애니메이션 함수 */
const startAnimation = function (scene: ScenegraphService) {
  const animationFrame = function () {
    // Rotate the cube
    //scene.sphere.rotation.x += 0.01;
    //scene.sphere.rotation.y += 0.01;
    scene.material.uniforms['time'].value += 0.001;
    // Render the scene with the camera
    scene.renderer.render(scene.scene, scene.camera);
    scene.animationID = requestAnimationFrame(animationFrame);
  };
  animationFrame();
};
