import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js";

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  },
);

document.querySelectorAll(".reveal:not(.reveal--hero)").forEach((element) => {
  observer.observe(element);
});

const locationStops = [
  {
    title: "Starting from home",
    address: "1003 Cerrito Way, Palo Alto, CA 94306",
    note: "Starting the day in Palo Alto before heading out together.",
    image: "./public/locations/palo-alto-university-avenue.jpg",
    alt: "Palo Alto University Avenue streetscape",
  },
  {
    title: "Filoli Gardens",
    address: "86 Canada Road, Woodside, CA 94062",
    note: "A dreamy garden stop for wandering paths and spring photos.",
    image: "./public/locations/filoli.jpg",
    alt: "Filoli garden view",
  },
  {
    title: "Oceano Hotel & Spa",
    address: "280 Capistrano Road, Half Moon Bay, CA 94019",
    note: "Harbor-side check-in and the reset point between beach and dinner.",
    image: "./public/locations/hotel.webp",
    alt: "Oceano Hotel exterior",
  },
  {
    title: "Downtown Half Moon Bay",
    address: "Main Street, Half Moon Bay, CA 94019",
    note: "Main Street charm, lunch, and strolling through town.",
    image: "./public/locations/downtown.jpg",
    alt: "Downtown Half Moon Bay street view",
  },
  {
    title: "Francis Beach",
    address: "Half Moon Bay State Beach, CA 94019",
    note: "Coastal air, beach walking, and the prettiest part of the afternoon.",
    image: "./public/locations/beach.jpg",
    alt: "Half Moon Bay beach",
  },
  {
    title: "Sunset at the beach",
    address: "Francis Beach, Half Moon Bay, CA 94019",
    note: "Golden hour at the shoreline for photos and sunset views.",
    image: "./public/locations/beach.jpg",
    alt: "Half Moon Bay sunset beach",
  },
  {
    title: "Back to the hotel",
    address: "Oceano Hotel & Spa, 280 Capistrano Road, Half Moon Bay, CA 94019",
    note: "A quick refresh before the evening celebration.",
    image: "./public/locations/hotel.webp",
    alt: "Oceano Hotel exterior",
  },
  {
    title: "Dinner at Fattoria e Mare",
    address: "315 Main Street, Half Moon Bay, CA 94019",
    note: "A polished dinner stop to close the day in style.",
    image: "./public/locations/dinner.jpg",
    alt: "Fattoria e Mare dining photo",
  },
  {
    title: "Stay at hotel or head home",
    address: "Half Moon Bay / Palo Alto",
    note: "The sweet ending: a cozy overnight or the drive back home.",
    image: "./public/locations/hotel.webp",
    alt: "Oceano Hotel exterior",
  },
];

const scheduleItems = Array.from(
  document.querySelectorAll(".timeline__item[data-stop-index]"),
);
const locationTitle = document.querySelector("[data-location-title]");
const locationAddress = document.querySelector("[data-location-address]");
const locationNote = document.querySelector("[data-location-note]");
const locationImage = document.querySelector("[data-location-image]");

if (
  locationTitle &&
  locationAddress &&
  locationNote &&
  locationImage &&
  scheduleItems.length
) {
  const updateLocationPanel = (activeIndex) => {
    const safeIndex = Math.max(0, Math.min(activeIndex, locationStops.length - 1));
    const stop = locationStops[safeIndex];

    locationTitle.textContent = stop.title;
    locationAddress.textContent = stop.address;
    locationNote.textContent = stop.note;
    locationImage.classList.add("is-changing");
    window.setTimeout(() => {
      locationImage.src = stop.image;
      locationImage.alt = stop.alt;
      locationImage.classList.remove("is-changing");
    }, 120);

    scheduleItems.forEach((item, itemIndex) => {
      item.classList.toggle("is-route-active", itemIndex === safeIndex);
    });
  };

  scheduleItems.forEach((item, index) => {
    const activate = () => updateLocationPanel(index);
    item.addEventListener("mouseenter", activate);
    item.addEventListener("focusin", activate);
  });

  updateLocationPanel(0);
}

const hero = document.querySelector(".hero");
const canvas = document.querySelector(".hero__canvas");
const audioToggle = document.querySelector(".audio-toggle");
const heroAudio = document.querySelector(".hero-audio");

if (hero && canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  camera.position.z = 12;

  const geometry = new THREE.BufferGeometry();
  const count = 900;
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);

  for (let index = 0; index < count; index += 1) {
    const stride = index * 3;
    positions[stride] = (Math.random() - 0.5) * 24;
    positions[stride + 1] = (Math.random() - 0.5) * 14;
    positions[stride + 2] = (Math.random() - 0.5) * 10;
    scales[index] = Math.random();
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#f6d5dd") },
      uColorB: { value: new THREE.Color("#fff3dd") },
    },
    vertexShader: `
      attribute float aScale;
      uniform float uTime;
      varying float vMix;

      void main() {
        vec3 transformed = position;
        transformed.y += sin(uTime * 0.35 + position.x * 0.45) * 0.55 * aScale;
        transformed.x += cos(uTime * 0.25 + position.y * 0.6) * 0.25 * aScale;
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = (5.0 + 12.0 * aScale) * (18.0 / -mvPosition.z);
        vMix = aScale;
      }
    `,
    fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vMix;

      void main() {
        float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
        float alpha = smoothstep(0.45, 0.0, distanceToCenter);
        vec3 color = mix(uColorA, uColorB, vMix);
        gl_FragColor = vec4(color, alpha * 0.5);
      }
    `,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  const clock = new THREE.Clock();

  const resize = () => {
    const { clientWidth, clientHeight } = hero;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
  };

  const animate = () => {
    material.uniforms.uTime.value = clock.getElapsedTime();
    particles.rotation.z += 0.0009;
    particles.rotation.y += 0.0006;
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  resize();
  animate();
  window.addEventListener("resize", resize);
}

if (audioToggle && heroAudio instanceof HTMLAudioElement) {
  let isPlaying = false;
  heroAudio.volume = 0.45;

  const setButtonState = (playing, label) => {
    audioToggle.dataset.state = playing ? "playing" : "paused";
    audioToggle.setAttribute("aria-pressed", String(playing));
    audioToggle.textContent = label;
  };

  const stopMusic = () => {
    isPlaying = false;
    heroAudio.pause();
    setButtonState(false, "Play piano");
  };

  const startMusic = async () => {
    await heroAudio.play();
    isPlaying = true;
    setButtonState(true, "Pause piano");
  };

  const tryAutoplay = async () => {
    try {
      await startMusic();
    } catch {
      setButtonState(false, "Tap for piano");
    }
  };

  audioToggle.addEventListener("click", async () => {
    try {
      if (isPlaying) {
        stopMusic();
      } else {
        await startMusic();
      }
    } catch {
      setButtonState(false, "Tap for piano");
    }
  });

  setButtonState(false, "Loading piano");
  tryAutoplay();
}
