'use client';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import Lenis from 'lenis';

export default function SpaceBackground() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 15, 120);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.set(0, 2, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 1);
    const directional = new THREE.DirectionalLight(0xffffff, 1.5);
    directional.position.set(5, 10, 7);
    scene.add(ambient, directional);

    // OVNI
    const ovniGroup = new THREE.Group();
    scene.add(ovniGroup);
    ovniGroup.rotation.x = -0.3;

    import('three/examples/jsm/loaders/GLTFLoader').then(({ GLTFLoader }) => {
      const loader = new GLTFLoader();
      loader.load('/models/ovni.glb', (gltf: any) => {
        const model = gltf.scene;
        model.scale.set(0.5, 0.5, 0.5);
        ovniGroup.add(model);
      });
    });

    // Textos 3D
    const textLines = [
      'Hace mucho tiempo...',
      'En una galaxia muy muy lejana...',
      'Un OVNI apareció en la oscuridad...',
      'Y todo cambió para siempre...'
    ];

    const textMeshes: THREE.Mesh[] = [];

    textLines.forEach((line, i) => {
      const canvas = document.createElement('canvas');
      canvas.width = 2048;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'yellow';
      ctx.font = '80px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(line, canvas.width / 2, canvas.height / 2 + 30);

      const texture = new THREE.CanvasTexture(canvas);
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(5, 0.7), material);
      mesh.position.set(0, -1 + i * -3, -10 - i * 20);
      textMeshes.push(mesh);
      scene.add(mesh);
    });

    // Partículas
    const particlesCount = 6000;
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;
      positions[i + 1] = (Math.random() - 0.5) * 200;
      positions[i + 2] = (Math.random() - 0.5) * 200;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Mouse parallax
    const mouse = { x: 0, y: 0 };
    window.addEventListener('mousemove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Lenis smooth scroll
    const lenis = new Lenis({ smoothWheel: true });
    window.scrollTo({ top: 0 });
    lenis.scrollTo(0);

    function raf(t: number) {
      lenis.raf(t);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    let scrollPos = 0;

    const updatePositions = (scroll: number) => {
      scrollPos = scroll;
      ovniGroup.position.z = -scroll * 0.02;
      textMeshes.forEach((mesh, i) => {
        const baseZ = -10 - i * 20;
        mesh.position.z = baseZ + scroll * 0.02;
      });
    };
    updatePositions(0);

    lenis.on('scroll', ({ scroll }) => {
      updatePositions(scroll);
    });

    // Animate
    const MIN_DISTANCE = 9; // distancia mínima cámara-ovni
    function animate() {
      particles.rotation.y += 0.0003;

      // Posición deseada de la cámara
      const offset = new THREE.Vector3(mouse.x * 0.3, 1 + mouse.y * 0.3, 0);
      let desiredCamPos = ovniGroup.position.clone().add(offset).add(new THREE.Vector3(0, 0, MIN_DISTANCE));

      // FORZAR DISTANCIA MÍNIMA
      const dir = desiredCamPos.clone().sub(ovniGroup.position).normalize();
      desiredCamPos = ovniGroup.position.clone().add(dir.multiplyScalar(MIN_DISTANCE));

      camera.position.lerp(desiredCamPos, 0.1); // suavizado
      camera.lookAt(ovniGroup.position);

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();

    // Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  return (
    <>
      <div ref={mountRef} className="fixed inset-0 -z-10" />
      <div style={{ height: '600vh' }} />
    </>
  );
}
