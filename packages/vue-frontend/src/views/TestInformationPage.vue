<license>
  Vertraulich
</license>

<template>
<div id="content">
  <MarkdownTextI18n :document="document" :site="site" />
</div>
</template>

<script>
import eventBus from '../eventbus'
import { mapGetters } from 'vuex'
import MarkdownTextI18n from '@/components/MarkdownTextI18n'
import { fetchSiteConfiguration, getSiteName } from 'site-configurations'
export default {
  name: 'TestInformationPage',
  components: {
    MarkdownTextI18n
  },
  created: async function () {
    const siteName = getSiteName() || 'default'
    const siteConf = await fetchSiteConfiguration(
      'http://127.0.0.1:8000?site=' + siteName
    )
    // create termer button
    var d = document
    var button = d.createElement('tingtun-termer-button-container')
    d.body.appendChild(button)
    button.id = 'tingtun-termer-button'
    var style = button.style
    style.position = 'fixed'
    style.top = '35px'
    style.right = '22px'
    style.zIndex = 99999999
    var script = d.createElement('script')
    var jsonScript = d.createElement('script')
    jsonScript.id = 'termer-custom-settings'
    jsonScript.type = 'application/json'
    jsonScript.innerHTML = '{"sourceNameViewOrder":[]}'
    d.body.appendChild(jsonScript)
    script.type = 'text/javascript'
    script.src = 'https://' + siteName + '.termer.no/glossaryjs/glossary.js'
    script.charset = 'utf-8'
    script.className = 'glossaryjs'
    script.dataset.site = siteName
    script.dataset.backends = siteConf.backends
    script.dataset.apikey = siteConf.apikeys.Termer
    script.id = 'tingtunGlossary'
    d.body.appendChild(script)
  },
  computed: {
    document () {
      return 'test_information/TestInformation_'
    },
    ...mapGetters(['site'])
  },
  methods: {
    openSettings () {
      eventBus.$emit('openSettings')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
#content
  padding: 1em
  background: var(--information-box-color)
  border: solid thin
  border-radius: 1em
  max-width: Max(30em, 55%)
  margin: auto
  margin-top: 2em

  &:empty
    display: none
</style>

<style lang="sass">
h1
  margin-top: 0em
</style>
