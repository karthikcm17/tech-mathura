TECH MATHURA WEBSITE (a Mathura Universe brand) — FINAL BUILD (plain HTML / CSS / JavaScript)

PAGES
  index.html     Home (hero, who we build for, 4 "what we build" chapters, services,
                 process, technologies, products, FAQ, quick enquiry)
  privacy.html   Privacy Policy (DPDP Act 2023 aligned) + Disclaimer
  about.html     About (story, mission & vision, values, why us, product family, who we serve)
  services.html  Services (8 service cards, Android app development, packages, FAQ)
  contact.html   Contact (contact details, full project form, next steps, FAQ)

SHARED FILES
  style.css      All styles + desktop / laptop / tablet / phone layouts
  script.js      3D particle scene, scroll animations, tabs, FAQ, menu, forms
  three.min.js   Three.js r149 (MIT licence, see three-LICENSE.txt)

OPEN IT LOCALLY
  In this folder run:  python -m http.server 8000   then open http://localhost:8000
  (or use VS Code "Live Server"). Fonts load from Google Fonts, so stay online.

TEST ON YOUR PHONE (same Wi-Fi)
  Run the server above, find your computer's IP (ipconfig / ifconfig),
  then open http://YOUR-IP:8000 on the phone.

ASSETS FOLDER (keep these exact names, inside a folder called "assets")
  assets/logo.png      Main logo (nav + footer). 908 x 200 px, transparent, trimmed tight.
                       Shown 40 px tall on desktop, 38 px tablet, 34 px phone.
  assets/favicon.svg   Browser-tab icon (TM tile from the logo).
  assets/favicon.png   512 x 512 home-screen icon for phones.
  assets/og-image.png  1200 x 630 preview shown when the link is shared on WhatsApp, LinkedIn etc.

SEO FILES
  CNAME        tech.mathurauniverse.com (tells GitHub Pages the address)
  robots.txt   lets search engines crawl the site and points them to the sitemap
  sitemap.xml  list of pages; submit it in Google Search Console after launch

ALREADY FILLED IN
  WhatsApp & phone  +91 78716 55111  (wa.me/917871655111)
  Email     mathurauniverse@gmail.com

  Enquiry form → Google Sheets: connected (FORM_ENDPOINT is set in script.js)
  Privacy policy: Grievance Officer and address filled in (section 14)

SAVE ENQUIRIES TO GOOGLE SHEETS (about 10 minutes, one time)
  1. Open https://sheets.new  and name the sheet "Tech Mathura Enquiries".
  2. In the sheet: Extensions > Apps Script. Delete the sample code, paste the whole
     of google-apps-script.gs (in this folder), click Save.
  3. Choose the function "setup" in the toolbar and click Run. Allow the permissions
     (Advanced > Go to project > Allow). An "Enquiries" tab with headers appears.
  4. Deploy > New deployment > gear icon > Web app
        Description: Website enquiries
        Execute as:  Me
        Who has access: Anyone
     Click Deploy and copy the "Web app URL" (ends with /exec).
  5. Open script.js, find  var FORM_ENDPOINT = '';  and paste the URL between the quotes:
        var FORM_ENDPOINT = 'https://script.google.com/macros/s/XXXX/exec';
  6. Upload the site again, submit a test enquiry. A new row appears in the sheet and an
     email arrives at mathurauniverse@gmail.com (turn off: NOTIFY_EMAIL = '' in the script).

  Columns saved: Submitted at · Form (Quick / Project enquiry) · Project · Budget · Name ·
                 Phone · Email · Company · Message · Consent · Page · Page URL
  If you edit the Apps Script later: Deploy > Manage deployments > edit > Version: New version,
  so the same URL keeps working.

HOW THE 3D WORKS
  Each section has data-k="x,y,scale,shape" (desktop) and data-km="..." (tablet/phone).
  Shapes: 0 sphere · 1 browser · 2 phone · 3 tech layers · 4 globe · 5 "TM".
  Change those numbers to move or swap the particle shape for any section.

LIVE ADDRESS: tech.mathurauniverse.com
  The CNAME file in this folder already holds tech.mathurauniverse.com.
  1. Push this folder to a GitHub repo -> Settings -> Pages -> deploy from main branch.
  2. At your domain registrar add a DNS record: Type CNAME, Host "tech", Value karthikcm17.github.io
  3. In GitHub Pages settings enter tech.mathurauniverse.com, wait for the check, tick "Enforce HTTPS".
  4. (Recommended) GitHub profile Settings -> Pages -> Verified domains -> verify mathurauniverse.com.
BRANDING: Tech Mathura is the brand shown on the site; Mathura Universe is the legal company
  (footer copyright, privacy policy, invoices and contracts).
