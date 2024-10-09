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
  u_amplitude: { type: 'f', value: 3.0 },
  u_data_arr: { type: 'float[64', value: dataArray },
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
  private uniforms!: UniformsInterface;
  private controls!: OrbitControls;

  ngOnInit(): void {}

  initScene() {
    this.camera.position.z = 196;
    this.uniforms = {
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

    // specify a canvas which is already created in the HTML file and tagged by an id
    // aliasing enabled
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

    // ambient light which is for the whole scene
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    ambientLight.castShadow = false;
    this.scene.add(ambientLight);

    // spot light which is illuminating the chart directly
    let spotLight = new THREE.SpotLight(0xffffff, 0.55);
    spotLight.castShadow = true;
    spotLight.position.set(0, 80, 10);
    this.scene.add(spotLight);

    // if window resizes
    window.addEventListener('resize', () => this.onWindowResize(), false);
  }

  animate() {
    // NOTE: Window is implied.
    // requestAnimationFrame(this.animate.bind(this));
    window.requestAnimationFrame(this.animate.bind(this));
    this.render();
    this.stats.update();
    this.controls.update();
  }

  generateRandomUint8Array = (length: number): Uint8Array => {
    const array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256); // Generate a random number between 0 and 255
    }
    return array;
  };

  render() {
    this.uniforms['u_time'].value += this.clock.getDelta();
    this.uniforms['u_data_arr'].value = this.generateRandomUint8Array(4096);
    this.renderer.render(this.scene, this.camera);
    // console.log(this.uniforms['u_time'].value);
    // console.log(this.uniforms['u_data_arr'].value);
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
    planeMesh.position.y = 8;
    this.scene.add(planeMesh);
    this.startRenderingLoop();
  }
}
