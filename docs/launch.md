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

## Initial launch result

Application source was pushed to main at `4f5c3864c667d15f21951d2e00e6928e162273be`. The tested production files were pushed to gh-pages at `778d5c733b094618b203a7f8478df603d200802e`, serving graph `5cda3bb3c29d199d`.

GitHub reports the branch-based [Pages build and deployment](https://github.com/gillooleyj/FedRAMP-Policy-Atlas/actions/runs/40981620394) completed successfully. Public URL: https://gillooleyj.github.io/FedRAMP-Policy-Atlas/. Direct HTTP/browser verification of that domain was blocked by this execution environment's network policy; no live-browser test is claimed. Project-prefix production validation passed 27 automated tests and 25 browser checks locally; the custom GitHub build job also succeeded.

The separate [main-branch deployment](https://github.com/gillooleyj/FedRAMP-Policy-Atlas/actions/runs/40981600231) built successfully but its deploy job was rejected: `Branch "main" is not allowed to deploy to github-pages due to environment protection rules.` The protection rule was not changed or bypassed. This does not affect the successful gh-pages publication.

For automatic official-action redeployments from main, the repository owner must allow main under Settings → Environments → github-pages → Deployment branches and tags, and select GitHub Actions as the Pages source, then rerun the deployment workflow. Until that is configured, the verified launch path is manual publication to gh-pages with `npm run build:pages` and `npm run deploy:pages`. The published website is available for feature evaluation now.

## Node 24 workflow update

The main-branch deployment at [run 40986494319](https://github.com/gillooleyj/FedRAMP-Policy-Atlas/actions/runs/40986494319) succeeded after the owner deployment configuration change and the Node 24 action upgrades. The earlier allowed-branch failure is historical. No deployment environment protections were changed by the agent. All direct JavaScript actions and the Pages uploader’s nested action now use verified Node 24 runtimes.
