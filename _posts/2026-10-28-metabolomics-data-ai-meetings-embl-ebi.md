---
layout: post
title: "Metabolomics Data and AI Meetings at EMBL-EBI, Hinxton"
date: 2026-10-28
description: Reflections on a week of metabolomics data and AI meetings at EMBL-EBI, and the questions I am leaving with.
tags: metabolomics AI FAIR ontologies standards
categories: conferences
thumbnail: assets/img/2026-10-hinxton/slide-1.webp
images:
  slider: true
---

Last week clearly demonstrated EMBL-EBI's coordinating power in biological data, with three back-to-back events relevant to metabolomics, hosted on campus.

Firstly, visitor [Janna Hastings](https://hastingslab.org/) (Idiap Research Institute) gave a fascinating seminar on grounding AI approaches with bio-ontologies, and presented her group's work on chemical language models and deep learning for classification of chemicals within the ChEBI ontology ([Glauer et al. 2024](https://doi.org/10.1039/d3dd00238a)).

Secondly, the MetaboLights team (credit to [Noemi Tejera](https://www.linkedin.com/in/noemi-tejera-phd/) & [Thomas Payne](https://www.linkedin.com/in/thomas-payne-3b293a29/) for organising) hosted the [ELIXIR Metabolomics Community](https://elixir-europe.org/communities/metabolomics)'s face-to-face meeting, followed by the [AIBIO-UK](https://aibio.ac.uk/) x MetaboLights workshop, with diverse attendance from across bioinformatics domains.

During the ELIXIR meeting, I presented an update on my work with the Proteomics Standards Initiative, to expand the Mass Spectrometry Controlled Vocabulary ([PSI-MS-CV](https://www.ebi.ac.uk/ols4/ontologies/ms)), in support of cross-repository mapping in the MetabolomicsHub. I then led a discussion on how we can build upon our recent addition to the PSI-MS-CV of chromatographic columns from the [RepoRT](https://doi.org/10.1038/s41592-023-02143-z) column database to improve the typically insufficient reporting of chromatographic methods in metabolomics.

Then, during the AIBIO-UK x MetaboLights meeting, I presented a brief overview of our thinking regarding AI integrations for the MetaboLights repository, to seed discussion in the following open session (slides below).

<swiper-container keyboard="true" navigation="true" pagination="true" pagination-clickable="true" pagination-dynamic-bullets="true" rewind="true">
  <swiper-slide><img src="{{ '/assets/img/2026-10-hinxton/slide-1.webp' | relative_url }}" alt="Title slide: MetaboLights × AI. How might AI shape open data in metabolomics? A starting point. AIBIO-MetaboLights Workshop, 2026-10-23." class="img-fluid rounded z-depth-1" loading="eager" width="1600" height="900"></swiper-slide>
  <swiper-slide><img src="{{ '/assets/img/2026-10-hinxton/slide-2.webp' | relative_url }}" alt="The tension we live with: 19 support requests per week and 1.5 to 3.0 person-days per week answering them. Rich, AI-ready metadata pulls against quick, low-effort submission, with submitters, reusers and curators each affected." class="img-fluid rounded z-depth-1" loading="lazy" width="1600" height="900"></swiper-slide>
  <swiper-slide><img src="{{ '/assets/img/2026-10-hinxton/slide-3.webp' | relative_url }}" alt="Three relationships between MetaboLights and AI: AI for dataset submission and operations; the repository as a substrate for AI reuse; the repository as training and evaluation data." class="img-fluid rounded z-depth-1" loading="lazy" width="1600" height="900"></swiper-slide>
  <swiper-slide><img src="{{ '/assets/img/2026-10-hinxton/slide-4.webp' | relative_url }}" alt="AI-facilitated submission in four steps: inputs, AI drafts, rules verify, people decide. AI proposes, rules verify, people decide." class="img-fluid rounded z-depth-1" loading="lazy" width="1600" height="900"></swiper-slide>
  <swiper-slide><img src="{{ '/assets/img/2026-10-hinxton/slide-5.webp' | relative_url }}" alt="Beyond submission, all prospective: retrospective curation, agent-ready access, AI-ready collections and annotation evidence." class="img-fluid rounded z-depth-1" loading="lazy" width="1600" height="900"></swiper-slide>
  <swiper-slide><img src="{{ '/assets/img/2026-10-hinxton/slide-6.webp' | relative_url }}" alt="Trade-offs: automation versus trust, openness versus protection, reuse at scale versus credit, data growth versus curation capacity. 50 to 78 percent top-1 accuracy of automatic ontology matching shows why curators stay in the loop." class="img-fluid rounded z-depth-1" loading="lazy" width="1600" height="900"></swiper-slide>
</swiper-container>

In my opinion, the quality of research presented and discussion was outstanding — due to this abundance I will avoid citing specific cases here as I couldn't possibly give a sensible overview.

I am writing here with some reflections across a very stimulating (and exhausting) week, in an attempt to draw out some of the overarching themes:

## AI-assisted submission: extraction, modelling and mapping

Every repository lives with a tension between rich, standardised metadata and quick, low-effort submission. AI offers a means to bridge this gap whilst improving reporting standards further.

AI proposes, rules verify, people decide. Three sub-tasks to note:

1. **Extraction.** Draft metadata from what the submitter already has: the manuscript, acquisition sequences, processing files and raw data. Deterministic readers come first.
2. **Representation.** Place each value in the right field of the data model, and validate with deterministic tools. Every field should record whether a person, a parser or a model produced it.
3. **Ontology mapping.** Language-model extractors with ontologies as context, map or shortlist terms for the formal description of metadata.

There are encouraging precedents. For example, the community [SDRF annotation repository](https://github.com/bigbio/sdrf-annotated-datasets) for ProteomeXchange datasets now holds AI-assisted annotations for more than 8,000 datasets from 18 human contributors, built with the agentic [sdrf-skills](https://github.com/bigbio/sdrf-skills) toolkit.

## Ontologies and knowledge graphs as ground truth for AI

As Janna argued, generative models are flexible but unreliable. Ontologies support reliable, reproducible inference based on community consensus, but they are brittle, incomplete, shaped by historical choices about scope and persistently under-funded. _Knowledge alignment_ may combine the two so that each covers the other's weakness.

## Questions I am leaving with

None of these is new, but the turn towards AI makes each more urgent.

1. **Vendors.** How can the PSI engage instrument vendors early enough to shape implementations? Would a dedicated vendor-liaison group help?
2. **FAIR at source.** How do we capture metadata where data are created, chromatographic methods included, instead of reconstructing it at deposition?
3. **Grand challenges.** What questions should metabolomics organise around, and how do they become well-posed AI tasks with benchmarks?
4. **Ground truth.** How do we make ontologies and knowledge graphs fit to ground AI, with logical axioms rather than bare labels, and with a putative annotation kept distinct from a confirmed identification?
5. **Submission.** Can AI make deposition easier without lowering its quality, and can we reinvest the saved effort in richer metadata?
6. **Agent access.** How do we open repository data to AI agents whilst preventing excessive bot traffic, maintaining the sustainability of the repository, and ensuring the authors are cited when their data are consumed in bulk?
7. **Annotation evidence.** How do we record the chain from spectrum to identity, using [mzTab-M](https://doi.org/10.1021/acs.analchem.8b04310) and the [identifier guidelines](https://doi.org/10.1007/s11306-026-02404-w) of Hajjar et al.?
8. **Sustainability.** Who maintains the ontologies that AI will rely on? [Ontology development is consensus creation](https://doi.org/10.3233/AO-220273), and consensus does not automate.

## What next

Several of these threads continue at the [de.NBI & ELIXIR-DE BioHackathon Germany](https://tess.elixir-europe.org/events/biohackathon-germany-2026) in Göttingen on 7–11 December, the [EuBIC-MS hackathon](https://eubic-ms.org/events/hackathon-2027/) in Gimo, Sweden, on 31 January–5 February 2027, and the [HUPO-PSI Spring Meeting](https://www.psidev.info/spring-meeting-2027) in Antwerp on 6–9 April 2027.

The MetaboLights team and I are actively pursuing the development of AI integrations, including a submission workflow.

If you are working on any of these questions, or think I have framed one wrongly, I would love to hear from you.
