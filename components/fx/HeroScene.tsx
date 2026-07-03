"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Vanilla Three.js hero: a slowly rotating wireframe geodesic sphere wrapped in a
 * particle shell, tinted with the active theme's neon color. Vanilla (not R3F)
 * to guarantee React 19 compatibility and keep the dependency surface small.
 * Renders a single static frame for reduced-motion users.
 */
export function HeroScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const neonVar = getComputedStyle(document.documentElement)
      .getPropertyValue("--neon")
      .trim()
      .split(/\s+/)
      .map(Number);
    const color = new THREE.Color(
      (neonVar[0] ?? 0) / 255,
      (neonVar[1] ?? 255) / 255,
      (neonVar[2] ?? 128) / 255
    );

    // Wireframe geodesic sphere.
    const geo = new THREE.IcosahedronGeometry(1.6, 2);
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.5 })
    );
    scene.add(wire);

    // Particle shell.
    const count = 900;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2.1 + Math.random() * 0.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color,
        size: 0.02,
        transparent: true,
        opacity: 0.8,
      })
    );
    scene.add(points);

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.55, 1),
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.08 })
    );
    scene.add(inner);

    function renderOnce() {
      renderer.render(scene, camera);
    }

    let raf = 0;
    function animate() {
      raf = requestAnimationFrame(animate);
      wire.rotation.y += 0.0016;
      wire.rotation.x += 0.0008;
      points.rotation.y -= 0.0009;
      inner.rotation.y -= 0.002;
      renderOnce();
    }

    if (prefersReduced) renderOnce();
    else raf = requestAnimationFrame(animate);

    function onResize() {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      geo.dispose();
      pGeo.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" aria-hidden />;
}
