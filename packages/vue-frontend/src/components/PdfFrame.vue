<license>
  Vertraulich
</license>

<template>
  <div class="inlineClass">
    <button v-on:click="toggleHidden" class="openButton">{{buttonText}}</button>
    <div id="iframeDiv" class="iframeDiv">
      <iframe id="pdf-popup-frame" title="PDF" :src="pdfUrl">
      </iframe>
    </div>
  </div>
</template>

<script>

export default {
  name: 'pdfViwer',
  data () {
    return {
      buttonText: 'Switch to PDF Viewer'
    }
  },
  computed: {
    pdfUrl () {
      let url = '/pdfviewer?button=false&openfile=true'
      if (this.pdfFile) {
        url += '&pdf=' + this.pdfFile
      }
      return url
    },
    pdfFile () {
      const filePath = this.$route.query.pdf
      return filePath
    }
  },
  methods: {
    toggleHidden () {
      const divFrame = window.document.getElementById('iframeDiv')
      if (divFrame.style.visibility === 'visible') {
        this.closePdfViewer()
      } else {
        this.openPdfViewer()
      }
    },
    openPdfViewer () {
      const divFrame = window.document.getElementById('iframeDiv')
      divFrame.style.visibility = 'visible'
      this.buttonText = 'Switch to Search'
    },
    closePdfViewer () {
      const iframe = window.document.getElementById('iframeDiv')
      iframe.style.visibility = 'hidden'
      this.buttonText = 'Switch to PDF Viewer'
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
$buttonColor: #f0f0f0

.iframeDiv
  position: absolute
  height: 96%
  width: 100%
  top: 40px
  left: 0
  overflow: hidden
  visibility: hidden
  z-index: 100

#pdf-popup-frame
  height: 100%
  width: 100%

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
