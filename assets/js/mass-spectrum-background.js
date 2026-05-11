// Mass Spectrum Background Animation - Performance Optimized v2
(function () {
  "use strict";

  // Spectrum data zone width as a multiple of the site's max content width.
  // 1.5 means the peaks render 50% wider than the page's text column; the
  // remainder of the canvas (the full window width) shows only the baseline.
  const SPECTRUM_WIDTH_FACTOR = 1.5;
  // Fraction of the spectrum data zone on each side over which the rendered
  // intensity is smoothly attenuated to zero. 0.1 keeps peaks inside the
  // central 80% and trends the line down to the baseline at either side.
  const EDGE_FADE_FRACTION = 0.1;
  // Fallback if the SCSS variable isn't readable for some reason.
  const DEFAULT_CONTENT_WIDTH = 930;

  // Read the active theme's page background. Used to fill the canvas so the
  // spectrum sits flush against the page in both light and dark modes.
  function readBgColor() {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--global-bg-color")
      .trim();
    return value || "#1c1c1d";
  }

  // Read the site's max content width (set by SCSS from _config.yml). Falls
  // back to a sensible default if the var isn't defined as a CSS custom prop.
  function readContentWidth() {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--max-content-width")
      .trim();
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CONTENT_WIDTH;
  }

  // Configuration constants - centralized for easy tuning
  const CONFIG = {
    // Spectrum generation
    MZ_RANGE: 1000,
    NUM_SAMPLES: 600, // Further reduced for smoother animation
    NUM_NOISE_POINTS: 300, // Reduced for performance

    // Cluster settings
    CLUSTERS: { MIN: 6, MAX: 12 },
    LOW_MZ_CLUSTERS: { MIN: 2, MAX: 4, RANGE_START: 100, RANGE_END: 250 },
    HIGH_MZ_CLUSTERS: { MIN: 2, MAX: 4, RANGE_START: 850, RANGE_END: 1000 },

    // Isotope offsets (mass differences)
    ISOTOPE_OFFSETS: [0, 6.018, 12.036, 18.054],
    ISOTOPE_INTENSITIES: [1.0, 0.25, 0.1, 0.05],

    // Mouse interaction
    MOUSE_INFLUENCE_DECAY: 2.5, // Very gentle falloff
    MOUSE_BOOST_FACTOR: 15, // Reduced boost for subtler effect
    MOUSE_SMOOTHING: 0.02, // Very smooth mouse tracking (lower = smoother)

    // Visual
    TOP_MARGIN: 20,
    BOTTOM_MARGIN: 40,
    PEAK_WIDTH_MULTIPLIER: 0.5,
    FWHM_TO_SIGMA: 2.355,

    // Static colors
    STROKE_COLOR: "#2698ba",
    FILL_COLOR: "hsla(240, 80%, 60%, 0.12)",
    SHADOW_COLOR: "hsla(195, 65%, 44%, 0.25)",

    // Oscillation
    OSCILLATION_SPEED: 0.0008, // Radians per millisecond (slow)
    OSCILLATION_AMPLITUDE: 3, // Subtle intensity variation

    // Performance
    GAUSSIAN_CUTOFF: 0.002, // Slightly higher for performance
  };

  // Pre-computed intensity thresholds for random distribution
  const INTENSITY_THRESHOLDS = [
    { threshold: 0.1, value: 1.0 },
    { threshold: 0.3, value: 0.5 },
    { threshold: 0.6, value: 0.25 },
    { threshold: 1.0, value: 0.1 },
  ];

  /**
   * Get relative intensity based on random value using pre-defined distribution
   */
  function getRelativeIntensity(rand) {
    for (const { threshold, value } of INTENSITY_THRESHOLDS) {
      if (rand < threshold) return value;
    }
    return 0.1;
  }

  /**
   * Create an isotope cluster at the given base m/z
   */
  function createIsotopeCluster(baseMz, baseIntensity, baseWidth) {
    const sigma = ((2 + baseWidth * 1.3) * CONFIG.PEAK_WIDTH_MULTIPLIER) / CONFIG.FWHM_TO_SIGMA;
    const sigmaSquared = sigma * sigma;
    const twoSigmaSquared = 2 * sigmaSquared;
    // Pre-calculate max distance for spatial culling
    const maxDistance = sigma * Math.sqrt(-2 * Math.log(CONFIG.GAUSSIAN_CUTOFF));

    return CONFIG.ISOTOPE_OFFSETS.map((offset, i) => ({
      mz: baseMz + offset,
      baseIntensity: baseIntensity * CONFIG.ISOTOPE_INTENSITIES[i],
      // Pre-calculate all gaussian parameters
      twoSigmaSquared,
      minMz: baseMz + offset - maxDistance,
      maxMz: baseMz + offset + maxDistance,
      // Random phase for oscillation
      phase: Math.random() * Math.PI * 2,
    }));
  }

  class MassSpectrumBackground {
    constructor(canvasElement) {
      this.canvas = canvasElement;
      this.ctx = this.canvas.getContext("2d", {
        alpha: false,
        desynchronized: true, // Allows browser to optimize rendering
      });
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Mouse state - direct, no smoothing
      this.mouse = { x: 0.5, y: 0.5 };
      this.isVisible = true;
      this.animationId = null;

      // Pre-allocate typed arrays to avoid GC pressure
      const numSamples = CONFIG.NUM_SAMPLES + 1;
      this.spectrumX = new Float32Array(numSamples);
      this.spectrumY = new Float32Array(numSamples);
      this.spectrumIntensity = new Float32Array(numSamples);

      // Pre-allocate peak intensity array
      this.peakIntensities = null; // Will be sized after peak generation

      // Cache dimensions
      this.width = 0;
      this.height = 0;
      this.plotHeight = 0;
      this.baselineY = 0;
      this.mzStep = CONFIG.MZ_RANGE / CONFIG.NUM_SAMPLES;

      // Generate peaks and pre-calculate spatial data
      this.peaks = this.generatePeaks();
      this.peakIntensities = new Float32Array(this.peaks.length);
      this.noiseData = this.generateNoise();

      // Pre-calculate noise indices mapping
      this.noiseIndices = new Uint16Array(numSamples);
      for (let i = 0; i < numSamples; i++) {
        this.noiseIndices[i] = Math.min(Math.floor((i / CONFIG.NUM_SAMPLES) * CONFIG.NUM_NOISE_POINTS), CONFIG.NUM_NOISE_POINTS - 1);
      }

      // Build spatial lookup for peaks (which peaks affect which samples)
      this.samplePeakMap = this.buildSamplePeakMap();

      this.init();
    }

    generatePeaks() {
      const peaks = [];

      const addClusters = (count, mzGenerator) => {
        for (let i = 0; i < count; i++) {
          const baseMz = mzGenerator(i, count);
          const baseIntensity = getRelativeIntensity(Math.random()) * 100;
          const baseWidth = 1 + Math.random();
          peaks.push(...createIsotopeCluster(baseMz, baseIntensity, baseWidth));
        }
      };

      // Low m/z clusters
      const lowCount = CONFIG.LOW_MZ_CLUSTERS.MIN + Math.floor(Math.random() * (CONFIG.LOW_MZ_CLUSTERS.MAX - CONFIG.LOW_MZ_CLUSTERS.MIN + 1));
      addClusters(
        lowCount,
        () => CONFIG.LOW_MZ_CLUSTERS.RANGE_START + Math.random() * (CONFIG.LOW_MZ_CLUSTERS.RANGE_END - CONFIG.LOW_MZ_CLUSTERS.RANGE_START)
      );

      // Main clusters
      const mainCount = CONFIG.CLUSTERS.MIN + Math.floor(Math.random() * (CONFIG.CLUSTERS.MAX - CONFIG.CLUSTERS.MIN + 1));
      addClusters(mainCount, (i, total) => 150 + (i / total) * 800 + (Math.random() - 0.5) * 50);

      // High m/z clusters
      const highCount = CONFIG.HIGH_MZ_CLUSTERS.MIN + Math.floor(Math.random() * (CONFIG.HIGH_MZ_CLUSTERS.MAX - CONFIG.HIGH_MZ_CLUSTERS.MIN + 1));
      addClusters(
        highCount,
        () => CONFIG.HIGH_MZ_CLUSTERS.RANGE_START + Math.random() * (CONFIG.HIGH_MZ_CLUSTERS.RANGE_END - CONFIG.HIGH_MZ_CLUSTERS.RANGE_START)
      );

      return peaks.sort((a, b) => a.mz - b.mz);
    }

    generateNoise() {
      // Interleaved intensity/phase pairs for cache locality
      const noise = new Float32Array(CONFIG.NUM_NOISE_POINTS * 2);
      for (let i = 0; i < CONFIG.NUM_NOISE_POINTS; i++) {
        noise[i * 2] = 1 + Math.random() * 2;
        noise[i * 2 + 1] = Math.random() * Math.PI * 2;
      }
      return noise;
    }

    /**
     * Build a map from each sample index to the peaks that influence it
     * This allows O(1) lookup of relevant peaks per sample
     */
    buildSamplePeakMap() {
      const map = new Array(CONFIG.NUM_SAMPLES + 1);

      for (let i = 0; i <= CONFIG.NUM_SAMPLES; i++) {
        const mz = i * this.mzStep;
        const relevantPeaks = [];

        for (let p = 0; p < this.peaks.length; p++) {
          const peak = this.peaks[p];
          if (mz >= peak.minMz && mz <= peak.maxMz) {
            relevantPeaks.push(p);
          }
        }

        // Convert to typed array for performance
        map[i] = new Uint16Array(relevantPeaks);
      }

      return map;
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;

      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;

      this.ctx = this.canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      });
      this.ctx.scale(this.dpr, this.dpr);

      // Cache derived values
      this.plotHeight = this.height - CONFIG.TOP_MARGIN - CONFIG.BOTTOM_MARGIN;
      this.baselineY = this.height - CONFIG.BOTTOM_MARGIN;

      // Cache the page background colour from the active theme so light mode
      // doesn't leave a dark slab behind the spectrum.
      this.bgColor = readBgColor();

      // Spectrum data zone: 1.5× the site's max content width, centred in the
      // full-window canvas. Outside this zone only the baseline line is drawn,
      // giving the effect of the baseline extending to the window edges.
      const contentWidth = readContentWidth();
      this.spectrumZoneWidth = Math.min(this.width, contentWidth * SPECTRUM_WIDTH_FACTOR);
      this.spectrumZoneStart = (this.width - this.spectrumZoneWidth) / 2;

      // Pre-calculate x positions (mapped into the spectrum data zone)
      const step = this.spectrumZoneWidth / CONFIG.NUM_SAMPLES;
      for (let i = 0; i <= CONFIG.NUM_SAMPLES; i++) {
        this.spectrumX[i] = this.spectrumZoneStart + i * step;
      }

      // Pre-calculate the edge-fade envelope: 1.0 inside the central
      // (1 - 2 * EDGE_FADE_FRACTION) of the spectrum data zone, smoothstep'd
      // down to 0 over the outer EDGE_FADE_FRACTION on each side. Cached so the
      // per-frame render() only does an array lookup + multiply.
      if (!this.envelope || this.envelope.length !== CONFIG.NUM_SAMPLES + 1) {
        this.envelope = new Float32Array(CONFIG.NUM_SAMPLES + 1);
      }
      const fade = EDGE_FADE_FRACTION;
      for (let i = 0; i <= CONFIG.NUM_SAMPLES; i++) {
        const t = i / CONFIG.NUM_SAMPLES;
        let env;
        if (t < fade) {
          const x = t / fade;
          env = x * x * (3 - 2 * x); // smoothstep
        } else if (t > 1 - fade) {
          const x = (1 - t) / fade;
          env = x * x * (3 - 2 * x);
        } else {
          env = 1;
        }
        this.envelope[i] = env;
      }
    }

    handleMouseMove(e) {
      // Direct mouse position - no smoothing
      this.mouse.x = e.clientX / window.innerWidth;
      this.mouse.y = e.clientY / window.innerHeight;
      // Animation loop handles rendering
    }

    handleVisibilityChange() {
      this.isVisible = !document.hidden;
      if (this.isVisible && !this.animationId) {
        this.animationId = requestAnimationFrame((t) => this.animate(t));
      }
    }

    /**
     * Calculate peak intensities with oscillation
     */
    updatePeakIntensities(time) {
      const mouseX = this.mouse.x;
      const mouseInfluence = 1 - this.mouse.y;
      const peaks = this.peaks;
      const intensities = this.peakIntensities;
      const mzScale = 1 / CONFIG.MZ_RANGE;
      const decayFactor = CONFIG.MOUSE_INFLUENCE_DECAY * 2;
      const timeOsc = time * CONFIG.OSCILLATION_SPEED;

      for (let p = 0; p < peaks.length; p++) {
        const peak = peaks[p];
        const normalizedMz = peak.mz * mzScale;
        const distX = mouseX - normalizedMz;
        const distXSq = distX * distX;

        // Gaussian influence falloff based on mouse position
        const influence = Math.exp(-distXSq * decayFactor) * mouseInfluence;
        const mouseBoost = influence * CONFIG.MOUSE_BOOST_FACTOR;

        // Subtle oscillation
        const oscillation = Math.sin(timeOsc + peak.phase) * CONFIG.OSCILLATION_AMPLITUDE;

        intensities[p] = peak.baseIntensity + mouseBoost + oscillation;
      }
    }

    /**
     * Animation loop
     */
    animate(currentTime) {
      if (!this.isVisible) {
        this.animationId = null;
        return;
      }

      this.render(currentTime);
      this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    /**
     * Render the spectrum
     */
    render(time = 0) {
      const ctx = this.ctx;
      const { width, height, baselineY, plotHeight, mzStep } = this;

      // Clear with the active theme's background colour
      ctx.fillStyle = this.bgColor || "#1c1c1d";
      ctx.fillRect(0, 0, width, height);

      // Draw the baseline across the full canvas width — outside the spectrum
      // data zone this is the only thing drawn, so the baseline appears to
      // continue to the window edges at a constant Y.
      ctx.strokeStyle = "rgba(128, 128, 128, 0.5)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, baselineY);
      ctx.lineTo(width, baselineY);
      ctx.stroke();

      // Update peak intensities with oscillation
      this.updatePeakIntensities(time);

      const peaks = this.peaks;
      const peakIntensities = this.peakIntensities;
      const noiseData = this.noiseData;
      const noiseIndices = this.noiseIndices;
      const samplePeakMap = this.samplePeakMap;
      const envelope = this.envelope;

      // Build spectrum data - direct calculation, no smoothing
      for (let i = 0; i <= CONFIG.NUM_SAMPLES; i++) {
        const mz = i * mzStep;

        // Get static noise contribution
        const noiseIdx = noiseIndices[i] * 2;
        const noiseIntensity = noiseData[noiseIdx];
        let totalIntensity = noiseIntensity;

        // Add relevant peaks
        const relevantPeaks = samplePeakMap[i];
        for (let j = 0; j < relevantPeaks.length; j++) {
          const p = relevantPeaks[j];
          const peak = peaks[p];
          const dx = mz - peak.mz;
          const gaussian = Math.exp(-(dx * dx) / peak.twoSigmaSquared);
          totalIntensity += gaussian * peakIntensities[p];
        }

        // Attenuate to baseline at the edges so peaks live in the central 80%.
        if (totalIntensity > 0) {
          totalIntensity *= envelope[i];
        }
        this.spectrumIntensity[i] = totalIntensity > 0 ? totalIntensity : 0;

        // Direct Y calculation - no smoothing
        this.spectrumY[i] = baselineY - this.spectrumIntensity[i] * 0.01 * plotHeight;
      }

      // Draw filled area. We start and end on the baseline at the canvas
      // edges so the fill (and the line stroke below) flow continuously across
      // the full window width, sitting flush on the axis outside the data zone.
      ctx.beginPath();
      ctx.moveTo(0, baselineY);
      ctx.lineTo(this.spectrumX[0], this.spectrumY[0]);

      for (let i = 0; i < CONFIG.NUM_SAMPLES; i++) {
        const midX = (this.spectrumX[i] + this.spectrumX[i + 1]) * 0.5;
        const midY = (this.spectrumY[i] + this.spectrumY[i + 1]) * 0.5;
        ctx.quadraticCurveTo(this.spectrumX[i], this.spectrumY[i], midX, midY);
      }

      ctx.lineTo(this.spectrumX[CONFIG.NUM_SAMPLES], this.spectrumY[CONFIG.NUM_SAMPLES]);
      ctx.lineTo(width, baselineY);
      ctx.closePath();

      ctx.shadowBlur = 8;
      ctx.shadowColor = CONFIG.SHADOW_COLOR;
      ctx.fillStyle = CONFIG.FILL_COLOR;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw stroke. Bookend the curve with flat segments along the baseline
      // so the spectrum signal runs edge-to-edge at the axis level.
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = CONFIG.STROKE_COLOR;
      ctx.shadowBlur = 8;
      ctx.shadowColor = CONFIG.SHADOW_COLOR;

      ctx.beginPath();
      ctx.moveTo(0, baselineY);
      ctx.lineTo(this.spectrumX[0], this.spectrumY[0]);

      for (let i = 0; i < CONFIG.NUM_SAMPLES; i++) {
        const midX = (this.spectrumX[i] + this.spectrumX[i + 1]) * 0.5;
        const midY = (this.spectrumY[i] + this.spectrumY[i + 1]) * 0.5;
        ctx.quadraticCurveTo(this.spectrumX[i], this.spectrumY[i], midX, midY);
      }
      ctx.lineTo(this.spectrumX[CONFIG.NUM_SAMPLES], this.spectrumY[CONFIG.NUM_SAMPLES]);
      ctx.lineTo(width, baselineY);
      ctx.stroke();

      ctx.shadowBlur = 0;
    }

    init() {
      this.resize();

      // Debounced resize handler
      let resizeTimeout;
      this.resizeHandler = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => this.resize(), 150);
      };

      // Throttled mouse handler for performance
      let lastMouseTime = 0;
      this.mouseMoveHandler = (e) => {
        const now = performance.now();
        if (now - lastMouseTime > 16) {
          // ~60fps throttle
          this.handleMouseMove(e);
          lastMouseTime = now;
        }
      };

      this.visibilityHandler = () => this.handleVisibilityChange();

      // Re-read the page background when the user toggles light/dark mode.
      // theme.js flips `data-theme` on <html>; we watch that attribute.
      this.themeObserver = new MutationObserver(() => {
        this.bgColor = readBgColor();
      });
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      window.addEventListener("resize", this.resizeHandler, { passive: true });
      document.addEventListener("mousemove", this.mouseMoveHandler, { passive: true });
      document.addEventListener("visibilitychange", this.visibilityHandler);

      // Start animation loop
      this.animationId = requestAnimationFrame((t) => this.animate(t));
    }

    destroy() {
      window.removeEventListener("resize", this.resizeHandler);
      document.removeEventListener("mousemove", this.mouseMoveHandler);
      document.removeEventListener("visibilitychange", this.visibilityHandler);
      if (this.themeObserver) {
        this.themeObserver.disconnect();
        this.themeObserver = null;
      }
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  }

  // Initialize on DOM ready
  function initMassSpectrum() {
    const canvas = document.getElementById("mass-spectrum-canvas");
    if (canvas) {
      // Store instance for potential cleanup
      canvas._massSpectrum = new MassSpectrumBackground(canvas);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMassSpectrum);
  } else {
    initMassSpectrum();
  }
})();
