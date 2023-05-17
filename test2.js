let isMusicPlaying = false;

// Create a renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Resize the renderer when the window size changes
function onWindowResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// Create a scene
const scene = new THREE.Scene();

const origin = new THREE.Object3D();
scene.add(origin);


// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const numSpheres = 40; // Change this to adjust the number of spheres
const spheres = [];

var geometry = new THREE.SphereGeometry(1, 128, 128);
for (let i = 0; i < numSpheres; i++) {
  
  const material = new THREE.MeshPhysicalMaterial({ color: Math.random() * 0xffffff });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.frustumCulled = true;

  //Generate a non-overlapping position and radius
    do {
      sphere.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
      sphere.radius = Math.random() + 0.5;
    } while (spheres.some(s => s.position.distanceTo(sphere.position) < s.radius + sphere.radius));
  origin.add(sphere);
  spheres.push(sphere);
}


// Add orbit controls to the camera
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.minDistance = 2;
controls.maxDistance = 40;
controls.enablePan = false; 

// Add an ambient light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, .75);
scene.add(ambientLight);

// Add a directional light to the scene
const directionalLight = new THREE.DirectionalLight(0xffffff, .5);
directionalLight.position.set(0, 1, 0);
scene.add(directionalLight);

// Add a directional light to the scene
const directionalLight2 = new THREE.DirectionalLight(0xffffff, .5);
directionalLight2.position.set(0, -1, 0);
scene.add(directionalLight2);


geometry = new THREE.SphereGeometry(0.25, 70,70);
const material = new THREE.MeshStandardMaterial( {color: 0xffffff});

function addStar() {
  
  const star = new THREE.Mesh( geometry, material);
  star.frustumCulled = true;
  const [x, y ,z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  star.position.set(x,y,z);
  scene.add(star);

}
const stars = [];

for (let i = 0; i < 200; i++) {
  addStar();
  //stars.push(star);
}

// Enable shadow map rendering
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Add shadow casting and receiving properties to the spheres
spheres.forEach(sphere => {
  sphere.castShadow = true;
  sphere.receiveShadow = true;
});

// Add shadow casting properties to the directional light
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;



// Create the post-processing pass for bloom effect
const renderScene = new THREE.RenderPass(scene, camera);
const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0.2;
bloomPass.strength = 1;
bloomPass.radius = 1;

// Add the post-processing passes to the composer
const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// Add an event listener to the renderer's dom element
renderer.domElement.addEventListener('click', (event) => {
    // Calculate the mouse position in normalized device coordinates
    // (-1 to +1) for both components
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Use raycasting to determine which object was clicked on
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres);
    
    if (intersects.length > 0) {
        // Change the color of the first intersected object
        intersects[0].object.material.color.set(Math.random() * 0xffffff);
    }
});



// function updateOriginRotation() {
//   origin.rotation.x += 0.01;
//   origin.rotation.y += 0.01;
//   origin.rotation.z += 0.01;
// }
// function updateOriginRotation() {
//   origin.rotation.x += 0.01;
//   origin.rotation.y += 0.01;
//   origin.rotation.z += 0.01;

//   analyser.getByteFrequencyData(frequencyData);

//   // Calculate the average bass level
//   let bassLevel = 0;
//   for (let i = 0; i < frequencyData.length; i++) {
//     bassLevel += frequencyData[i];
//   }
//   bassLevel /= frequencyData.length;

//   // Map the bass level to the distance from the origin
//   const distance = mapRange(bassLevel, 0, 255, 0, 15);
//   origin.position.set(0, 0, +distance);
// }
function updateOriginRotation() {
  origin.rotation.x += 0.01;
  origin.rotation.y += 0.01;
  origin.rotation.z += 0.01;

  analyser.getByteFrequencyData(frequencyData);

  // Calculate the average bass level
  let bassLevel = 0;
  for (let i = 0; i < frequencyData.length; i++) {
    bassLevel += frequencyData[i];
  }
  bassLevel /= frequencyData.length;

  // Map the bass level to the distance from the origin
  const distance = mapRange(bassLevel, 0, 255, 5, 45);

  // Move each sphere away from the origin based on its position
  spheres.forEach((sphere, index) => {
    const position = sphere.position.clone();
    position.normalize().multiplyScalar(distance);
    sphere.position.copy(position);
  });
}


const spaceTexture = new THREE.TextureLoader().load('space5.png');
scene.background = spaceTexture;


// Rest of the code...

// Get the background music element
const backgroundMusic = document.getElementById('backgroundMusic');
backgroundMusic.volume = 0.5; // Set the initial volume (0.0 to 1.0)

// Function to play or pause the background music
function toggleBackgroundMusic() {
  if (audioElement.paused) {
    audioElement.play();
    isMusicPlaying = true;
  } else {
    audioElement.pause();
    isMusicPlaying = false;
  }
}


// Function to control the volume of the background music
function setVolume(volume) {
  backgroundMusic.volume = volume;
}

// Add event listeners to control the background music
document.addEventListener('keydown', function(event) {
  // Toggle background music with the spacebar
  if (event.code === 'Space') {
    toggleBackgroundMusic();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  // Get the slider element from the HTML
  const volumeSlider = document.getElementById('volumeSlider');

  // Listen for changes in the slider value
  volumeSlider.addEventListener('input', function () {
    // Update the volume based on the slider value
    const sliderValue = parseFloat(volumeSlider.value);
    setVolume(sliderValue);
  });
});

// Create an AudioContext
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioStarted = false;

// Load the audio file
const audioElement = document.getElementById('backgroundMusic');
const audioSource = audioContext.createMediaElementSource(audioElement);

// Create an analyser node
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;

// Connect the audio source to the analyser
audioSource.connect(analyser);

// Connect the analyser to the destination (output)
analyser.connect(audioContext.destination);

// Create a Uint8Array to hold the frequency data
const frequencyData = new Uint8Array(analyser.frequencyBinCount);

// Utility function to map a value from one range to another
function mapRange(value, inputMin, inputMax, outputMin, outputMax) {
  return ((value - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin) + outputMin;
}

// Function to update the bloom intensity based on the bass level
function updateBloomIntensity() {
  if (isMusicPlaying) {
    analyser.getByteFrequencyData(frequencyData);

    // Calculate the average bass level
    let bassLevel = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      bassLevel += frequencyData[i];
    }
    bassLevel /= frequencyData.length;

    // Map the bass level to the bloom intensity value
    const bloomIntensity = mapRange(bassLevel, 0, 255, 0, 5);

    // Update the bloom intensity value
    bloomPass.strength = bloomIntensity;
  }
}
audioElement.addEventListener('ended', function() {
  isMusicPlaying = false;
});



// Add an event listener to the renderer's dom element
renderer.domElement.addEventListener('click', (event) => {
  // Start the audio context on the first user gesture
  if (!audioStarted) {
    audioContext.resume().then(() => {
      audioStarted = true;
      toggleBackgroundMusic();
    });
  }
});


// Render the scene with post-processing
function animate() {
  requestAnimationFrame(animate);
  updateOriginRotation();
  composer.render();
  controls.update();
  updateBloomIntensity();
  //addStar();
}

document.addEventListener('DOMContentLoaded', function() {
  // Get the slider element from the HTML
  const bloomSlider = document.getElementById('bloomSlider');

  // Listen for changes in the slider value
  bloomSlider.addEventListener('input', function () {
    // Update the bloom intensity value based on the slider value
    const sliderValue = parseFloat(bloomSlider.value);
    bloomPass.strength = sliderValue;
  });
});

animate();





