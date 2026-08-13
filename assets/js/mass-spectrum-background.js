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
    const value = getComputedStyle(document.documentElement).getPropertyValue("--global-bg-color").trim();
    return value || "#1c1c1d";
  }

  // Read the site's max content width (set by SCSS from _config.yml). Falls
  // back to a sensible default if the var isn't defined as a CSS custom prop.
  function readContentWidth() {
    const value = getComputedStyle(document.documentElement).getPropertyValue("--max-content-width").trim();
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CONTENT_WIDTH;
  }

  function readVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
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
    TOP_MARGIN: 34,
    BOTTOM_MARGIN: 40,
    PEAK_WIDTH_MULTIPLIER: 0.5,
    FWHM_TO_SIGMA: 2.355,

    // Colours are read per-theme from CSS custom properties at resize time.
    STROKE_COLOR: "#0E6C74",
    FILL_COLOR: "rgba(14, 108, 116, 0.10)",
    SHADOW_COLOR: "rgba(14, 108, 116, 0.22)",

    // Oscillation
    OSCILLATION_SPEED: 0.0008, // Radians per millisecond (slow)
    OSCILLATION_AMPLITUDE: 3, // Subtle intensity variation

    // Performance
    GAUSSIAN_CUTOFF: 0.002, // Slightly higher for performance
  };

  // Named peaks. Each becomes a real isotope cluster at a fixed m/z, annotated
  // with a leader line and label so the spectrum reads as the subject matter
  // rather than generic motion. Kept inside 120-880 so the edge-fade envelope
  // never attenuates a labelled peak.
  // `accent` marks the one filled chip in the keyword row — Metabolomics, per
  // the design brief — when these words fall back to DOM chips.
  const LABELLED_PEAKS = [
    { mz: 148, text: "Data Science" },
    { mz: 316, text: "Informatics" },
    { mz: 502, text: "Metabolomics", accent: true },
    { mz: 664, text: "Analytical Chemistry" },
    { mz: 838, text: "Life Sciences" },
  ];
  const LABEL_MIN_ZONE_WIDTH = 640; // below this the labels are omitted
  // Below that same width the banner is short as well as narrow, so the trace
  // is thinned to keep it a background texture rather than a heavy stroke.
  const NARROW_LINE_SCALE = 0.6;
  // Where the peak names go when they cannot be drawn on the canvas. Populated
  // from LABELLED_PEAKS so the words have a single source of truth.
  const CHIP_HOST_SELECTOR = ".spectrum-chips";

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

  // Presentation variants. "hero" is the full banner; "divider" is a compact,
  // unlabelled rule-height version for use between page sections.
  const VARIANTS = {
    hero: {
      topMargin: 14,
      bottomMargin: 40,
      intensityScale: 0.01,
      lineWidth: 2,
      showFill: true,
      showLabels: true,
      glow: 8,
      mode: "trace",
      opaque: true,
      labelBand: 26,
      // On first paint the whole trace grows up from the baseline over 2s,
      // then behaves normally (oscillation + pointer response).
      introScaleIn: true,
      introDuration: 2000,
    },
    // Hero as a background layer behind the masthead: no annotations (the DOM
    // chips carry those words), transparent so the page background shows through.
    "hero-bg": {
      topMargin: 14,
      bottomMargin: 0,
      intensityScale: 0.008,
      lineWidth: 1.5,
      showFill: true,
      showLabels: false,
      glow: 6,
      mode: "trace",
      traceAlpha: 0.9,
    },
    // Compact hero rule: text-column width, unlabelled, dissolving at both ends.
    "hero-rule": {
      topMargin: 8,
      bottomMargin: 0,
      intensityScale: 0.022,
      lineWidth: 1.5,
      showFill: true,
      showLabels: false,
      glow: 5,
      mode: "trace",
      edgeFade: true,
      traceAlpha: 0.95,
    },
    // A — continuous trace, flattened right down to a living hairline.
    divider: {
      topMargin: 8,
      bottomMargin: 8,
      intensityScale: 0.0035,
      lineWidth: 1,
      showFill: false,
      showLabels: false,
      glow: 0,
      mode: "trace",
      traceAlpha: 0.7,
    },
    // B — centroid sticks: how a mass spectrum is actually drawn.
    "divider-stems": {
      topMargin: 8,
      bottomMargin: 8,
      intensityScale: 0.0075,
      lineWidth: 1,
      showFill: false,
      showLabels: false,
      glow: 0,
      mode: "stems",
      stemAlpha: 0.55,
    },
    // C — a plain rule, marked only at the five named m/z.
    "divider-ticks": {
      topMargin: 8,
      bottomMargin: 8,
      intensityScale: 0.006,
      lineWidth: 1,
      showFill: false,
      showLabels: false,
      glow: 0,
      mode: "ticks",
    },
    // B+D — centroid sticks that dissolve to nothing at both ends.
    "divider-stems-fade": {
      topMargin: 8,
      bottomMargin: 8,
      intensityScale: 0.0075,
      lineWidth: 1,
      showFill: false,
      showLabels: false,
      glow: 0,
      mode: "stems",
      stemAlpha: 0.6,
      edgeFade: true,
      static: true,
    },
    // D — trace that dissolves into a flat rule toward both edges.
    "divider-fade": {
      topMargin: 8,
      bottomMargin: 8,
      intensityScale: 0.004,
      lineWidth: 1.25,
      showFill: true,
      showLabels: false,
      glow: 0,
      mode: "trace",
      edgeFade: true,
      traceAlpha: 0.85,
    },
  };

  class MassSpectrumBackground {
    constructor(canvasElement, variantName) {
      this.canvas = canvasElement;
      this.variant = VARIANTS[variantName || canvasElement.dataset.variant] || VARIANTS.hero;
      this.ctx = this.canvas.getContext("2d", { alpha: !this.variant.opaque });
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);

      // Mouse state - direct, no smoothing
      this.mouse = { x: 0.5, y: 0.5 };
      this.isVisible = true;
      this.animationId = null;

      // Load-in animation: 0..1 factor the peak heights are multiplied by, so
      // the trace scales up vertically from the baseline. Timestamp is stamped
      // on the first render and never reset (a resize mid-intro must not
      // restart it). Known here so the very first paint already respects it.
      this.reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      this.introStart = null;
      this.introScale = 1;

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
      this.labels = this.peaks
        .map((peak, index) => (peak.label ? { text: peak.label, mz: peak.mz, index, accent: peak.accent } : null))
        .filter(Boolean);
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

      // Named peaks: a strong, stable base intensity so they stay legible,
      // tagged so the renderer can find each cluster's apex later.
      LABELLED_PEAKS.forEach((label) => {
        const cluster = createIsotopeCluster(label.mz, 62, 1.4);
        cluster[0].label = label.text;
        cluster[0].accent = label.accent;
        peaks.push(...cluster);
      });

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

      this.canvas.width = Math.round(this.width * this.dpr);
      this.canvas.height = Math.round(this.height * this.dpr);

      this.ctx = this.canvas.getContext("2d", { alpha: !this.variant.opaque });
      this.ctx.scale(this.dpr, this.dpr);

      // Cache derived values
      this.plotHeight = this.height - this.variant.topMargin - this.variant.bottomMargin;
      this.baselineY = this.height - this.variant.bottomMargin;
      // Tallest a peak may draw. The label band is headroom reserved above the
      // highest possible apex so an annotation always has clean space to sit in.
      this.peakCeiling = Math.max(12, this.plotHeight - (this.variant.labelBand || 0));
      this.peakKnee = this.peakCeiling * 0.8;
      if (this.labels)
        this.labels.forEach((l) => {
          l.width = null;
        });
      this.peakHeadroom = this.peakCeiling - this.peakKnee;

      // Cache the page background colour from the active theme so light mode
      // doesn't leave a dark slab behind the spectrum.
      this.bgColor = readBgColor();
      this.strokeColor = readVar("--spectrum-stroke", CONFIG.STROKE_COLOR);
      this.fillColor = readVar("--spectrum-fill", CONFIG.FILL_COLOR);
      this.shadowColor = readVar("--spectrum-shadow", CONFIG.SHADOW_COLOR);
      this.axisColor = readVar("--spectrum-axis", "rgba(128,128,128,0.5)");
      this.labelColor = readVar("--spectrum-label", CONFIG.STROKE_COLOR);
      // Divider-only colours (stems + baseline), so the section rule can be
      // boosted in light mode without touching the hero.
      this.dividerStroke = readVar("--spectrum-divider-stroke", this.strokeColor);
      this.dividerAxis = readVar("--spectrum-divider-axis", this.axisColor);
      const dividerAlpha = parseFloat(readVar("--spectrum-divider-alpha", ""));
      this.dividerAlpha = Number.isFinite(dividerAlpha) ? dividerAlpha : null;

      // Spectrum data zone: 1.5× the site's max content width, centred in the
      // full-window canvas. Outside this zone only the baseline line is drawn,
      // giving the effect of the baseline extending to the window edges.
      const contentWidth = readContentWidth();
      this.spectrumZoneWidth = Math.min(this.width, contentWidth * SPECTRUM_WIDTH_FACTOR);
      this.spectrumZoneStart = (this.width - this.spectrumZoneWidth) / 2;

      // The single decision behind three behaviours: no drawn annotations, a
      // thinner trace, and the DOM chips taking the words instead.
      this.labelsSuppressed = !!this.variant.showLabels && this.spectrumZoneWidth < LABEL_MIN_ZONE_WIDTH;
      this.syncLabelChips();

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

      // Setting canvas.width above cleared the backing store, so repaint now
      // rather than waiting on rAF (throttled in hidden/background frames).
      this.render(performance.now());
    }

    handleMouseMove(e) {
      // Record where the pointer actually is; the animation loop eases the
      // rendered position toward it so the trace glides instead of stepping.
      if (!this.mouseTarget) this.mouseTarget = { x: this.mouse.x, y: this.mouse.y };
      this.mouseTarget.x = e.clientX / window.innerWidth;
      this.mouseTarget.y = e.clientY / window.innerHeight;
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
      // Critically-damped-ish easing toward the pointer. Frame-rate normalised so
      // a 120Hz display feels the same as a 60Hz one.
      if (this.mouseTarget) {
        const dt = this.lastFrameTime ? Math.min((time - this.lastFrameTime) / 16.67, 3) : 1;
        const ease = 1 - Math.pow(1 - 0.16, dt);
        this.mouse.x += (this.mouseTarget.x - this.mouse.x) * ease;
        this.mouse.y += (this.mouseTarget.y - this.mouse.y) * ease;
      }
      this.lastFrameTime = time;

      const mouseX = this.mouse.x;
      const mouseInfluence = 1 - this.mouse.y;
      const peaks = this.peaks;
      const intensities = this.peakIntensities;
      const mzScale = 1 / CONFIG.MZ_RANGE;
      const decayFactor = CONFIG.MOUSE_INFLUENCE_DECAY * 2;
      const timeOsc = time * CONFIG.OSCILLATION_SPEED;

      if (this.variant.static) {
        for (let p = 0; p < peaks.length; p++) intensities[p] = peaks[p].baseIntensity;
        return;
      }

      for (let p = 0; p < peaks.length; p++) {
        const peak = peaks[p];
        const normalizedMz = peak.mz * mzScale;
        const distX = mouseX - normalizedMz;
        const distXSq = distX * distX;

        // Gaussian influence falloff based on mouse position
        const influence = Math.exp(-distXSq * decayFactor) * mouseInfluence;
        const mouseBoost = influence * CONFIG.MOUSE_BOOST_FACTOR;

        // Subtle oscillation — suppressed under prefers-reduced-motion, so the
        // spectrum only moves in response to the pointer.
        const oscillation = this.reduceMotion ? 0 : Math.sin(timeOsc + peak.phase) * CONFIG.OSCILLATION_AMPLITUDE;

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
      // Self-heal: if the element's backing store was reset (React remounting
      // the canvas, host re-layout), re-size before drawing into a dead buffer.
      if (this.canvas.width !== Math.round(this.width * this.dpr) || this.canvas.height !== Math.round(this.height * this.dpr)) {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.resize();
          return;
        }
      }

      const ctx = this.ctx;
      const { width, height, baselineY, plotHeight, mzStep } = this;

      // The hero sits on the page background and is opaque; dividers are
      // transparent so they composite over whatever surface holds them.
      if (this.variant.opaque) {
        ctx.fillStyle = this.bgColor || "#1c1c1d";
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // Draw the baseline across the full canvas width — outside the spectrum
      // data zone this is the only thing drawn, so the baseline appears to
      // continue to the window edges at a constant Y.
      // Dividers use their own (light-boosted) baseline colour; the hero keeps
      // the faint axis it was tuned with.
      const isDivider = this.variant.mode === "stems" || this.variant.mode === "ticks";
      const axisColor = (isDivider ? this.dividerAxis : this.axisColor) || "rgba(128,128,128,0.5)";
      if (this.variant.edgeFade) {
        const axisGrad = ctx.createLinearGradient(0, 0, width, 0);
        axisGrad.addColorStop(0, "transparent");
        axisGrad.addColorStop(0.14, axisColor);
        axisGrad.addColorStop(0.86, axisColor);
        axisGrad.addColorStop(1, "transparent");
        ctx.strokeStyle = axisGrad;
      } else {
        ctx.strokeStyle = axisColor;
      }
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, baselineY);
      ctx.lineTo(width, baselineY);
      ctx.stroke();

      // Update peak intensities with oscillation
      this.updatePeakIntensities(time);

      // Load-in: scale peak heights up from the baseline over introDuration on
      // first paint (hero only), eased out, then hold at full height. Suppressed
      // under reduced motion. introStart is stamped once and survives resizes.
      let introScale = 1;
      if (this.variant.introScaleIn && !this.reduceMotion) {
        if (this.introStart === null) this.introStart = time;
        const t = Math.min((time - this.introStart) / (this.variant.introDuration || 2000), 1);
        introScale = 1 - Math.pow(1 - t, 3); // easeOutCubic — decelerates into full height
      }
      this.introScale = introScale;

      if (this.variant.mode === "stems") {
        this.renderStems();
        return;
      }
      if (this.variant.mode === "ticks") {
        this.renderTicks();
        return;
      }

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

        // Height is linear up to the knee — most peaks are untouched — then
        // compresses asymptotically into the ceiling, so only the tallest are
        // held back and the label band always stays clear.
        const raw = this.spectrumIntensity[i] * this.variant.intensityScale * plotHeight;
        const knee = this.peakKnee;
        const h = raw <= knee ? raw : knee + this.peakHeadroom * (1 - Math.exp(-(raw - knee) / this.peakHeadroom));
        this.spectrumY[i] = baselineY - h * this.introScale;
      }

      // Draw filled area (hero only). We start and end on the baseline at the canvas
      // edges so the fill (and the line stroke below) flow continuously across
      // the full window width, sitting flush on the axis outside the data zone.
      if (this.variant.showFill) {
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

        ctx.shadowBlur = this.variant.glow;
        ctx.shadowColor = this.shadowColor;
        ctx.fillStyle = this.fillColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw stroke. Bookend the curve with flat segments along the baseline
      // so the spectrum signal runs edge-to-edge at the axis level.
      ctx.lineWidth = this.labelsSuppressed ? this.variant.lineWidth * NARROW_LINE_SCALE : this.variant.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = this.strokeColor;
      ctx.shadowBlur = this.variant.glow;
      ctx.shadowColor = this.shadowColor;

      if (this.variant.traceAlpha) ctx.globalAlpha = this.variant.traceAlpha;
      if (this.variant.edgeFade) {
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.18, this.strokeColor);
        grad.addColorStop(0.82, this.strokeColor);
        grad.addColorStop(1, "transparent");
        ctx.strokeStyle = grad;
      }

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

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      this.renderLabels();
    }

    /**
     * Centroid sticks — one vertical line per peak, the conventional way a
     * mass spectrum is plotted. Reads as texture at divider scale.
     */
    renderStems() {
      const ctx = this.ctx;
      const { baselineY, plotHeight } = this;
      const scale = this.variant.intensityScale * plotHeight;

      ctx.save();
      ctx.globalAlpha = this.dividerAlpha != null ? this.dividerAlpha : this.variant.stemAlpha || 0.6;
      const stemColor = this.dividerStroke || this.strokeColor;
      if (this.variant.edgeFade) {
        const grad = ctx.createLinearGradient(this.spectrumZoneStart, 0, this.spectrumZoneStart + this.spectrumZoneWidth, 0);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(0.22, stemColor);
        grad.addColorStop(0.78, stemColor);
        grad.addColorStop(1, "transparent");
        ctx.strokeStyle = grad;
      } else {
        ctx.strokeStyle = stemColor;
      }
      ctx.lineWidth = this.variant.lineWidth;
      ctx.lineCap = "butt";
      ctx.beginPath();

      for (let p = 0; p < this.peaks.length; p++) {
        const peak = this.peaks[p];
        const sample = Math.round(peak.mz / this.mzStep);
        if (sample < 0 || sample > CONFIG.NUM_SAMPLES) continue;
        const h = this.peakIntensities[p] * this.envelope[sample] * scale;
        if (h < 0.6) continue;
        const x = Math.round(this.spectrumX[sample]) + 0.5;
        ctx.moveTo(x, baselineY);
        ctx.lineTo(x, baselineY - h);
      }

      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    /**
     * A plain rule, marked only at the five named m/z — the quietest option.
     */
    renderTicks() {
      const ctx = this.ctx;
      const { baselineY, plotHeight } = this;
      const scale = this.variant.intensityScale * plotHeight;
      const mzScale = 1 / CONFIG.MZ_RANGE;

      ctx.save();
      ctx.strokeStyle = this.dividerStroke || this.strokeColor;
      ctx.lineWidth = this.variant.lineWidth;
      ctx.lineCap = "butt";

      for (const label of this.labels || []) {
        const sample = Math.round(label.mz / this.mzStep);
        if (sample < 0 || sample > CONFIG.NUM_SAMPLES) continue;
        const dist = Math.abs(this.mouse.x - label.mz * mzScale);
        const near = Math.exp(-dist * dist * 90);
        const h = Math.max(4, this.peakIntensities[label.index] * scale);
        const x = Math.round(this.spectrumX[sample]) + 0.5;

        ctx.globalAlpha = 0.35 + near * 0.55;
        ctx.beginPath();
        ctx.moveTo(x, baselineY);
        ctx.lineTo(x, baselineY - h);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    }

    /**
     * Annotate the named peaks: a leader line from just above each apex up to
     * a mono label. Opacity rises as the mouse nears the peak, so pointing at
     * a region both boosts it and brings its name forward.
     */
    /**
     * Keyword fallback. When the banner is too narrow to annotate its own
     * peaks, the same words appear as chips beneath the hero so the reader
     * still gets them. Built once, then shown or hidden per resize.
     */
    syncLabelChips() {
      if (!this.variant.showLabels) return;
      const host = document.querySelector(CHIP_HOST_SELECTOR);
      if (!host) return;

      if (!host.childElementCount) {
        for (const peak of LABELLED_PEAKS) {
          const chip = document.createElement("span");
          chip.className = peak.accent ? "spectrum-chip spectrum-chip--accent" : "spectrum-chip";
          chip.textContent = peak.text;
          host.appendChild(chip);
        }
      }
      host.hidden = !this.labelsSuppressed;
    }

    renderLabels() {
      if (!this.variant.showLabels || this.labelsSuppressed) return;
      if (!this.labels || !this.labels.length) return;

      const ctx = this.ctx;
      const mzScale = 1 / CONFIG.MZ_RANGE;

      ctx.save();
      const uiSans = getComputedStyle(document.documentElement).getPropertyValue("--sans").trim() || "system-ui, sans-serif";
      // The accented keyword is set bold, matching the filled chip it becomes
      // once the banner is too narrow to annotate itself. 700 is loaded for the
      // sans purely for this (see google_fonts in _config.yml).
      const baseFont = "500 11.5px " + uiSans;
      const accentFont = "700 11.5px " + uiSans;
      ctx.font = baseFont;
      if ("letterSpacing" in ctx) ctx.letterSpacing = "0.11em";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      for (const label of this.labels) {
        const sample = Math.round(label.mz / this.mzStep);
        if (sample < 0 || sample > CONFIG.NUM_SAMPLES) continue;

        const x = this.spectrumX[sample];
        const apexY = this.spectrumY[sample];

        // Set before measuring: the bold face is wider, and that width drives
        // both the clearance span below and the centring above.
        ctx.font = label.accent ? accentFont : baseFont;

        // The label must clear everything under its text, not just the peak it
        // names — a neighbouring cluster can easily be taller within that span.
        label.width = ctx.measureText(label.text).width;
        const halfSpan = label.width / 2 + 6;
        const sampleStep = this.spectrumZoneWidth / CONFIG.NUM_SAMPLES;
        const reach = Math.ceil(halfSpan / sampleStep);
        let spanTop = apexY;
        for (let k = -reach; k <= reach; k++) {
          const j = sample + k;
          if (j < 0 || j > CONFIG.NUM_SAMPLES) continue;
          if (this.spectrumY[j] < spanTop) spanTop = this.spectrumY[j];
        }

        // Proximity of the pointer to this peak, 0..1.
        const dist = Math.abs(this.mouse.x - label.mz * mzScale);
        const near = Math.exp(-dist * dist * 90);
        // The others sit back at 0.42 until pointed at; the accented keyword
        // stays near full strength so it reads as the foreground one.
        const alpha = label.accent ? 0.88 + near * 0.12 : 0.42 + near * 0.58;

        const labelY = Math.max(this.variant.topMargin + 11, spanTop - 26);
        // The call-out stops at the top of whatever sits under the label — never
        // reaching down into a neighbouring cluster — and stays a short stub.
        const tickBottom = spanTop - 5;
        const tickTop = Math.max(labelY + 6, tickBottom - 20);

        if (tickBottom - tickTop >= 5) {
          ctx.globalAlpha = alpha * 0.5;
          ctx.strokeStyle = this.labelColor || this.strokeColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x, tickTop);
          ctx.lineTo(x, tickBottom);
          ctx.stroke();
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.labelColor || this.strokeColor;
        ctx.fillText(label.text, x, labelY);
      }

      ctx.globalAlpha = 1;
      ctx.restore();
    }

    init() {
      this.resize(); // paints synchronously

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
        if (now - lastMouseTime > 8) {
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
        this.strokeColor = readVar("--spectrum-stroke", CONFIG.STROKE_COLOR);
        this.fillColor = readVar("--spectrum-fill", CONFIG.FILL_COLOR);
        this.shadowColor = readVar("--spectrum-shadow", CONFIG.SHADOW_COLOR);
        this.axisColor = readVar("--spectrum-axis", "rgba(128,128,128,0.5)");
        this.labelColor = readVar("--spectrum-label", CONFIG.STROKE_COLOR);
        this.dividerStroke = readVar("--spectrum-divider-stroke", this.strokeColor);
        this.dividerAxis = readVar("--spectrum-divider-axis", this.axisColor);
        const da = parseFloat(readVar("--spectrum-divider-alpha", ""));
        this.dividerAlpha = Number.isFinite(da) ? da : null;
      });
      this.themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      window.addEventListener("resize", this.resizeHandler, { passive: true });

      // Static variants paint once per layout — no rAF loop, no pointer work.
      if (this.variant.static) return;

      // Reduced motion suppresses the ambient drift, but pointer response is a
      // direct answer to the reader's own gesture, so it stays.
      this.reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      if (this._ro) {
        this._ro.disconnect();
        this._ro = null;
      }
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }
  }

  // Initialize on DOM ready
  function initMassSpectrum() {
    document.querySelectorAll("canvas.mass-spectrum-canvas, #mass-spectrum-canvas").forEach((canvas) => {
      if (!canvas._massSpectrum) canvas._massSpectrum = new MassSpectrumBackground(canvas);
    });
  }
  window.initMassSpectrum = initMassSpectrum;
  window.createMassSpectrum = function (canvas) {
    if (!canvas) return null;
    if (canvas._massSpectrum) {
      canvas._massSpectrum.destroy();
      canvas._massSpectrum = null;
    }
    const inst = new MassSpectrumBackground(canvas, canvas.dataset.variant);
    canvas._massSpectrum = inst;
    if (typeof ResizeObserver !== "undefined") {
      inst._ro = new ResizeObserver(() => inst.resize());
      inst._ro.observe(canvas.parentElement || canvas);
    }
    return inst;
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMassSpectrum);
  } else {
    initMassSpectrum();
  }
})();
