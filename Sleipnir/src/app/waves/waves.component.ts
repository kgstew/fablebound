import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { NgClass } from '@angular/common';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import { fragmentShader, vertexShader } from './utils';

interface UniformsTypeAddition extends THREE.IUniform {
  type: string;
}

interface UniformsInterface {
  [uniform: string]: UniformsTypeAddition;
}

const CENTER_POINT = [window.innerWidth / 2, window.innerHeight / 2];
const positionToTrack = new THREE.Vector3(); // Vector that will track the animated point
const points = [CENTER_POINT, [400, 50], [225, 120]].map((point) => {
  const infoElem = document.createElement('pre');
  document.body.appendChild(infoElem);
  infoElem.className = 'info';
  infoElem.style.color = 'white';
  infoElem.style.left = `${point[0] + 10}px`;
  infoElem.style.top = `${point[1]}px`;
  return {
    point,
    infoElem,
  };
});

const DEFAULT_UNIFORMS = {
  u_time: { type: 'f', value: 1.0 },
  colorB: { type: 'vec3', value: new THREE.Color(0xfff000) },
  colorA: { type: 'vec3', value: new THREE.Color(0xffffff) },
  u_amplitude: {
    type: 'f',
    value: 1.0,
  },
  u_speed: {
    type: 'f',
    value: 1.0,
  },
  u_wavelength: {
    type: 'f',
    value: 1.0,
  },
};

const staticPlanePoints = [
  new THREE.Vector3(-32, 0, -32), // Bottom-left corner
  new THREE.Vector3(32, 0, -32), // Bottom-right corner
  new THREE.Vector3(-32, 0, 32), // Top-left corner
  new THREE.Vector3(32, 0, 32), // Top-right corner
];

const near = 1;
const far = 1000;
@Component({
  selector: 'app-waves',
  standalone: true,
  imports: [NgClass],
  templateUrl: './waves.component.html',
  styleUrl: './waves.component.css',
})
export class WavesComponent implements OnInit, AfterViewInit {
  canvasID: string = 'waves-box';
  private canvas!: HTMLElement;
  private fov: number = 36;
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    this.fov,
    window.innerWidth / window.innerHeight,
    near,
    far,
  );
  private clock: THREE.Clock = new THREE.Clock();
  private scene: THREE.Scene = new THREE.Scene();
  private stats: Stats = new Stats();
  private renderer!: THREE.WebGLRenderer;
  private uniforms: UniformsInterface = DEFAULT_UNIFORMS;
  private controls!: OrbitControls;
  private animatedPlaneMesh!: THREE.Mesh;
  private staticPlaneMesh!: THREE.Mesh;

  ngOnInit(): void {}

  initAnimatedPlaneMesh() {
    const planeGeometry = new THREE.PlaneGeometry(64, 64, 64, 64);
    const planeCustomMaterial = new THREE.ShaderMaterial({
      // note: this is where the magic happens
      uniforms: this.uniforms,
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
      wireframe: true,
    });
    this.animatedPlaneMesh = new THREE.Mesh(planeGeometry, planeCustomMaterial);
    this.scene.add(this.animatedPlaneMesh);
  }

  initStaticPlaneMesh() {
    const planeGeometry = new THREE.PlaneGeometry(64, 64, 64, 64);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    this.staticPlaneMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    this.scene.add(this.staticPlaneMesh);
  }

  initAmbientLight() {
    // ambient light which is for the whole scene
    // let ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    // ambientLight.castShadow = false;
    // this.scene.add(ambientLight);
    // // spot light which is illuminating the chart directly
    // let spotLight = new THREE.SpotLight(0xffffff, 0.55);
    // spotLight.castShadow = true;
    // spotLight.position.set(0, 80, 10);
    // this.scene.add(spotLight);
  }

  initScene() {
    this.camera.position.z = 100;
    this.canvas = document.getElementById(this.canvasID) as HTMLElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this.initAnimatedPlaneMesh();
    this.initStaticPlaneMesh();
    this.initAmbientLight();

    // if window resizes
    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
    this.controls.update();
    this.updateTracking();
  }

  updateTracking() {
    // Access the geometry of the animated mesh
    const geometry = this.animatedPlaneMesh.geometry;

    // Get the vertex to track (first vertex in this case)
    const vertexIndex = 0;
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(geometry.attributes['position'], vertexIndex);

    // Apply the same transformation as the shader (assuming a sine wave animation)
    const elapsedTime = this.uniforms['u_time'].value;
    const y_multiplier = (32.0 - vertex.y) / 8.0;
    // Example transformation similar to vertex shader logic
    console.log(32 - vertex.y);
    console.log(y_multiplier + elapsedTime * 5);
    vertex.z += Math.sin(elapsedTime * 0.5);
    console.log(vertex.z);

    // Apply the mesh's world transformations to the vertex
    vertex.applyMatrix4(this.animatedPlaneMesh.matrixWorld);

    // Update the positionToTrack to follow the animated vertex
    positionToTrack.copy(vertex);

    console.log('Tracked position:', positionToTrack);
  }

  render() {
    this.uniforms['u_time'].value += this.clock.getDelta();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  ngAfterViewInit() {
    this.initScene();
    this.animate();
  }
}
