# Public website launch

Target: https://gillooleyj.github.io/FedRAMP-Policy-Atlas/

The application supports project-subdirectory hosting. Graph/status/report requests, graph export, navigation, and generated JavaScript/CSS paths use the same Vite base. The 3D design is unchanged.

## Build and publish

```sh
npm ci
npm run lint
npm test
npm run build:pages
```

The GitHub Actions workflow `deploy-pages.yml` builds/tests the source and deploys the resulting Pages artifact on main-branch pushes or manual runs. Configure repository **Settings → Pages → Build and deployment → Source → GitHub Actions**. The workflow uses GitHub's built-in deployment identity; no application secret is needed. Pages availability depends on the repository/account plan and organization policy. A repository/environment protection rule may require a deployment approval.

For an initial branch-based publication or manual fallback, `npm run deploy:pages` publishes the already built `dist` content to `gh-pages` using the existing Git authorization. It does not check out another worktree or overwrite source files. It refuses non-fast-forward conflicts. For this mode, set Pages source to **Deploy from a branch**, branch **gh-pages**, folder **/(root)**. Choose one Pages source mode; for automatic deployment from future main changes, use GitHub Actions and its deployment workflow. A GitHub Actions GITHUB_TOKEN push to a branch is not a substitute for the official Pages deployment action.

Before enabling Pages or declaring the URL live, confirm the publication result. A successful Git push alone does not prove that GitHub has built and served the site.

## Verification

The production browser suite can target the project path:

```sh
npm run preview -- --port 4183 --base=/FedRAMP-Policy-Atlas/
ATLAS_URL=http://127.0.0.1:4183/FedRAMP-Policy-Atlas npm run test:e2e
ATLAS_URL=http://127.0.0.1:4183/FedRAMP-Policy-Atlas npm run test:updates:e2e
```

After public deployment, verify the home page, selected-KSI deep link, graph and status files under the project path, mobile navigation, graph export, source citations, and the active graph revision. For the manual branch publication, `deployment.json` records the source commit and active graph version. GitHub Pages can take several minutes to become available.

This launch publishes the current validated snapshot. The daily checker stages source changes for review; it does not silently promote new regulatory data. Connecting the recurring publishing agent remains a separate operational build goal. GitHub Pages/CDN caching may delay freshness changes, so live revision verification remains necessary.
