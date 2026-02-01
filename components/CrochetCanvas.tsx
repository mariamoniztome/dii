import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Pattern, ConstructionMode, StitchType } from '../types';
import { STITCH_HEIGHTS } from '../constants.tsx';

interface CrochetCanvasProps {
  pattern: Pattern;
}

export interface CrochetCanvasRef {
  getCanvasElement: () => HTMLCanvasElement | null;
}

const CrochetCanvas: React.FC<CrochetCanvasProps> = forwardRef<CrochetCanvasRef, CrochetCanvasProps>(({ pattern }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const [cameraDistance, setCameraDistance] = useState(15);

  const controlsRef = useRef<OrbitControls | null>(null);

  useImperativeHandle(ref, () => ({
    getCanvasElement: () => {
      return rendererRef.current?.domElement || null;
    }
  }));

  // Update camera distance when zoom buttons are clicked
  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    // Smoothly update camera position
    const currentZ = cameraRef.current.position.z;
    const diff = Math.abs(cameraDistance - currentZ);
    
    if (diff > 0.1) {
      cameraRef.current.position.z = cameraDistance;
    }
    
    // Update controls to track the new camera position
    controlsRef.current.update();
  }, [cameraDistance]);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf9fafb);
    scene.fog = new THREE.Fog(0xf9fafb, 15, 60);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Add OrbitControls for rotation only (disable zoom since we use ViewControls)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;
    controls.enableZoom = false; // Disable OrbitControls zoom to avoid conflicts
    controls.enablePan = false;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.z = cameraDistance;
    cameraRef.current.updateProjectionMatrix();
    controlsRef.current.update();
  }, [cameraDistance]);

  useEffect(() => {
    if (!groupRef.current) return;
    const group = groupRef.current;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    renderPattern(pattern, group);
    
    // Calculate total stitches for dependency tracking
    const totalStitches = pattern.rows.reduce((sum, row) => sum + row.stitches.length, 0);
  }, [pattern, pattern.rows.length, pattern.rows.map(r => r.stitches.length).join('-')]);

  // Fix: Updated color parameter to accept string | number to handle both hex strings and numeric colors
  const createStitchMesh = (type: StitchType, color: string | number, twisted: boolean = false) => {
    const height = STITCH_HEIGHTS[type] || 0.6;
    const baseWidth = -0.25;
    const topWidth = 0.25;

    const shape = new THREE.Shape();
    const radius = 0.08;
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      const angle = t * Math.PI * 2;
      const r = radius * (1 + Math.sin(t * Math.PI * 4) * 0.15);
      shape.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }

    const points = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const w = baseWidth + (topWidth - baseWidth) * t;
      const h = height * t;
      points.push(new THREE.Vector3(w, h, 0));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.ExtrudeGeometry(shape, { steps: 20, bevelEnabled: false, extrudePath: curve });
    const material = new THREE.MeshPhongMaterial({ color, shininess: 5 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    return mesh;
  };

  // Fix: Updated color parameter to accept string | number for compatibility with THREE.js materials
  const createLoopMesh = (center: THREE.Vector3, radius: number, thickness: number, color: string | number) => {
    const points = [];
    for (let i = 0; i <= 32; i++) {
      const angle = (i / 32) * Math.PI * 2;
      points.push(new THREE.Vector3(
        center.x + Math.cos(angle) * radius,
        center.y + Math.sin(angle) * radius * 0.5,
        center.z
      ));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, thickness, 6, true);
    const material = new THREE.MeshPhongMaterial({ color, shininess: 5 });
    const mesh = new THREE.Mesh(tubeGeo, material);
    mesh.castShadow = true;
    return mesh;
  };

  const renderPattern = (pattern: Pattern, group: THREE.Group) => {
    // Fix: Using a string hex value for default color to maintain consistency with other stitch colors
    const defaultColor = '#f0e6dc';
    let currentY = 0;

    pattern.rows.forEach((row, rowIndex) => {
      const stitchCount = row.stitches.length;
      if (stitchCount === 0) return;

      if (pattern.mode === ConstructionMode.FLAT) {
        const rowWidth = stitchCount * 0.35;
        row.stitches.forEach((stitch, colIndex) => {
          const x = (colIndex - stitchCount / 2 + 0.5) * 0.35;
          const z = rowIndex * 0.15;
          const color = stitch.color || defaultColor;
          
          const mesh = createStitchMesh(stitch.type, color);
          mesh.position.set(x, currentY, z);
          group.add(mesh);

          const loop = createLoopMesh(new THREE.Vector3(x, currentY + STITCH_HEIGHTS[stitch.type], z), 0.2, 0.06, color);
          group.add(loop);
        });
        currentY += 0.8;
      } else {
        // ROUND mode logic - constant radius for uniform spacing
        const radius = stitchCount * 0.15;
        row.stitches.forEach((stitch, stIndex) => {
          const angle = (stIndex / stitchCount) * Math.PI * 2;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          const color = stitch.color || defaultColor;

          const mesh = createStitchMesh(stitch.type, color);
          mesh.position.set(x, currentY, z);
          mesh.lookAt(0, currentY, 0); // Point towards center roughly
          group.add(mesh);

          const loop = createLoopMesh(new THREE.Vector3(x, currentY + STITCH_HEIGHTS[stitch.type], z), 0.2, 0.06, color);
          group.add(loop);
        });
        currentY += 0.15;
      }
    });
  };

  return (
    <div ref={containerRef} className="w-full h-full cursor-move" />
  );
});

export default CrochetCanvas;