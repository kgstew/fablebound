import {
  AfterViewInit,
  Component,
  Inject,
  InjectionToken,
  OnInit,
} from '@angular/core';
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

const dataArray = new Uint8Array();

const DEFAULT_UNIFORMS = {
  u_time: { type: 'f', value: 1.0 },
  colorB: { type: 'vec3', value: new THREE.Color(0xfff000) },
  colorA: { type: 'vec3', value: new THREE.Color(0xffffff) },
  u_amplitude: {
    type: 'f',
    value: 3.0,
  },
  u_data_arr: {
    type: 'float[64]',
    value: dataArray,
  },
};

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
    1,
    1000,
  );
  private clock: THREE.Clock = new THREE.Clock();
  private scene: THREE.Scene = new THREE.Scene();
  private stats: Stats = new Stats();
  private renderer!: THREE.WebGLRenderer;
  private uniforms: UniformsInterface = DEFAULT_UNIFORMS;
  private controls!: OrbitControls;
  private framebuffer!: THREE.WebGLRenderTarget;
  public shouldRenderVisualization: boolean = true;
  private rayCaster!: THREE.Raycaster;

  ngOnInit(): void {}

  initPlaneMesh() {
    // note: set up plane mesh and add it to the scene
    const planeGeometry = new THREE.PlaneGeometry(64, 64, 64, 64);
    // const planeMaterial = new THREE.MeshNormalMaterial({ wireframe: true });
    // const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    const planeCustomMaterial = new THREE.ShaderMaterial({
      // note: this is where the magic happens
      uniforms: this.uniforms,
      vertexShader: vertexShader(),
      fragmentShader: fragmentShader(),
      wireframe: true,
    });
    const planeMesh = new THREE.Mesh(planeGeometry, planeCustomMaterial);
    planeMesh.rotation.x = -Math.PI / 2 + Math.PI / 4;
    planeMesh.scale.x = 2;
    planeMesh.scale.y = 2;
    planeMesh.scale.z = 2;
    planeMesh.position.y = 24;
    this.scene.add(planeMesh);
  }

  initAmbientLight() {
    // ambient light which is for the whole scene
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    ambientLight.castShadow = false;
    this.scene.add(ambientLight);

    // spot light which is illuminating the chart directly
    let spotLight = new THREE.SpotLight(0xffffff, 0.55);
    spotLight.castShadow = true;
    spotLight.position.set(0, 80, 10);
    this.scene.add(spotLight);
  }

  initFrameBuffer() {
    /**
     * Create a framebuffer to inspect the rendered pixels
     * This allows the gathering of pixel values to convert the amplitude
     * of a pixel to an actual position
     */

    this.framebuffer = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight,
    );
    this.framebuffer.texture.format = THREE.RGBAFormat;
    this.framebuffer.texture.minFilter = THREE.LinearFilter;
    this.framebuffer.texture.magFilter = THREE.LinearFilter;
    this.framebuffer.texture.generateMipmaps = false;
    this.framebuffer.stencilBuffer = false;
    this.framebuffer.depthBuffer = true;

    // Attach a depth texture
    this.framebuffer.depthTexture = new THREE.DepthTexture(
      window.innerWidth,
      window.innerHeight,
    );
    this.framebuffer.depthTexture.type = THREE.FloatType;
    this.framebuffer.depthTexture.format = THREE.DepthFormat;
    this.framebuffer.depthTexture.minFilter = THREE.NearestFilter;
    this.framebuffer.depthTexture.magFilter = THREE.NearestFilter;
  }

  initScene() {
    this.camera.position.z = 196;
    this.canvas = document.getElementById(this.canvasID) as HTMLElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      depth: true,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this.initPlaneMesh();
    this.initAmbientLight();
    this.initFrameBuffer();

    // if window resizes
    window.addEventListener('resize', () => this.onWindowResize(), false);
    this.rayCaster = new THREE.Raycaster();
  }

  animate() {
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
    this.controls.update();
  }

  toggleVisualization() {
    this.shouldRenderVisualization = !this.shouldRenderVisualization;
  }

  renderForPositionBuffer() {
    this.renderer.setRenderTarget(this.framebuffer);
    this.renderer.render(this.scene, this.camera); // Make sure you render to the framebuffer first

    const x = Math.floor(window.innerWidth / 2);
    const y = Math.floor(window.innerHeight / 2);
    const zBuffer = new Float32Array(16); // Array to store z-values of 4 pixels
    // Read depth values (z-values) from the framebuffer
    this.renderer.readRenderTargetPixels(
      this.framebuffer,
      x - 1,
      y - 1,
      1,
      1,
      zBuffer,
    );

    console.log('Z-values of the 4 center pixels:', zBuffer);
  }

  renderVisualization() {
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    this.uniforms['u_time'].value += this.clock.getDelta();
    if (this.shouldRenderVisualization) {
      this.renderVisualization();
    } else {
      this.renderForPositionBuffer();
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private startRenderingLoop() {
    let component: WavesComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.animate();
      component.renderer.render(component.scene, component.camera);
    })();
  }

  ngAfterViewInit() {
    this.initScene();
    this.animate();
    this.startRenderingLoop();
  }
}
