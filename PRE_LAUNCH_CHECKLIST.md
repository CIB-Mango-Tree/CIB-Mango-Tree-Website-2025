# 🚀 Website Pre-Launch Checklist

> **Last Updated:** February 5, 2026  
> **Status:** Pre-Launch  
> **Purpose:** Track all tasks needed before launching the CIB Mango Tree website

---

## 📥 Download Files

### GitHub Releases
- [ ] Create GitHub releases with downloadable files:
  - [ ] `mango-tree-windows.exe` (Windows 64-bit)
  - [ ] `mango-tree-macos-intel.dmg` (macOS Intel)
  - [ ] `mango-tree-macos-silicon.dmg` (macOS Apple Silicon)
- [ ] Verify GitHub release URLs match the download page:
  - Windows: `https://github.com/civictechdc/cib-mango-tree/releases/latest/download/mango-tree-windows.exe`
  - macOS Intel: `https://github.com/civictechdc/cib-mango-tree/releases/latest/download/mango-tree-macos-intel.dmg`
  - macOS Silicon: `https://github.com/civictechdc/cib-mango-tree/releases/latest/download/mango-tree-macos-silicon.dmg`
- [ ] Test all download links to ensure files download correctly
- [ ] Add file sizes to download page (currently missing in code)

---

## 🔗 Missing Links

### Social Media Links
- [ ] **Footer - Instagram**: Currently `href="#"` → Add actual Instagram URL
- [ ] **Footer - LinkedIn**: Currently `href="#"` → Add actual LinkedIn URL

### Content Links
- [ ] **About Page - GW Open Source Conference**: Currently `link: '#'` → Add actual URL when available

### Link Verification
- [ ] Verify all external links are working:
  - [ ] GitHub repository links
  - [ ] Slack workspace links (`https://codefordc.slack.com`)
  - [ ] Documentation links (`https://civictechdc.github.io/cib-mango-tree`)
  - [ ] Medium blog links
  - [ ] External resource links (research papers, tools)
  - [ ] Civic Tech DC links (`https://www.civictechdc.org/donate`, `https://lu.ma/civictechdc`)

---

## 🌐 Hosting & Deployment

### Hosting Platform Setup
- [ ] Choose hosting platform (Netlify, Vercel, GitHub Pages, etc.)
- [ ] Configure build settings:
  - [ ] Build command: `npm run build`
  - [ ] Output directory: `dist`
  - [ ] Node version: Specify in `.nvmrc` or `package.json` engines field
- [ ] Set up custom domain (if applicable):
  - [ ] Configure DNS records
  - [ ] Set up SSL certificate (usually automatic)
- [ ] Configure environment variables (if needed)
- [ ] Test production build locally: `npm run build && npm run preview`
- [ ] Set up continuous deployment (connect Git repository)
- [ ] Test deployed site on multiple devices/browsers

---

## 📧 Content & Functionality

### Newsletter Integration
- [ ] Connect newsletter form to email service (Mailchimp, ConvertKit, etc.)
- [ ] Test email signup functionality
- [ ] Add privacy policy link/notice for email collection
- [ ] Verify form submission works end-to-end

### GitHub Activity Widget
- [ ] Implement live GitHub activity feed (currently placeholder in `GitHubActivity.astro`)
- [ ] Verify GitHub API access/tokens if needed
- [ ] Test widget displays recent commits/issues correctly

### Images & Assets
- [ ] Verify all images load correctly:
  - [ ] Blog placeholder images
  - [ ] CLI screenshot (`CLI_Image_CIB.png`)
  - [ ] Logo (`logo.png`)
  - [ ] Team meeting photo (`team-meeting.jpg`)
  - [ ] News images
  - [ ] Animation GIFs
- [ ] Optimize large images for web performance

### Content Verification
- [ ] Check all citations and sources:
  - [ ] Verify statistic sources are accessible
  - [ ] Add missing citation for "33% Bot accounts spreading misinfo" statistic (currently marked as `[CITATION NEEDED]` in `SITE_CONTENT.md`)
- [ ] Review all copy for typos and consistency

---

## 🔧 Technical

### SEO Optimization
- [ ] Add meta descriptions to all pages
- [ ] Add Open Graph tags for social sharing
- [ ] Verify favicon (`public/favicon.svg`) is correct
- [ ] Create `sitemap.xml`
- [ ] Create `robots.txt`

### Performance
- [ ] Optimize images (compress large images)
- [ ] Test page load speeds (use Lighthouse)
- [ ] Enable compression/gzip on hosting platform
- [ ] Check bundle sizes

### Accessibility
- [ ] Run accessibility audit (WAVE, Lighthouse, axe DevTools)
- [ ] Ensure all images have descriptive alt text
- [ ] Test keyboard navigation
- [ ] Check color contrast ratios (WCAG AA compliance)
- [ ] Test with screen reader

### Browser Testing
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)
- [ ] Test on mobile devices (iOS Safari)
- [ ] Test on mobile devices (Android Chrome)
- [ ] Test responsive design at different breakpoints (mobile, tablet, desktop)

---

## 📄 Documentation & Legal

### Legal Pages
- [ ] Add license information to footer (currently says `[Insert licensing here]` in `SITE_CONTENT.md`)
- [ ] Create Privacy Policy page (required if collecting emails)
- [ ] Create Terms of Service page (if needed)
- [ ] Add links to legal pages in footer

### Project Documentation
- [ ] Update `README.md` with:
  - [ ] Project description
  - [ ] Deployment instructions
  - [ ] Development setup guide
  - [ ] Contributing guidelines
- [ ] Document hosting/deployment process for team

---

## ✅ Pre-Launch Testing

### Functionality Testing
- [ ] Test all navigation links (internal and external)
- [ ] Test all forms (newsletter signup)
- [ ] Test all download buttons
- [ ] Verify 404 page exists and works
- [ ] Check for broken links (use a link checker tool like [W3C Link Checker](https://validator.w3.org/checklink))
- [ ] Test search functionality (if applicable)
- [ ] Verify analytics tracking (if applicable)

### Content Review
- [ ] Proofread all text content
- [ ] Verify all dates are correct
- [ ] Check all contact information
- [ ] Review all external links for relevance

---

## 🚨 Priority Items (Must Complete Before Launch)

1. **Download Files** - Users can't download the software without these
2. **Missing Social Links** - Footer has placeholder links that need real URLs
3. **Hosting Setup** - Site needs to be live and accessible
4. **Newsletter Integration** - Form needs to actually work
5. **License Information** - Legal requirement for open source project

---

## 📝 Post-Launch Tasks

- [ ] Monitor error logs
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom, etc.)
- [ ] Create backup strategy
- [ ] Document deployment process for team
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor analytics and user behavior

---

## 📌 Notes

- Check `SITE_CONTENT.md` for content source of truth
- All placeholder links are marked with `href="#"` in the code
- Download URLs are configured in `src/pages/download.astro`
- Social links are in `src/components/Footer.astro`

---

## 👥 Assignments

*Add team member names next to tasks as they're assigned:*

- Download files: ________________
- Hosting setup: ________________
- Newsletter integration: ________________
- Link verification: ________________
- Testing: ________________

---

**Last Review Date:** _______________  
**Next Review Date:** _______________
