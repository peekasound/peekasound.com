# Peek-A-Sound Website

Minimal static one-page launch site for `peekasound.com`.

## Parameters

- `siteTitle`: `Peek-A-Sound`
- `contactEmail`: not shown until a public inbox is confirmed.
- `deploymentTarget`: GitHub Pages
- `requiredStatusChecks`: `Static site checks`
- `nodeVersion`: `24`
- `pagesBuildCommand`: `none`

## Local Preview

Open `index.html` in a browser. No backend service, API, database, server rendering, build step, secrets, or AWS dependency is required.

## Checks

```sh
node scripts/check-static-site.mjs
```

Pull requests and pushes to `main` run the same check in GitHub Actions.
