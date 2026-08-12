// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "publications",
          description: "Publications by categories in reversed chronological order.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-news",
          title: "news",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/news/";
          },
        },{id: "nav-posts",
          title: "posts",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "post-metabolights-and-aibio-uk-workshop",
        
          title: "MetaboLights and AIBIO-UK workshop",
        
        description: "Come visit EBI and join the discussion on the use of AI to further the metabolomics field",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/metabolights-aibio-uk-ai-workshop/";
          
        },
      },{id: "post-hupo-psi-spring-meeting-rome",
        
          title: "HUPO-PSI Spring Meeting, Rome",
        
        description: "5–8th May 2026, Thoughts, Run-tourism, &amp; MetabolomicsHub Poster",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2026/mhub-hupo-psi-rome-2026/";
          
        },
      },{id: "news-thrilled-to-share-our-latest-publication-in-the-journal-𝘚𝘤𝘪𝘦𝘯𝘤𝘦",
          title: 'Thrilled to share our latest publication, in the journal 𝘚𝘤𝘪𝘦𝘯𝘤𝘦.',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_2/";
            },},{id: "news-congratulations-to-dr-benjamin-van-mooy-my-postdoctoral-supervisor-and-mentor-on-his-award-of-a-prestigious-macarthur-fellowship-informally-known-as-the-genius-grant",
          title: 'Congratulations to Dr. Benjamin Van Mooy, my postdoctoral supervisor and mentor on his...',
          description: "",
          section: "News",},{id: "news-take-a-look-at-my-case-study-metabolomics-data-processing-pipeline-including-modern-methods-such-as-deep-learning-based-peak-filtering-neatms-and-gpu-accelerated-spectral-database-searching-simms",
          title: 'Take a look at my case study metabolomics data processing pipeline including modern...',
          description: "",
          section: "News",},{id: "news-i-am-delighted-to-announce-i-have-joined-the-proteomics-amp-amp-metabolomics-team-at-the-european-bioinformatics-institute-embl-ebi-as-a-scientific-database-curator",
          title: 'I am delighted to announce I have joined the Proteomics &amp;amp;amp; Metabolomics team...',
          description: "",
          section: "News",},{id: "news-happy-to-be-recognised-as-quot-co-author-of-the-winning-national-champion-39-s-research-article-for-the-frontiers-planet-prize-quot",
          title: 'Happy to be recognised as &amp;quot;Co-author of the winning National Champion&amp;#39;s research article...',
          description: "",
          section: "News",handler: () => {
              window.location.href = "/news/announcement_5/";
            },},{
        id: 'social-cv',
        title: 'CV',
        section: 'Socials',
        handler: () => {
          window.open("/assets/pdf/JEH-CV.pdf", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%77%65%62-%65%6E%71@%68%75%6E%74%65%72.%70%68%64", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/jonathan-hunter", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/jonathan-hunter-a75540a3", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0003-3830-1055", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=qIGWQdwAAAAJ", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
