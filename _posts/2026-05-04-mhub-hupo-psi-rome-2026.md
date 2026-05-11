---
layout: distill
title: "International data exchange and data representation standards for metabolomics"
description: Digital poster presented at the HUPO-PSI Spring Meeting, Rome (4–8 May 2026). MetabolomicsHub's contributions to a Common Data Model and to PSI-MS-CV.
tags: metabolomics open-data standards hupo-psi metabolomicshub metabolights fair 
date: 2026-05-04
featured: false

authors:
  - name: Jonathan E. Hunter
    url: "https://hunter.phd"
    affiliations:
      name: EMBL-EBI

toc:
  - name: Overview
  - name: 01 — Title and authors
  - name: 02 — Standardising open data practices
  - name: 03 — Common Data Model (MHD) and ontologies
  - name: 04 — PSI-MS-CV contributions and conclusions
  - name: Full poster

_styles: >
  .poster-page-iframe {
    position: relative;
    width: 100%;
    padding-top: calc(1830 / 1080 * 100%); /* aspect ratio: poster page is 1080 x 1830 */
    overflow: hidden;
    background: #ffffff;
    border-radius: 6px;
    border: 1px solid var(--global-divider-color);
    margin: 0.5rem 0 0.25rem;
  }
  .poster-page-iframe iframe {
    position: absolute;
    top: 0; left: 0;
    width: 1080px;
    height: 1830px;
    border: 0;
    transform-origin: top left;
    /* JS sets transform: scale(...) on load and resize */
  }
  .poster-page-controls {
    display: flex;
    justify-content: flex-end;
    margin: 0.25rem 0 1.5rem;
    font-size: 0.85rem;
  }
  .poster-page-controls a {
    color: var(--global-theme-color);
    text-decoration: none;
  }
  .poster-page-controls a:hover {
    text-decoration: underline;
  }
---

## Overview

This post embeds the digital poster I co-authored and presented at the **HUPO-PSI Spring Meeting** in Rome (4–8 May 2026). It covers MetabolomicsHub's contributions to the field's data exchange and representation standards — a Common Data Model rooted in authoritative ontologies, and additions to the PSI-MS controlled vocabulary.

Each section below contains a single poster page rendered live from the source HTML. Use the **Expand** link under each panel to open that page full-size in a new tab; the **Full poster** link at the bottom of this post opens all four pages stacked.

---

## 01 — Title and authors {#01-title-and-authors}

<div class="poster-page-iframe">
  <iframe src="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p1' | relative_url }}" loading="lazy" title="Poster page 1: Title and authors"></iframe>
</div>
<div class="poster-page-controls">
  <a href="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p1' | relative_url }}" target="_blank" rel="noopener noreferrer">Expand ↗</a>
</div>

The opening page introduces the work and lists the international author team across EMBL-EBI (UK), UCSD (US), Chan Zuckerberg Biohub (US) and Forschungszentrum Jülich (DE).

---

## 02 — Standardising open data practices {#02-standardising-open-data-practices}

<div class="poster-page-iframe">
  <iframe src="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p2' | relative_url }}" loading="lazy" title="Poster page 2: Introduction and data flow"></iframe>
</div>
<div class="poster-page-controls">
  <a href="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p2' | relative_url }}" target="_blank" rel="noopener noreferrer">Expand ↗</a>
</div>

How MetabolomicsHub harmonises submissions from MetaboLights, Workbench, GNPS/MassIVE and Metabolomics Workbench into a single discovery surface — including the Central Search Portal with unified search, visual highlights, and an open API.

---

## 03 — Common Data Model (MHD) and ontologies {#03-common-data-model-mhd-and-ontologies}

<div class="poster-page-iframe">
  <iframe src="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p3' | relative_url }}" loading="lazy" title="Poster page 3: Portal CDM and ontology"></iframe>
</div>
<div class="poster-page-controls">
  <a href="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p3' | relative_url }}" target="_blank" rel="noopener noreferrer">Expand ↗</a>
</div>

The graph-based Common Data Model (MHD) underlying the portal, with chemical-identifier enrichment from ChEBI and other authoritative sources making cross-repository study comparison tractable.

---

## 04 — PSI-MS-CV contributions and conclusions {#04-psi-ms-cv-contributions-and-conclusions}

<div class="poster-page-iframe">
  <iframe src="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p4' | relative_url }}" loading="lazy" title="Poster page 4: PSI-MS-CV contributions and conclusions"></iframe>
</div>
<div class="poster-page-controls">
  <a href="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p4' | relative_url }}" target="_blank" rel="noopener noreferrer">Expand ↗</a>
</div>

The contributions back to the HUPO-PSI mass-spectrometry controlled vocabulary that this work has motivated, and a summary of where the project goes next.

---

## Full poster

<div class="poster-page-controls" style="justify-content: flex-start;">
  <a href="{{ '/assets/html/mhub-hupo-psi-2026/index.html' | relative_url }}" target="_blank" rel="noopener noreferrer">Open the full poster (all four pages) ↗</a>
</div>

<script>
// Scale each embedded poster page to fit its column width. The iframe content
// is fixed at 1080px wide; we apply `transform: scale(...)` so it fits the
// post's max-width with the correct aspect ratio retained by the wrapper's
// padding-top trick.
(function () {
  function scaleFrames() {
    document.querySelectorAll('.poster-page-iframe').forEach(function (wrap) {
      var iframe = wrap.querySelector('iframe');
      if (!iframe) return;
      var scale = wrap.clientWidth / 1080;
      iframe.style.transform = 'scale(' + scale + ')';
    });
  }
  window.addEventListener('load', scaleFrames);
  window.addEventListener('resize', scaleFrames);
  // Run immediately in case load already fired
  scaleFrames();
})();
</script>
