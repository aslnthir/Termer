# vue-frontend

> Frontend for Termer

The search page will then be at http://localhost:3000/#/search/, and
the direct lookup (without the search box) is at /#/lookup/<term>/.

Enable a backend in order to be able to use Termer. For instance, to
use the Jernbanetermer source from termwiki.sprakradet.no (which is
based on Semantic Mediawiki), add these query parameters (here shown
before URL percent-encoding):
- `backend={"url":"http://termwiki.sprakradet.no/api.php","type":"semanticmediawiki"}`
- `defaultSources=Jernbanetermer`
- `smwProps={"source":"Kategori","definition":"Definisjon"}`

Note that Cross-Origin requests may be blocked by the backend server. This can be solved by:
- Configuring the backend to send the Access-Control-Allow-Origin HTTP header with a value corresponding to the origin server (in this example, the origin is "localhost:3000",
- Serving the frontend from the same domain as the backend,
- (Developers only!) Disabling CORS restrictions in the browser using a browser extension^firefox[^firefox] ^chrome[^chrome]

[^chrome]: Chrome: [Allow-Control-Allow-Origin: \*](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi)
[^firefox]: Firefox: [cors everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```

### Run your end-to-end tests
```
yarn run test:e2e
```

### Run your unit tests
```
yarn run test:unit
```
