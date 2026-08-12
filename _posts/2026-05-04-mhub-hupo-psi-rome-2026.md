---
layout: distill
title: "HUPO-PSI Spring Meeting, Rome"
description: 5–8<sup>th</sup> May 2026, Thoughts, Run-tourism, & MetabolomicsHub Poster
tags: metabolomics open-data standards hupo-psi metabolomicshub metabolights fair poster
date: 2026-05-12
featured: false

authors:
  - name: Jonathan E. Hunter
    url: "https://hunter.phd"
    affiliations:
      name: EMBL-EBI

toc:
  - name: Title, Authors & Summary
  - name: Introduction & Central Search Portal
  - name: Common Data Model & Chemical Identifiers
  - name: Contributions to PSI-MS-CV & Conclusions
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

Last week, I attended the <a href="https://www.psidev.info">HUPO-PSI</a> Spring Workshop at the National Research Council of Italy (CNR) in Rome.

It was a pleasure to meet colleagues including Eric Deutsch and Joshua Klein that I have worked with extensively online through my contributions
to the <a href="https://www.ebi.ac.uk/ols4/ontologies/ms">PSI-MS Controlled Vocabulary</a>.

The main auditorium, Sala Marconi, had a striking wrap-around mural reflecting Italian science. To me, this evoked thoughts of the Scientific Revolution and Age of Enlightenment and was an inspiring environment for discussion.

{% include figure.liquid path="assets/img/posts/2026-hupo-psi/Marconi_2.jpg" caption="Sala Marconi at CNR Italy, Image Source - <a href=\"https://www.cnr.it/\">https://www.cnr.it/</a>" %}

Another key focus, personally, were the <a href="https://www.psidev.info/mztab-specifications">mzTab-M</a> working group sessions, led by Nils Hoffmann & Philippine Louail. mzTab-M is an open data standard for the sharing of mass spectrometric metabolimics results, with much potential to streamline the data processing to open data repository workflow for researchers. I hope to continue to become more familiar with mzTab-M and contribute to this project in the future, alongside my EMBL-EBI Metabolomics colleague Ozgur Yurekten, who is already involved.

I gave a presentation in the 'Metabolomics Education' session, giving a brief introduction on MetaboLights study content and submission - rooted in the underlying ISA-Tab data model. This served as a prelude to Ozgur's hands-on workshop on 'mzTab-M to ISA-Tab to MetaboLights' study submission.

I also presented the below four page digital poster on the MetabolomicsHub, and was encouraged by the interest and discussion from the other attendees.

Last but not least, I snuck off Wednesday night to have a gentle run around Rome exploring many of the tourist hotspots:
{% include figure.liquid path="assets/img/posts/2026-hupo-psi/IMG_0862.jpeg" caption="Rome tourism run, Wednesday night!" %}

---

## Title, Authors & Summary {#title-authors-summary}

<div class="poster-page-iframe">
  <iframe src="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p1' | relative_url }}" loading="lazy" title="Poster page 1: Title and authors"></iframe>
</div>
<div class="poster-page-controls">
  <a href="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p1' | relative_url }}" target="_blank" rel="noopener noreferrer">Expand ↗</a>
</div>

---

## Introduction & Central Search Portal {#introduction-central-search-portal}

<div class="poster-page-iframe">
  <iframe src="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p2' | relative_url }}" loading="lazy" title="Poster page 2: Introduction and data flow"></iframe>
</div>
<div class="poster-page-controls">
  <a href="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p2' | relative_url }}" target="_blank" rel="noopener noreferrer">Expand ↗</a>
</div>

---

## Common Data Model & Chemical Identifiers {#common-data-model-chemical-identifiers}

<div class="poster-page-iframe">
  <iframe src="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p3' | relative_url }}" loading="lazy" title="Poster page 3: Portal CDM and ontology"></iframe>
</div>
<div class="poster-page-controls">
  <a href="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p3' | relative_url }}" target="_blank" rel="noopener noreferrer">Expand ↗</a>
</div>

---

## Contributions to PSI-MS-CV & Conclusions {#contributions-to-psi-ms-cv-conclusions}

<div class="poster-page-iframe">
  <iframe src="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p4' | relative_url }}" loading="lazy" title="Poster page 4: PSI-MS-CV contributions and conclusions"></iframe>
</div>
<div class="poster-page-controls">
  <a href="{{ '/assets/html/mhub-hupo-psi-2026/index.html#p4' | relative_url }}" target="_blank" rel="noopener noreferrer">Expand ↗</a>
</div>

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
