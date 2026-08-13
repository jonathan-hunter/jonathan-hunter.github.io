---
layout: page
permalink: /repositories/
title: repositories
description:
nav: true
nav_order: 4
---

{% if site.data.repositories.github_users %}

<!-- <div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for user in site.data.repositories.github_users %}
    {% include repository/repo_user.liquid username=user %}
  {% endfor %}
</div> -->

<img class="github-summary-stats only-light" src="https://raw.githubusercontent.com/jonathan-hunter/jonathan-hunter/main/profile/stats-light.svg" alt="GitHub Stats" />
<img class="github-summary-stats only-dark" src="https://raw.githubusercontent.com/jonathan-hunter/jonathan-hunter/main/profile/stats-dark.svg" alt="GitHub Stats" />

---

{% if site.repo_trophies.enabled %}
{% for user in site.data.repositories.github_users %}
{% if site.data.repositories.github_users.size > 1 %}

  <h4>{{ user }}</h4>
  {% endif %}
  <div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% include repository/repo_trophies.liquid username=user %}
  </div>

---

{% endfor %}
{% endif %}
{% endif %}

{% if site.data.repositories.github_repos %}

<div class="repositories d-flex flex-wrap flex-md-row flex-column justify-content-between align-items-center">
  {% for repo in site.data.repositories.github_repos %}
    {% include repository/repo.liquid repository=repo %}
  {% endfor %}
</div>
{% endif %}

<div class="repo-og-cards d-flex flex-wrap justify-content-start align-items-center">
  <a href="https://github.com/jonathan-hunter/Metabolomics-Pipeline" target="_blank" rel="noopener noreferrer">
    <img src="https://opengraph.githubassets.com/1/jonathan-hunter/Metabolomics-Pipeline" alt="jonathan-hunter/Metabolomics-Pipeline">
  </a>
  <a href="https://github.com/HUPO-PSI/psi-ms-CV" target="_blank" rel="noopener noreferrer">
    <img src="https://opengraph.githubassets.com/1/HUPO-PSI/psi-ms-CV" alt="HUPO-PSI/psi-ms-CV">
  </a>
</div>
