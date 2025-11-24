// components/SpaceBackground.tsx
'use client';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import Lenis from 'lenis';

export default function SpaceBackground() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);
    mount.appendChild(renderer.domElement);

    // Particles
    const particlesCount = 2000;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Mouse interaction
    const mouse = { x: 0, y: 0 };
    const mouseHandler = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', mouseHandler);

    // Smooth scroll with Lenis
    const lenis = new Lenis();
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Animation loop
    const animate = () => {
      particles.rotation.y += 0.0005;

      gsap.to(camera.position, {
        x: mouse.x * 0.5,
        y: mouse.y * 0.5,
        duration: 2,
        ease: 'power2.out',
      });

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', mouseHandler);
      mount.removeChild(renderer.domElement);
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 -z-10" />;
}

// --------------------------------------------------
// USO EN NEXT.JS (app/page.tsx)
// --------------------------------------------------
// import SpaceBackground from '../components/SpaceBackground';
//
// export default function Home() {
//   return (
//     <main className="relative w-full h-screen overflow-hidden">
//       <SpaceBackground />
//       <section className="relative z-10 flex items-center justify-center h-full">
//         <h1 className="text-white text-5xl font-bold">Mi Web</h1>
//       </section>
//     </main>
//   );
// }

// --------------------------------------------------
// RUTA RECOMENDADA DENTRO DE TU PROYECTO NEXT.JS
// --------------------------------------------------
// /app/components/SpaceBackground.tsx
