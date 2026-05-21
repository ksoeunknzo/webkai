import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const RED = 0xe30613;
const LINE = 0x10141a;

export function initHeroWireframe(container, options = {}) {
  if (!container) {
    return null;
  }

  const reduceMotion = options.reduceMotion ?? false;
  const maxPixelRatio = options.maxPixelRatio ?? 1.75;
  const scene = new THREE.Scene();
  const tiltGroup = new THREE.Group();
  const spinGroup = new THREE.Group();
  scene.add(tiltGroup);
  tiltGroup.add(spinGroup);

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
  camera.position.set(0, 0, 3.35);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = "hero-wireframe-canvas";
  container.appendChild(renderer.domElement);

  const geometry = new THREE.IcosahedronGeometry(1, 2);
  const edges = new THREE.EdgesGeometry(geometry, 12);
  const lines = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({
      color: LINE,
      transparent: true,
      opacity: 0.72,
    }),
  );
  spinGroup.add(lines);

  const glowMaterial = new THREE.MeshBasicMaterial({
    color: RED,
    transparent: true,
    opacity: 0.92,
  });
  const glowPositions = [0, 18, 36, 54, 72, 90, 108, 126];
  const position = geometry.attributes.position;

  glowPositions.forEach((index) => {
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), glowMaterial);
    glow.position.fromBufferAttribute(position, index).normalize().multiplyScalar(1.02);
    spinGroup.add(glow);
  });

  let width = 0;
  let height = 0;
  let frameId = 0;
  let isVisible = true;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  const resize = () => {
    width = container.clientWidth;
    height = container.clientHeight;

    if (!width || !height) {
      return;
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxPixelRatio));
    renderer.setSize(width, height, false);
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      isVisible = entries.some((entry) => entry.isIntersecting);
    },
    { threshold: 0.08 },
  );
  visibilityObserver.observe(container);

  const onPointerMove = (event) => {
    const rect = container.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return;
    }

    const normalizedX = (event.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
    targetTiltY = normalizedX * 0.34;
    targetTiltX = normalizedY * -0.26;
  };

  const onPointerLeave = () => {
    targetTiltX = 0;
    targetTiltY = 0;
  };

  if (!reduceMotion) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });
  }

  const animate = () => {
    frameId = window.requestAnimationFrame(animate);

    if (!isVisible) {
      return;
    }

    if (!reduceMotion) {
      spinGroup.rotation.y += 0.0022;
      spinGroup.rotation.x += 0.0008;
      currentTiltX += (targetTiltX - currentTiltX) * 0.06;
      currentTiltY += (targetTiltY - currentTiltY) * 0.06;
      tiltGroup.rotation.x = currentTiltX;
      tiltGroup.rotation.y = currentTiltY;
    }

    renderer.render(scene, camera);
  };

  animate();

  return {
    destroy() {
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      geometry.dispose();
      edges.dispose();
      lines.geometry.dispose();
      lines.material.dispose();
      glowMaterial.dispose();
      spinGroup.children.forEach((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
