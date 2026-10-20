import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, Box, Eye, Sparkles } from 'lucide-react';

interface ThreeDViewerProps {
  geometryType?: 'torus' | 'dodecahedron' | 'cube' | 'knot' | 'cylinder';
  wireframe?: boolean;
  color?: string;
  autoRotate?: boolean;
  onGeometryChange?: (type: 'torus' | 'dodecahedron' | 'cube' | 'knot' | 'cylinder') => void;
  onWireframeToggle?: (val: boolean) => void;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({
  geometryType = 'torus',
  wireframe = false,
  color = '#6366f1',
  autoRotate = true,
  onGeometryChange,
  onWireframeToggle,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const meshRef = useRef<THREE.Mesh | null>(null);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [isWireframe, setIsWireframe] = useState(wireframe);

  useEffect(() => {
    setIsWireframe(wireframe);
  }, [wireframe]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 200;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4.2;

    // WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Geometry creation
    let geom: THREE.BufferGeometry;
    switch (geometryType) {
      case 'dodecahedron':
        geom = new THREE.DodecahedronGeometry(1.3, 0);
        break;
      case 'cube':
        geom = new THREE.BoxGeometry(1.6, 1.6, 1.6);
        break;
      case 'knot':
        geom = new THREE.TorusKnotGeometry(0.9, 0.28, 100, 16);
        break;
      case 'cylinder':
        geom = new THREE.CylinderGeometry(0.9, 0.9, 1.8, 32);
        break;
      case 'torus':
      default:
        geom = new THREE.TorusGeometry(1.1, 0.4, 24, 64);
        break;
    }

    // Modern cyber material
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.25,
      metalness: 0.85,
      wireframe: isWireframe,
    });

    const mesh = new THREE.Mesh(geom, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa855f7, 2.0);
    dirLight2.position.set(-5, -4, -3);
    scene.add(dirLight2);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (meshRef.current && isRotating && !isDraggingRef.current) {
        meshRef.current.rotation.x += 0.008;
        meshRef.current.rotation.y += 0.012;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Mouse drag interaction
    const handlePointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
      e.stopPropagation();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDraggingRef.current || !meshRef.current) return;
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      meshRef.current.rotation.y += deltaX * 0.015;
      meshRef.current.rotation.x += deltaY * 0.015;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };
      e.stopPropagation();
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      dom.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      geom.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [geometryType, isWireframe, color, isRotating]);

  const geoms: ('torus' | 'knot' | 'dodecahedron' | 'cube')[] = [
    'torus',
    'knot',
    'dodecahedron',
    'cube',
  ];

  return (
    <div className="relative w-full h-full min-h-[180px] rounded-lg overflow-hidden bg-gradient-to-b from-neutral-900/90 to-neutral-950/90 border border-neutral-800/80 group">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Control overlay */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-neutral-900/80 backdrop-blur-md px-2 py-1 rounded-md border border-neutral-700/60 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          title="Alternar rotação automática"
          onClick={(e) => {
            e.stopPropagation();
            setIsRotating(!isRotating);
          }}
          className={`p-1 rounded text-xs transition-colors ${
            isRotating ? 'text-indigo-400 bg-indigo-500/20' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          title="Alternar modo Wireframe"
          onClick={(e) => {
            e.stopPropagation();
            const next = !isWireframe;
            setIsWireframe(next);
            onWireframeToggle?.(next);
          }}
          className={`p-1 rounded text-xs transition-colors ${
            isWireframe ? 'text-indigo-400 bg-indigo-500/20' : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
        </button>

        <div className="h-3 w-px bg-neutral-700" />

        {geoms.map((g) => (
          <button
            key={g}
            type="button"
            title={`Geometria: ${g}`}
            onClick={(e) => {
              e.stopPropagation();
              onGeometryChange?.(g);
            }}
            className={`px-1.5 py-0.5 text-[10px] uppercase font-mono rounded transition-colors ${
              geometryType === g
                ? 'bg-indigo-600 text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {g.slice(0, 3)}
          </button>
        ))}
      </div>

      <div className="absolute bottom-2 left-2 pointer-events-none text-[10px] text-neutral-400/80 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
        <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
        <span>Arraste para inspecionar em 3D</span>
      </div>
    </div>
  );
};
