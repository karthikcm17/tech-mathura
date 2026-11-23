# Tech Mathura

**Websites & Android apps, built for everyone.**

The official website of **Tech Mathura**, a web and Android app development brand of **Mathura One Global**, based in Tiruchirappalli, Tamil Nadu, India.

🌐 **Live:** [tech.mathuraone.com](https://tech.mathuraone.com)

---

## About

Tech Mathura designs, builds and launches websites, web applications and Android apps in any technology for startups, small businesses, institutions and enterprises.

This repository contains the full source of the company website: a fast, static, multi-page site with an interactive 3D particle scene that changes shape as you scroll.

## Pages

| Page | Description |
|---|---|
| `index.html` | Home: services overview, what we build, process, technologies, products, FAQ, quick enquiry |
| `about.html` | Story, mission and vision, values, why choose us, who we serve |
| `services.html` | Eight services, packages, service FAQ |
| `android.html` | Android app development: features, native vs cross-platform, process, FAQ |
| `technologies.html` | Full technology stack, how we choose a stack, popular combinations |
| `contact.html` | Contact details, full project enquiry form, next steps |
| `privacy.html` | Privacy Policy and Disclaimer, aligned with India's DPDP Act, 2023 |

## Features

- **Scroll-driven 3D scene** built with Three.js and custom WebGL shaders; 18,000 particles morph between an idea, a browser, a phone, a tech stack, a globe and the TM monogram
- **Scroll animations**: pinned chapters, stacking service cards, horizontal process track and staggered reveals
- **Fully responsive** layouts for desktop, tablet and phone, with automatic quality scaling on slower devices
- **Enquiry forms** with validation, consent capture and spam protection, saved to Google Sheets
- **Privacy-first**: no cookies, no analytics and no third-party trackers
- **Accessible**: semantic HTML, keyboard navigation, visible focus states and reduced-motion support
- **Search and AI-ready**: local SEO for Trichy, canonical URLs, Open Graph previews, Schema.org structured data (organisation, services, FAQ, breadcrumbs), sitemap, robots.txt and llms.txt

## Tech stack

| Layer | Technology |
|---|---|
| Markup & styling | HTML5, CSS3 (no framework) |
| Scripting | Vanilla JavaScript (ES5+) |
| 3D graphics | [Three.js](https://threejs.org) r149, GLSL shaders |
| Fonts | Archivo, Instrument Sans, JetBrains Mono (Google Fonts) |
| Forms backend | Google Apps Script + Google Sheets |
| Hosting | GitHub Pages with a custom domain |

## Project structure

```
.
├── index.html
├── about.html
├── services.html
├── contact.html
├── privacy.html
├── style.css              # All styles and responsive layouts
├── script.js              # 3D scene, scroll engine, UI and forms
├── three.min.js           # Three.js r149
├── three-LICENSE.txt
├── google-apps-script.gs  # Enquiry form backend (Google Apps Script)
├── assets/
│   ├── logo.png           # Nav lockup (monogram + wordmark)
│   ├── logo-full.png      # Footer and documents
│   ├── favicon.svg
│   ├── favicon.png
│   └── og-image.png
├── 404.html
├── favicon.ico
├── sitemap.xml
├── robots.txt
├── llms.txt               # Plain-language summary for AI assistants
└── CNAME
```

## Run locally

No build step or dependencies are needed.

```bash
git clone https://github.com/karthikcm17/<repository-name>.git
cd <repository-name>
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Deployment

The site is deployed with **GitHub Pages** from the `main` branch. The `CNAME` file maps it to `tech.mathuraone.com`.

## Contact

- **Email:** [mathurauniverse@gmail.com](mailto:mathurauniverse@gmail.com)
- **Phone / WhatsApp:** [+91 78716 55111](https://wa.me/917871655111)
- **Location:** Tiruchirappalli, Tamil Nadu, India

## License

© 2026 Mathura One Global. All rights reserved.

The website content, design, logo and brand assets are proprietary and may not be copied or reused without permission. Three.js is used under the MIT License (see `three-LICENSE.txt`).
