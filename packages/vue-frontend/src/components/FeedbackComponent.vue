<template>
  <div>
    <button v-on:click='launchScript' :title=sendFeedBackText>Feedback</button>
  </div>
</template>
<script>
export default {
  name: 'FeedbackComponent',
  data () {
    return {
      localhost: 'http://localhost:3005' // NOTE: if the servers port is changed, change it here too.
    }
  },
  methods: {
    setDisplay: function () {
      const element = document.getElementById('titiPopupElement')
      element.style.display = 'block'
    },
    getLocation: function () {
      const url = window.location.origin
      if (url.indexOf('localhost') !== -1) {
        return this.localhost
      }
      return url
    },
    launchScript: function () {
      if (window.location !== window.parent.location) {
        window.parent.postMessage({
          msg: 'launch-titi',
          name: window.name
        }, '*')
      } else {
        var d = document
        var hasScript = d.querySelector('#titiFeedbackScript') !== null
        if (hasScript) {
          var popup = d.querySelector('#popupElement')
          popup.style.display = 'block'
          const feedbackFrame = document.getElementById('feedbackiframeID')
          const message = { datatype: 'Reload-TiTi' }
          feedbackFrame.contentWindow.postMessage(JSON.stringify(message), '*')
        } else {
          var script = d.createElement('script')
          script.type = 'text/javascript'
          script.src = 'https://feedback.termer.tingtun.no/api/script/feedback.js'
          script.charset = 'utf-8'
          script.className = 'feedbackjs'
          script.id = 'titiFeedbackScript'
          d.body.appendChild(script)
        }
      }
    }
  },
  computed: {
    originURL () {
      return this.scriptLinkPart1 + 'https://feedback.termer.tingtun.no' + this.scriptLinkPart2
    },
    sendFeedBackText () {
      return this.$t('Send in your feedback')
    }
  }
}
</script>
