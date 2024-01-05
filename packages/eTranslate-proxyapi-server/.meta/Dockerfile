ARG FROM_IMAGE
FROM $FROM_IMAGE

ARG ECT_BACKEND

ENV ECT_BACKEND=$ECT_BACKEND

CMD cd packages/eTranslate-proxyapi-server && \
  yarn run serve
