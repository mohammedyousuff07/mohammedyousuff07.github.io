# Mohammed Yousuf F — Cybersecurity Portfolio

This is a plain HTML, CSS, and JavaScript site with no build step. It follows a profile-first layout, with a responsive hero, skills, internship timeline, linked project cards, and a contact form.

## Publish with GitHub Pages

1. Create a GitHub repository for the site and upload the files in this folder (`index.html`, `styles.css`, `script.js`, and `profile-photo.jpeg`) to the repository root.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select the `main` branch and `/ (root)`, then save.
4. GitHub Pages will show the public site address in the same settings page after deployment finishes.

The page links to the GitHub repositories and LinkedIn profile supplied in the project brief, and uses the email address listed in the updated résumé. Check those details and replace anything that has changed before publishing. The project summaries stay within details present in the résumé and public repository pages; no performance numbers or unverified results are claimed.

## Motion and accessibility

- The project rail follows vertical scroll on larger screens and supports native horizontal touch scrolling on small screens.
- The navigation tracks the visible section; the top line shows page progress. The theme control switches between dark and light themes, and the menu opens on mobile.
- The contribution calendar requests public contribution data for the public GitHub username from `github-contributions-api.jogruber.de`. If that service is unavailable, the page shows a fallback link to GitHub.
- The contact form opens a prefilled email draft addressed to the résumé email. It does not send messages automatically or require a form-service account.
- Scroll-triggered reveals and hero parallax use browser APIs and CSS; reduced-motion preferences disable the animated effects.
