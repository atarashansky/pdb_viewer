"use client";

import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Atom } from "../types";

interface ProteinViewerProps {
  atoms: Atom[];
  maxWidth: number;
  maxHeight: number;
}

const vertexShader = `
  attribute float size;
  varying vec3 vPosition;

  void main() {
    vPosition = position;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // 300 is a scaling factor that adjusts the size of the atoms based on their distance from the camera
    gl_PointSize = size * (300.0 / -mvPosition.z); 
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  uniform vec3 color;
  varying vec3 vPosition;

  void main() {
    vec3 normal;
    normal.xy = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(normal.xy, normal.xy);
    if (r2 > 1.0) discard;
    normal.z = sqrt(1.0 - r2);

    // set the light source - coming straight in from the camera
    vec3 light = normalize(vec3(0.0, 0.0, 1.0));
    
    // when the normal vector is perpendicular to the light vector, the dot product is 0
    // when the normal vector is parallel to the light vector, the dot product is 1
    float dProd = max(0.0, dot(normal, light)); // max is used to ignore surfaces facing away from the light
    
    // scale the color by the dot product. this gives the illusion of a sphere
    gl_FragColor = vec4(color * dProd, 1.0);
  }
`;

const ProteinViewer: React.FC<ProteinViewerProps> = ({
  atoms,
  maxWidth,
  maxHeight,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(maxWidth);
  const [height, setHeight] = useState(maxHeight);

  useEffect(() => {
    if (!mountRef.current || atoms.length === 0) return;

    const coordinates = atoms.map(
      (atom) => new THREE.Vector3(atom.x, atom.y, atom.z)
    );

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry().setFromPoints(coordinates);
    geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(
        atoms.map(() => 0.6),
        1
      )
    );

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x0000ff) },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });

    const points = new THREE.Points(geometry, shaderMaterial);
    scene.add(points);

    const curve = new THREE.CatmullRomCurve3(coordinates);
    const splineGeometry = new THREE.BufferGeometry().setFromPoints(
      curve.getPoints(coordinates.length * 10)
    );
    const splineMaterial = new THREE.LineBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.8,
      linewidth: 5,
    });

    const spline = new THREE.Line(splineGeometry, splineMaterial);
    scene.add(spline);

    camera.position.z = 100;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      const newWidth = Math.min(clientWidth, maxWidth);
      const newHeight = Math.min(clientHeight, maxHeight);
      setWidth(newWidth);
      setHeight(newHeight);
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [atoms]);

  return <div ref={mountRef} />;
};

export default ProteinViewer;
