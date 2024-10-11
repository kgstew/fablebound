import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as THREE from 'three';
import { NgClass } from '@angular/common';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';
import {
  fragmentShader,
  getVertexIndex,
  transformVertex,
  vertexShader,
} from './utils';
import GUI from 'lil-gui';

interface UniformsTypeAddition extends THREE.IUniform {
  type: string;
}

interface UniformsInterface {
  [uniform: string]: UniformsTypeAddition;
}

const SCALE = 8; // 1 segment is 72/SCALE inches. 9" at scale of 8
const getSegmentLengthForInches = (inches: number): number => {
  return Math.round(inches / (PLANE_HEIGHT_SEGMENTS / SCALE));
};
const PLANE_WIDTH = 72;
const PLANE_HEIGHT = PLANE_WIDTH;
const PLANE_WIDTH_SEGMENTS = 72;
const PLANE_HEIGHT_SEGMENTS = PLANE_WIDTH_SEGMENTS;
const PLANE_X_CENTER = PLANE_WIDTH_SEGMENTS / 2;
const PLANE_Y_CENTER = PLANE_HEIGHT_SEGMENTS / 2;

const centerPosition = new THREE.Vector3();
const portSternPosition = new THREE.Vector3();
const portBowPosition = new THREE.Vector3();
const starboardBowPosition = new THREE.Vector3();
const starboardSternPosition = new THREE.Vector3();

const INITIAL_SPEED = 1.0;
const INITIAL_AMPLITUDE = 1.0;
const INITIAL_WAVELENGTH = 1.0;
const INITAL_DIRECTION = 0.0;

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
  private uniforms: UniformsInterface = {
    u_time: { type: 'f', value: 1.0 },
    colorB: { type: 'vec3', value: new THREE.Color(0xfff000) },
    colorA: { type: 'vec3', value: new THREE.Color(0xffffff) },
    u_amplitude: {
      type: 'f',
      value: INITIAL_AMPLITUDE,
    },
    u_speed: {
      type: 'f',
      value: INITIAL_SPEED,
    },
    u_wavelength: {
      type: 'f',
      value: INITIAL_WAVELENGTH,
    },
    u_direction: {
      type: 'f',
      value: INITAL_DIRECTION,
    },
  };
  private planeGeometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(
    PLANE_WIDTH,
    PLANE_HEIGHT,
    PLANE_WIDTH_SEGMENTS,
    PLANE_HEIGHT_SEGMENTS,
  );
  private controls!: OrbitControls;
  private animatedPlaneMesh!: THREE.Mesh;
  private staticPlaneMesh!: THREE.Mesh;
  private shipVertices!: { vertex: THREE.Vector3; sphere: THREE.Mesh }[];
  private animationHandle!: number;

  ngOnInit(): void {}

  initAnimatedPlaneMesh() {
    const planeCustomMaterial = new THREE.ShaderMaterial({
      // note: this is where the magic happens
      uniforms: this.uniforms,
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
      wireframe: true,
    });
    this.animatedPlaneMesh = new THREE.Mesh(
      this.planeGeometry,
      planeCustomMaterial,
    );
    this.scene.add(this.animatedPlaneMesh);
  }

  initStaticPlaneMesh() {
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
    });

    this.staticPlaneMesh = new THREE.Mesh(this.planeGeometry, planeMaterial);
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

  initGui() {
    const gui = new GUI();
    const obj = {
      amplitude: INITIAL_AMPLITUDE,
      speed: INITIAL_SPEED,
      wavelength: INITIAL_WAVELENGTH,
      direction: INITAL_DIRECTION,
      pause: () => {
        this.controls.autoRotate = false;
        window.cancelAnimationFrame(this.animationHandle);
      },
    };

    gui.add(obj, 'amplitude', 0, 4, 1).onChange((value: number) => {
      this.uniforms['u_amplitude'].value = parseFloat(value.toString());
    }); // min, max, step
    gui.add(obj, 'wavelength', 0, 16, 0.5).onChange((value: number) => {
      this.uniforms['u_wavelength'].value = parseFloat(value.toString());
    }); // min, max, step
    gui.add(obj, 'speed', 0, 4, 0.1).onChange((value: number) => {
      this.uniforms['u_speed'].value = parseFloat(value.toString());
    }); // min, max, step
    gui.add(obj, 'direction', 0, 360, 0.1).onChange((value: number) => {
      this.uniforms['u_direction'].value = parseFloat(value.toString());
    }); // min, max, step
    gui.add(obj, 'pause'); // button
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
    this.initGui();

    // if window resizes
    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  addVertexAtPosition(
    x: number,
    y: number,
    color?: THREE.ColorRepresentation,
    name?: string,
  ): { vertex: THREE.Vector3; sphere: THREE.Mesh } {
    const vertexIndex = getVertexIndex(
      PLANE_X_CENTER + x,
      PLANE_Y_CENTER + y,
      PLANE_WIDTH_SEGMENTS,
      PLANE_HEIGHT_SEGMENTS,
    );
    const vertex = new THREE.Vector3();
    vertex.fromBufferAttribute(
      this.animatedPlaneMesh.geometry.attributes['position'],
      vertexIndex,
    );

    // Apply any transformations if necessary
    vertex.applyMatrix4(this.animatedPlaneMesh.matrixWorld);
    const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: color || THREE.Color.NAMES.darkred,
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.name = name || '';

    sphere.position.copy(vertex);
    this.scene.add(sphere);

    return { vertex, sphere };
  }

  setShipVertexPositions(): void {
    const centerVertex = this.addVertexAtPosition(
      0,
      0,
      THREE.Color.NAMES.goldenrod,
      'center',
    );
    const portSternVertex = this.addVertexAtPosition(
      -getSegmentLengthForInches(36),
      getSegmentLengthForInches(7 * 12),
      THREE.Color.NAMES.darkred,
      'portStern',
    );
    const portBowVertex = this.addVertexAtPosition(
      -getSegmentLengthForInches(36),
      -getSegmentLengthForInches(7 * 12),
      THREE.Color.NAMES.darkred,
      'portBow',
    );
    const starboardSternVertex = this.addVertexAtPosition(
      getSegmentLengthForInches(36),
      getSegmentLengthForInches(7 * 12),
      THREE.Color.NAMES.darkred,
      'starboardStern',
    );
    const starboardBowVertex = this.addVertexAtPosition(
      getSegmentLengthForInches(36),
      -getSegmentLengthForInches(7 * 12),
      THREE.Color.NAMES.darkred,
      'starboardBow',
    );

    this.shipVertices = [
      centerVertex,
      portSternVertex,
      portBowVertex,
      starboardBowVertex,
      starboardSternVertex,
    ];
  }

  updateTracking() {
    const wavelength = this.uniforms['u_wavelength'].value;
    const amplitude = this.uniforms['u_amplitude'].value;
    const speed = this.uniforms['u_speed'].value;
    const time = this.uniforms['u_time'].value;
    const direction = this.uniforms['u_direction'].value;

    // Apply the same transformation as the shader (assuming a sine wave animation)
    this.shipVertices.forEach((position) => {
      if (position.sphere.name !== 'center') {
        position.vertex = transformVertex(
          position.vertex,
          time,
          speed,
          wavelength,
          amplitude,
          direction,
        );

        position.sphere.position.set(
          position.vertex.x,
          position.vertex.y,
          position.vertex.z,
        );
      }
    });

    console.log('number of vertices', this.shipVertices);

    // console.log(this.shipVertices[0].z);
    console.log(this.shipVertices[1].vertex.z);
    console.log(this.shipVertices[2].vertex.z);
    console.log(this.shipVertices[3].vertex.z);
    console.log(this.shipVertices[4].vertex.z);
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

  animate() {
    this.animationHandle = window.requestAnimationFrame(
      this.animate.bind(this),
    );
    this.render();
    this.stats.update();
    this.controls.update();
    this.updateTracking();
  }

  ngAfterViewInit() {
    this.initScene();
    this.setShipVertexPositions();
    this.animate();
  }
}
