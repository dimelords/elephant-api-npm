# elephant-api-npm

Generated Typsecript definitions for the Elephant API as a npm package.

## Install

Published to GitHub Packages, not npmjs, so the `@ttab` scope needs mapping. GitHub
Packages requires a token even for public packages, so an install without one fails
with a 401. In `.npmrc`:

```
@ttab:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```sh
npm install @ttab/elephant-api
```

