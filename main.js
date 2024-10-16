import "./style.css";
import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from "gsap";
import { RGBELoader } from "three/examples/jsm/Addons.js";
import { texture } from "three/webgpu";


// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);



// Set up camera position
camera.position.z = 9;

let scrollCount = 0;


// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Throttled wheel event handler
const handleWheel = throttle((event) => {
  // Your wheel event logic here


  const direction = event.deltaY > 0 ? "down" : "up";

  scrollCount = (scrollCount + 1) % 4;
  console.log(scrollCount);


  const headings = document.querySelectorAll(".heading");

  gsap.to(headings, {
    duration: 1,
    y: `-=${100}%`,
    ease: "power2.inOut",

  });


  gsap.to(spheres.rotation, {
    duration: 1,
    y: `-=${Math.PI / 2}%`,
    ease: "power2.inOut",
  })

  if (scrollCount === 0) {
    gsap.to(headings, {
      duration: 1,
      y: `0`,
      ease: "power2.inOut"
    });
  }



}, 2000);

// Add the throttled event listener
window.addEventListener('wheel', handleWheel);




// Load HDRI environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.background = texture;
    scene.environment = texture;

    // Update materials to use environment mapping
    spheres.traverse((child) => {
      if (child.isMesh) {
        child.material.envMap = texture;
        child.material.needsUpdate = true;
      }
    });

    // Adjust renderer to work well with HDRI
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
  }
);



const radius = 1.3;
const segments = 64;
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]
const textures = [
  "./csilla/color.png",
  "./earth/map.jpg",
  "./venus/map.jpg",
  "./volcanic/color.png",
];

const spheres = new THREE.Group();



// Create a big sphere for the starry background
const starSphereRadius = 50; // Adjust this value to make the sphere larger or smaller
const starSphereSegments = 64;
const starSphereGeometry = new THREE.SphereGeometry(starSphereRadius, starSphereSegments, starSphereSegments);

// Load the star texture
const starTextureLoader = new THREE.TextureLoader();
const starTexture = starTextureLoader.load("./stars.jpg", (texture) => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.1, 1.1); // Adjust repeat to control star density
});
starTexture.colorSpace = THREE.SRGBColorSpace;


// Create a material for the star sphere
const starSphereMaterial = new THREE.MeshStandardMaterial({
  map: starTexture,
  side: THREE.BackSide, // Render the inside of the sphere
});

// Create the star sphere mesh
const starSphere = new THREE.Mesh(starSphereGeometry, starSphereMaterial);

// Add the star sphere to the scene
scene.add(starSphere);



const spheresMesh = [];




for (let i = 0; i < 4; i++) {
  // Load texture
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i], (texture) => {
    // Optional: set texture properties
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    // Apply texture to the material
    material.map = texture;
    material.needsUpdate = true;
  });

  texture.colorSpace = THREE.SRGBColorSpace;


  // Create a sphere geometry
  const geometry = new THREE.SphereGeometry(radius, segments, segments);

  // Create a basic material
  const material = new THREE.MeshStandardMaterial({ map: texture });

  // Create a mesh with the geometry and material
  const sphere = new THREE.Mesh(geometry, material);

  spheresMesh.push(sphere);


  // Position the sphere randomly



  const angle = (i / 4) * (Math.PI * 2);
  const orbitRadius = 4.5;
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);



  // Add the sphere to the scene
  spheres.add(sphere);
}
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);


// Set up OrbitControls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
// controls.dampingFactor = 0.05;

// Handle window resize



window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


// setInterval(() => {


// gsap.to(spheres.rotation, {
//   y: `+=${Math.PI / 2}`,
//   duration: 2,
//   ease: "expo.easInOut",
// });

// }, 2500)



// Animation loop


const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  for(let i = 0; i < spheresMesh.length; i++) {
    const sphere = spheresMesh[i];
    sphere.rotation.y = clock.getElapsedTime() * 0.09;
  }
  // cube.rotation.y += 0.003
  // controls.update();
  renderer.render(scene, camera);
}

animate();
