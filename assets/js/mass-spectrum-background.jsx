import React, { useEffect, useRef, useState } from "react";

export default function MassSpectrumBackground() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);

  // Generate realistic mass spectrum peaks with isotopic patterns
  const generatePeaks = () => {
    const peaks = [];
    const numClusters = 6 + Math.floor(Math.random() * 6); // 6-12 base peaks

    // Add extra clusters at low m/z (100-250)
    const lowMzClusters = 2 + Math.floor(Math.random() * 3); // 2-4 extra clusters
    for (let i = 0; i < lowMzClusters; i++) {
      const baseMz = 100 + Math.random() * 150;

      const rand = Math.random();
      let relativeIntensity;
      if (rand < 0.1) {
        relativeIntensity = 1.0;
      } else if (rand < 0.3) {
        relativeIntensity = 0.5;
      } else if (rand < 0.6) {
        relativeIntensity = 0.25;
      } else {
        relativeIntensity = 0.1;
      }

      const baseIntensity = relativeIntensity * 100;
      const baseWidth = 1 + Math.random() * 1;

      // M+0
      peaks.push({
        mz: baseMz,
        intensity: baseIntensity,
        width: baseWidth,
        baseIntensity: baseIntensity,
        phase: Math.random() * Math.PI * 2,
      });

      // M+1
      peaks.push({
        mz: baseMz + 6.018,
        intensity: baseIntensity * 0.25,
        width: baseWidth,
        baseIntensity: baseIntensity * 0.25,
        phase: Math.random() * Math.PI * 2,
      });

      // M+2
      peaks.push({
        mz: baseMz + 12.036,
        intensity: baseIntensity * 0.1,
        width: baseWidth,
        baseIntensity: baseIntensity * 0.1,
        phase: Math.random() * Math.PI * 2,
      });

      // M+3
      peaks.push({
        mz: baseMz + 18.054,
        intensity: baseIntensity * 0.05,
        width: baseWidth,
        baseIntensity: baseIntensity * 0.05,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Main clusters (evenly distributed)
    for (let i = 0; i < numClusters; i++) {
      const baseMz = 150 + (i / numClusters) * 800 + (Math.random() - 0.5) * 50; // More evenly spread

      // Weighted intensity distribution
      const rand = Math.random();
      let relativeIntensity;
      if (rand < 0.1) {
        relativeIntensity = 1.0; // 10% chance
      } else if (rand < 0.3) {
        relativeIntensity = 0.5; // 20% chance
      } else if (rand < 0.6) {
        relativeIntensity = 0.25; // 30% chance
      } else {
        relativeIntensity = 0.1; // 40% chance
      }

      const baseIntensity = relativeIntensity * 100; // Scale to 0-100
      const baseWidth = 1 + Math.random() * 1;

      // M+0 (monoisotopic peak - 100%)
      peaks.push({
        mz: baseMz,
        intensity: baseIntensity,
        width: baseWidth,
        baseIntensity: baseIntensity,
        phase: Math.random() * Math.PI * 2,
      });

      // M+1 (25% of base)
      peaks.push({
        mz: baseMz + 6.018,
        intensity: baseIntensity * 0.25,
        width: baseWidth,
        baseIntensity: baseIntensity * 0.25,
        phase: Math.random() * Math.PI * 2,
      });

      // M+2 (10% of base)
      peaks.push({
        mz: baseMz + 12.036,
        intensity: baseIntensity * 0.1,
        width: baseWidth,
        baseIntensity: baseIntensity * 0.1,
        phase: Math.random() * Math.PI * 2,
      });

      // M+3 (5% of base)
      peaks.push({
        mz: baseMz + 18.054,
        intensity: baseIntensity * 0.05,
        width: baseWidth,
        baseIntensity: baseIntensity * 0.05,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Add extra clusters at high m/z (850-1000)
    const highMzClusters = 2 + Math.floor(Math.random() * 3); // 2-4 extra clusters
    for (let i = 0; i < highMzClusters; i++) {
      const baseMz = 850 + Math.random() * 150;

      const rand = Math.random();
      let relativeIntensity;
      if (rand < 0.1) {
        relativeIntensity = 1.0;
      } else if (rand < 0.3) {
        relativeIntensity = 0.5;
      } else if (rand < 0.6) {
        relativeIntensity = 0.25;
      } else {
        relativeIntensity = 0.1;
      }

      const baseIntensity = relativeIntensity * 100;
      const baseWidth = 1 + Math.random() * 1;

      // M+0
      peaks.push({
        mz: baseMz,
        intensity: baseIntensity,
        width: baseWidth,
        baseIntensity: baseIntensity,
        phase: Math.random() * Math.PI * 2,
      });

      // M+1
      peaks.push({
        mz: baseMz + 6.018,
        intensity: baseIntensity * 0.25,
        width: baseWidth,
        baseIntensity: baseIntensity * 0.25,
        phase: Math.random() * Math.PI * 2,
      });

      // M+2
      peaks.push({
        mz: baseMz + 12.036,
        intensity: baseIntensity * 0.1,
        width: baseWidth,
        baseIntensity: baseIntensity * 0.1,
        phase: Math.random() * Math.PI * 2,
      });

      // M+3
      peaks.push({
        mz: baseMz + 18.054,
        intensity: baseIntensity * 0.05,
        width: baseWidth,
        baseIntensity: baseIntensity * 0.05,
        phase: Math.random() * Math.PI * 2,
      });
    }

    return peaks.sort((a, b) => a.mz - b.mz);
  };

  const [peaks] = useState(generatePeaks);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      };
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    let time = 0;

    const animate = () => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(0, 0, width, height);

      // Draw baseline only
      ctx.strokeStyle = "rgba(100, 100, 120, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, height - 40);
      ctx.lineTo(width - 20, height - 40);
      ctx.stroke();

      // Draw peaks
      const plotWidth = width - 70;
      const plotHeight = height - 60;

      // Calculate current maximum intensity across all peaks (with mouse influence)
      let maxCurrentIntensity = 0;
      peaks.forEach((peak) => {
        const distX = Math.abs(mouseRef.current.x - peak.mz / 1000);
        const distY = mouseRef.current.y;
        const influence = Math.exp(-distX * 5) * (1 - distY);
        const oscillation = Math.sin(time * 0.002 + peak.phase) * 10;
        const mouseBoost = influence * 30;
        const intensity = peak.baseIntensity + oscillation + mouseBoost;
        maxCurrentIntensity = Math.max(maxCurrentIntensity, intensity);
      });

      // Normalization factor to scale to 100
      const normFactor = maxCurrentIntensity > 0 ? 100 / maxCurrentIntensity : 1;

      peaks.forEach((peak, i) => {
        const centerX = 50 + (peak.mz / 1000) * plotWidth;

        // Mouse influence: shift intensity and add shimmer
        const distX = Math.abs(mouseRef.current.x - peak.mz / 1000);
        const distY = mouseRef.current.y;
        const influence = Math.exp(-distX * 5) * (1 - distY);

        // Dynamic intensity with time-based oscillation
        const oscillation = Math.sin(time * 0.002 + peak.phase) * 10;
        const mouseBoost = influence * 30;
        const intensity = (peak.baseIntensity + oscillation + mouseBoost) * normFactor;

        const maxY = height - 40 - (intensity / 100) * plotHeight;

        // Color based on intensity
        const hue = 220 + (intensity / 100) * 60;
        const alpha = 0.4 + (intensity / 100) * 0.5;

        // Draw Gaussian profile peak
        ctx.save();
        ctx.shadowBlur = 15 + influence * 20;
        ctx.shadowColor = `hsla(${hue}, 80%, 60%, ${alpha})`;

        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${alpha * 0.3})`;

        // Gaussian peak width (FWHM in pixels)
        const fwhm = 2 + peak.width * 1.3;
        const sigma = fwhm / 2.355; // Convert FWHM to standard deviation

        ctx.beginPath();
        ctx.moveTo(centerX - fwhm * 3, height - 40);

        // Draw Gaussian profile
        for (let dx = -fwhm * 3; dx <= fwhm * 3; dx += 0.5) {
          const x = centerX + dx;
          const gaussian = Math.exp(-(dx * dx) / (2 * sigma * sigma));
          const y = Math.min(height - 40, height - 40 - gaussian * (intensity / 100) * plotHeight);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(centerX + fwhm * 3, height - 40);
        ctx.closePath();

        // Fill and stroke
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      time++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [peaks]);

  return (
    <div className="w-full h-screen bg-gray-900">
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
    </div>
  );
}
