export default class PDFJSWatcher {
  constructor () {
    window.PDFViewerApplication.eventBus.on(
      'textlayerrendered',
      this.pageRendered.bind(this)
    )
  }

  start () {}

  stop () {}

  setTaggerFunction (f) {
    this.tagger = f
  }

  pageRendered (event) {
    this.tagger(event.source.textDivs)
  }
}
