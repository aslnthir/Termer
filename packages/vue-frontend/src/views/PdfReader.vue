<license>
  Vertraulich
</license>

<template>
  <div ref="iframeDiv" id="iframeDiv" class="iframeDiv">
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'pdfViwer',
  data () {
    return {
      buttonText: 'Switch to PDF Viewer'
    }
  },
  metaInfo () {
    return {
      title: this.$t('PDF Viewer')
    }
  },
  mounted () {
    const iframe = document.createElement('iframe')
    const scriptUrl = this.glossaryScriptUrl
    const url = '/?site=' + this.site
    iframe.setAttribute('title', 'PDF')
    iframe.setAttribute('id', 'pdf-popup-frame')
    iframe.setAttribute('style', 'height: 100%; width: 100%;')
    iframe.setAttribute('name', 'termer-pdf-popup')
    iframe.src = url
    this.$refs.iframeDiv.appendChild(iframe)
    document.getElementById('pdf-popup-frame').show = function () {}
    document.getElementById('pdf-popup-frame').showContents = null
    this.fetchHtml().then(async html => {
      const frame = document.getElementById('pdf-popup-frame')
      const doc = frame.contentDocument
      await this.injectPdfViewer(doc, html)
      await this.waitForPdfJs(frame.contentWindow)
      await this.addBigOpenFileButton(doc)
      await this.addButtonScript(doc)
      await this.addTermerButtonPlaceholder(doc)

      const glossaryScript = document.createElement('script')
      // {# deliberately linking directly to glossary.js here #}
      // glossaryScript.src = window.location.origin + '/glossary.js'

      glossaryScript.src = scriptUrl
      glossaryScript.id = 'tingtunGlossary'
      doc.body.appendChild(glossaryScript)
    })
  },
  computed: {
    pdfViewerServerUrl () {
      if (window.location.origin === 'https://termer.x.tingtun.no') {
        return process.env.VUE_APP_PDF_VIEWER_URL
      } else {
        return window.location.origin +
        '/pdfjs/generic/'
      }
    },
    glossaryScriptUrl () {
      const domainURL = new URL(window.location.origin)
      if (domainURL.port === '3002') {
        domainURL.port = '3001'
        return domainURL.origin + '/glossaryjs/' + 'glossary.js'
      } else {
        return domainURL.origin +
        '/glossaryjs/' +
        'glossary.js'
      }
    },
    apikey () {
      return this.$store.state.Conf.apikey
    },
    pdfFile () {
      const filePath = this.$route.query.pdf
      return filePath
    },
    ...mapState(['site'])
  },
  methods: {
    async blobFromUrl (url) {
      const response = await fetch(url)
      if (!response.ok) throw new Error()
      return response.blob()
    },

    async waitForPdfJs (pdfJsWindow) {
      const doc = pdfJsWindow.document

      try {
        // Check if worker from object url from blob is supported before continuing.
        // eslint-disable-next-line
        new Worker(URL.createObjectURL(new Blob(['true;'])))

        const baseURI = doc.baseURI || doc.querySelector('base').href
        const blob = await this.blobFromUrl(baseURI + '../build/pdf.worker.js')
        const workerUrl = URL.createObjectURL(blob)
        pdfJsWindow.PdfJsWorkerSrc = workerUrl
      } catch (err) {
        console.log(err)
      }

      // Wait for PDFViewerApplication to appear.
      return new Promise(resolve => {
        this.waitForThenDo(
          () => typeof pdfJsWindow.PDFViewerApplication !== 'undefined' && !!doc.documentElement.dir,
          resolve,
          pdfJsWindow
        )
      })
    },
    waitForThenDo (test, act, win) {
      win = win || window
      // 16ms corresponds to about once every frame (at 60 FPS).
      const t = win.setInterval(fun, 16)
      function fun () {
        let result = false
        let error = null
        try {
          result = test()
        } catch (e) {
          // Abort in case of errors
          error = e
          result = true
        } finally {
          if (result) {
            win.clearInterval(t)
            act()
          }
        }
        if (error) throw error
      }
    },
    injectPdfViewer (containerDocument, viewerDocument) {
      return new Promise(resolve => {
        const doctype = viewerDocument.doctype

        containerDocument.open()
        containerDocument.write(viewerDocument.head.outerHTML)
        containerDocument.write(viewerDocument.body.outerHTML)
        containerDocument.close()
        containerDocument.insertBefore(doctype, containerDocument.documentElement)
        containerDocument.addEventListener('DOMContentLoaded', () => resolve(containerDocument))
      })
    },
    addBigOpenFileButton (document) {
      // TODO: Add translation link
      const innerText = this.$t('Click here to open a PDF document.')
      const helpText = this.$t('Click on underlined concepts to search for them. You can also select a concept and press enter to search for the term.')
      const el = `
      <div id="help-container" name="tingtun_not_mark">
        <button id="big-open-file-button" onclick="document.querySelector('#openFile').click()">
          ${innerText}
        </button>
        <p id="pdf-help-text">
        ${helpText}
        </p>
      </div>
      <style>
      #big-open-file-button:hover {
        background-color: #777777;
        border-color: #18587b;
      }
      #big-open-file-button:focus {
        background-color: #777777;
        border-color: #18587b;
        outline-color: white;
        outline-style: dashed;
        outline-width: 2px;
        outline-offset: -12px;
      }
      #big-open-file-button {
        text-align: center;
        padding: 2%;
        background-color: #474747;
        color: rgb(217, 217, 217);
        border: 0.5em solid #18587b;
        border-radius: 5px;
        font-size: 133%;
        cursor: pointer;
        width: 100%;
      }
      #help-container {
        margin: 2% auto 0 auto;
        position: fixed;
        left: 22%;
        width: 56%;
      }
      #pdf-help-text {
        margin-top: 1em;
        text-align: center;
        padding: 2%;
        color: rgb(217, 217, 217);
        border-radius: 5px;
        font-size: 133%;
      }
      #big-open-file-button::before {
        content: url(images/toolbarButton-openFile.png);
      }
      </style>
      `
      document.querySelector('#viewer').insertAdjacentHTML('beforeend', el)
    },
    addButtonScript (document) {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.text = `
         const button = document.querySelector('#big-open-file-button')
         const content = document.querySelector('#help-container')
         button.focus()
         document.querySelector('#fileInput')
           .addEventListener('change', function () { content.style.display = 'none' })
      `
      document.body.appendChild(script)
    },
    addTermerButtonPlaceholder (document) {
      const el = `
        <tingtun-termer-button-container
          id="tingtun-termer-button"
          data-tabindex="30">
        </tingtun-termer-button-container>
      `
      document
        .querySelector('#toolbarViewerRight')
        .insertAdjacentHTML('afterbegin', el)
    },
    fetchHtml () {
      const promise = new Promise((resolve, reject) => {
        const xhr = new window.XMLHttpRequest()
        xhr.open('GET', this.pdfViewerServerUrl + 'web/viewer.html')
        xhr.responseType = 'document'
        xhr.addEventListener('load', response => {
          const responseDoc = response.target.responseXML
          const base = responseDoc.createElement('base')
          base.href = this.pdfViewerServerUrl + 'web/'
          responseDoc.head.insertBefore(base, responseDoc.head.firstChild)

          resolve(responseDoc)
        })
        xhr.send()
      })
      return promise
    },
    copyScript (script, doc) {
      doc = doc || script.ownerDocument
      const scriptCopy = doc.createElement('script')

      // Edge: attributes (NamedNodeMap) is not iterable.
      // Therefore, use an old-style for loop here instead of `for … of`.
      const attributes = script.attributes
      for (let i = 0; i < attributes.length; i++) {
        const attribute = attributes[i]
        const key = attribute.name || attribute.nodeName
        const val = attribute.value || attribute.nodeValue
        if (key === 'src') continue
        scriptCopy[key] = val
      }

      // handle src separately, in order to get the absolute URI.
      scriptCopy.src = script.src

      // `data-` attributes must be handled separately.
      for (const key in script.dataset) {
        const val = script.dataset[key]
        scriptCopy.dataset[key] = val
      }

      // Setting src directly like this will automatically prepend the base.href
      // URL to the src (Firefox and Chrome, not IE11).
      // This is safer, as it ensures that the browser uses the correct URL.
      // As long as base.href is set, however, this is not needed, and we can use
      // copyAttr instead.
      //
      // if (script.src) s.src = script.src

      if (script.text) {
        scriptCopy.appendChild(doc.createTextNode(script.text))
      }

      // We can also tag each replaced script with a data-replaced="true" attribute,
      // to keep track of them.
      //
      // s.dataset.replaced = 'true'

      return scriptCopy
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
$buttonColor: #f0f0f0

.iframeDiv
  // position: absolute;
  // top: 40px;
  // left: 0;
  overflow: hidden
  z-index: 100
  flex-grow: 1
  display: flex
  flex-direction: column

::v-deep #pdf-popup-frame
  flex-grow: 1

.openButton
  border-radius: 0.5em
  box-shadow: none
  border-style: none
  padding: 0.05em
  padding-left: 1em
  padding-right: 1em
  height: 30px
  background-color: $buttonColor
  color: black
  margin-top: 5px
  margin-right: 1em
  min-width: 162px
  font-weight: bold

.pdf-popup-close-button,
.pdf-popup-close-button:link,
.pdf-popup-close-button:visited,
.pdf-popup-close-button:hover,
.pdf-popup-close-button:focus,
.pdf-popup-close-button:active
  position: absolute
  right: -1em
  top: -1em
  background-color: lightgrey
  color: black
  border: 4px solid white
  border-radius: 100em
  text-align: center
  text-decoration: none
  display: flex
  align-items: center

.pdf-popup-close-button-icon
  flex: 1
  font-weight: bold

</style>
