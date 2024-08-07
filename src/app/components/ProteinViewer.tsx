"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Atom } from "../types";

interface ProteinViewerProps {
  atoms: Atom[];
}

const ProteinViewer: React.FC<ProteinViewerProps> = ({ atoms }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || atoms.length === 0) return;

    const coordinates = atoms.map(
      (atom) => new THREE.Vector3(atom.x, atom.y, atom.z)
    );

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry().setFromPoints(coordinates);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/circle.png");

    const material = new THREE.PointsMaterial({
      color: 0x000000,
      size: 0.6,
      map: texture,
      transparent: true,
      alphaTest: 0.5,
    });
    const points = new THREE.Points(geometry, material);
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
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
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
