echo "
*
!lerna.json
!yarn.lock
!package.json
!packages/
packages/*/*
!packages/*/package.json" > .dockerignore
docker build -t termer-dependencies -f .meta/Dockerfile.dependencies --build-arg CI_PROJECT_DIR='termer' .

export LOVDATA_BACKEND=https://termer-production-termer-js-lovdata.api.termer.no
export DOMSTOL_BACKEND=https://termer-production-termer-js-domstol.api.termer.no
export LEXIN_BACKEND=https://termer-production-termer-js-lexin.api.termer.no
export ECB_BACKEND=https://termer-production-termer-js-ecb.api.termer.no
export SPRAKRADET_BACKEND=https://termer-production-termer-js-sprakradet.api.termer.no
export ICNP_BACKEND=https://termer-production-termer-js-icnp.api.termer.no
export SNL_BACKEND=https://termer-production-termer-js-snl.api.termer.no
export DSB_BACKEND=https://termer-production-termer-js-dsb.api.termer.no
export ECT_BACKEND=https://termer-production-termer-js-ect.api.termer.no
export FELLESKATALOGEN_BACKEND=https://termer-production-termer-js-felleskatalogen.api.termer.no
export NAOB_BACKEND=https://termer-production-termer-js-naob.api.termer.no
export FROM_IMAGE=termer-dependencies
export GIT_COMMIT_HASH=$(git rev-parse HEAD)
export GIT_COMMIT_DATE=$(git show -s --format=%ci ${gitCommitHash})
export VUE_APP_PUBLIC_PATH=/
export VUE_APP_PUBLIC_URL=""
export TERMER_STATS_SERVER=https://termer-termer-stats.api.termer.no/log
export TERMER_BACKEND=https://glossary.tingtun.no
export GLOSSARYJS_OUTPUT_SUBDIR=/
export GLOSSARYJS_PUBLIC_PATH=/glossaryjs/
export GLOSSARYJS_PUBLIC_URL=https://termer.no
export PDF_VIEWER_URL=https://termer.no/pdfjs/
echo ".git" > .dockerignore
docker build -t termer-build \
  -f .meta/Dockerfile.build \
  --build-arg FROM_IMAGE \
  --build-arg VUE_APP_PUBLIC_PATH \
  --build-arg TERMER_BACKEND \
  --build-arg GLOSSARYJS_OUTPUT_SUBDIR \
  --build-arg GLOSSARYJS_PUBLIC_PATH \
  --build-arg GLOSSARYJS_PUBLIC_URL \
  --build-arg TERMER_STATS_SERVER \
  --build-arg PDF_VIEWER_URL \
  --build-arg LOVDATA_BACKEND \
  --build-arg DOMSTOL_BACKEND \
  --build-arg LEXIN_BACKEND \
  --build-arg ECB_BACKEND \
  --build-arg SPRAKRADET_BACKEND \
  --build-arg SNL_BACKEND \
  --build-arg ICNP_BACKEND \
  --build-arg GIT_COMMIT_HASH \
  --build-arg GIT_COMMIT_DATE \
  --build-arg DSB_BACKEND \
  --build-arg ECT_BACKEND \
  --build-arg FELLESKATALOGEN_BACKEND \
  --build-arg NAOB_BACKEND \
  --build-arg VUE_APP_PUBLIC_URL \
  .
