# Shreemvet Industries static site

This folder is ready to upload to GitHub Pages.

## Deploy

1. Create a new GitHub repository.
2. Upload all contents of this folder into the repository root.
3. Make sure the `github-ready` files stay at the root of the repo.
4. In GitHub, go to **Settings > Pages**.
5. Set **Source** to `Deploy from a branch`.
6. Choose the branch and `/ (root)` folder.
7. Save and wait for the site to publish.

## Notes

- `.nojekyll` is included so GitHub Pages serves the `_next` assets correctly.
- The site uses relative paths, so it works from a GitHub Pages project URL.
- Open `index.html` locally or use GitHub Pages after deployment.
