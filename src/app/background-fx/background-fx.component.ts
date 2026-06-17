import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

interface BgSettings {
  enabled: boolean;
  count: number;
  speed: number;
  size: number;
  opacity: number;
  wireframe: boolean;
  colorful: boolean;
}

const DEFAULTS: BgSettings = {
  enabled: true,
  count: 16,
  speed: 1,
  size: 1,
  opacity: 0.35,
  wireframe: true,
  colorful: false,
};

interface Floater {
  mesh: THREE.Mesh;
  rot: THREE.Vector3; // 회전 속도
  vel: THREE.Vector3; // 이동 속도
}

@Component({
  selector: 'app-background-fx',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './background-fx.component.html',
  styleUrl: './background-fx.component.scss',
})
export class BackgroundFxComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  public panelOpen = false;
  public settings: BgSettings = this.load();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private geos: THREE.BufferGeometry[] = [];
  private floaters: Floater[] = [];
  private animId = 0;
  private readonly bound = { x: 16, y: 10, z: 9 };

  // 인터랙션 상태
  private mouse = new THREE.Vector2(0, 0); // 정규화 -1~1
  private boost = 0; // 클릭 시 일시적 가속

  ngAfterViewInit() {
    this.initThree();
    this.rebuild();
    this.animate();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointer);
    window.addEventListener('click', this.onClick);
  }

  ngOnDestroy() {
    cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointer);
    window.removeEventListener('click', this.onClick);
    this.renderer?.dispose();
  }

  private onPointer = (e: PointerEvent) => {
    this.mouse.set(
      (e.clientX / window.innerWidth) * 2 - 1,
      -((e.clientY / window.innerHeight) * 2 - 1)
    );
  };
  private onClick = () => {
    this.boost = 1; // 클릭하면 잠깐 빨라졌다 잦아듦
  };

  // ---- 설정 저장/복원 ----
  private load(): BgSettings {
    try {
      const s = localStorage.getItem('bgfx');
      if (s) return { ...DEFAULTS, ...JSON.parse(s) };
    } catch {}
    return { ...DEFAULTS };
  }
  private save() {
    try {
      localStorage.setItem('bgfx', JSON.stringify(this.settings));
    } catch {}
  }

  // ---- Three.js ----
  private initThree() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.z = 20;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvasRef.nativeElement,
      alpha: true,
      antialias: true,
    });
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.geos = [
      new THREE.BoxGeometry(1.4, 1.4, 1.4),
      new THREE.IcosahedronGeometry(1),
      new THREE.TorusGeometry(0.9, 0.32, 12, 28),
      new THREE.OctahedronGeometry(1.1),
      new THREE.ConeGeometry(1, 1.7, 18),
      new THREE.TetrahedronGeometry(1.3),
      new THREE.TorusKnotGeometry(0.7, 0.22, 80, 10),
      new THREE.DodecahedronGeometry(1),
    ];
  }

  private clearFloaters() {
    for (const f of this.floaters) {
      this.scene.remove(f.mesh);
      (f.mesh.material as THREE.Material).dispose();
    }
    this.floaters = [];
  }

  /** 도형 재생성 (개수/크기/색/와이어프레임 변경 시) */
  public rebuild() {
    if (!this.scene) return;
    this.clearFloaters();
    const n = this.settings.enabled ? Math.round(this.settings.count) : 0;
    for (let i = 0; i < n; i++) {
      const geo = this.geos[(Math.random() * this.geos.length) | 0];
      const color = this.settings.colorful
        ? new THREE.Color().setHSL(Math.random(), 0.55, 0.6)
        : new THREE.Color(0x9aa3b2);
      const mat = new THREE.MeshBasicMaterial({
        color,
        wireframe: this.settings.wireframe,
        transparent: true,
        opacity: this.settings.opacity,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(this.settings.size * (0.5 + Math.random()));
      mesh.position.set(
        this.rand(this.bound.x),
        this.rand(this.bound.y),
        this.rand(this.bound.z)
      );
      mesh.rotation.set(
        Math.random() * 6.28,
        Math.random() * 6.28,
        Math.random() * 6.28
      );
      this.floaters.push({
        mesh,
        rot: new THREE.Vector3(this.spin(), this.spin(), this.spin()),
        vel: new THREE.Vector3(this.drift(), this.drift(), this.drift() * 0.6),
      });
      this.scene.add(mesh);
    }
    this.save();
  }

  /** 투명도/와이어프레임만 즉시 반영 */
  public updateMaterials() {
    for (const f of this.floaters) {
      const m = f.mesh.material as THREE.MeshBasicMaterial;
      m.opacity = this.settings.opacity;
      m.wireframe = this.settings.wireframe;
    }
    this.save();
  }

  private animate = () => {
    this.animId = requestAnimationFrame(this.animate);

    // 클릭 가속 감쇠 + 속도
    this.boost *= 0.94;
    const sp = this.settings.speed * (1 + this.boost * 2.5);

    // 마우스 패럴럭스: 시점이 커서를 따라 움직여 깊이감
    this.camera.position.x += (this.mouse.x * 6 - this.camera.position.x) * 0.04;
    this.camera.position.y += (this.mouse.y * 4 - this.camera.position.y) * 0.04;
    this.camera.lookAt(0, 0, 0);
    // 씬 전체를 커서 쪽으로 살짝 기울임
    this.scene.rotation.y += (this.mouse.x * 0.25 - this.scene.rotation.y) * 0.03;
    this.scene.rotation.x += (-this.mouse.y * 0.18 - this.scene.rotation.x) * 0.03;

    const b = this.bound;
    for (const f of this.floaters) {
      f.mesh.rotation.x += f.rot.x * sp;
      f.mesh.rotation.y += f.rot.y * sp;
      f.mesh.rotation.z += f.rot.z * sp;
      f.mesh.position.x += f.vel.x * sp;
      f.mesh.position.y += f.vel.y * sp;
      f.mesh.position.z += f.vel.z * sp;
      // 경계 넘으면 반대편으로 순환
      if (f.mesh.position.x > b.x) f.mesh.position.x = -b.x;
      else if (f.mesh.position.x < -b.x) f.mesh.position.x = b.x;
      if (f.mesh.position.y > b.y) f.mesh.position.y = -b.y;
      else if (f.mesh.position.y < -b.y) f.mesh.position.y = b.y;
      if (f.mesh.position.z > b.z) f.mesh.position.z = -b.z;
      else if (f.mesh.position.z < -b.z) f.mesh.position.z = b.z;
    }
    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  private rand(r: number) {
    return (Math.random() * 2 - 1) * r;
  }
  private spin() {
    return (Math.random() - 0.5) * 0.01;
  }
  private drift() {
    return (Math.random() - 0.5) * 0.012;
  }

  // ---- 패널 입력 핸들러 ----
  public togglePanel() {
    this.panelOpen = !this.panelOpen;
  }
  public num(e: Event): number {
    return +(e.target as HTMLInputElement).value;
  }
  public checked(e: Event): boolean {
    return (e.target as HTMLInputElement).checked;
  }
  public setEnabled(e: Event) {
    this.settings.enabled = this.checked(e);
    this.rebuild();
  }
  public setCount(e: Event) {
    this.settings.count = this.num(e);
    this.rebuild();
  }
  public setSpeed(e: Event) {
    this.settings.speed = this.num(e);
    this.save();
  }
  public setSize(e: Event) {
    this.settings.size = this.num(e);
    this.rebuild();
  }
  public setOpacity(e: Event) {
    this.settings.opacity = this.num(e);
    this.updateMaterials();
  }
  public setWireframe(e: Event) {
    this.settings.wireframe = this.checked(e);
    this.updateMaterials();
  }
  public setColorful(e: Event) {
    this.settings.colorful = this.checked(e);
    this.rebuild();
  }
  public shuffle() {
    this.rebuild();
  }
  public reset() {
    this.settings = { ...DEFAULTS };
    this.rebuild();
  }
}
