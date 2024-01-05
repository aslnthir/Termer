<template>
    <div>
      <div id='demoContainer'>
        <div id='whiteBubble'>
          <div id ='demoContent'>
            <h1> {{ $t('Welcome to Termer') }}! </h1>
                <MarkdownTextI18n
                :document = 'demoDoc'
                />
            </div>
        </div>
      </div>
    </div>
</template>
<script>
import MarkdownTextI18n from '@/components/MarkdownTextI18n'
export default {
  components: {
    MarkdownTextI18n
  },
  data () {
    return {
      demoDoc: 'DemoUkrainian'
    }
  },
  created () {
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
    script.src = 'https://termer.no/glossaryjs/glossary.js?site=ukrainian'
    script.charset = 'utf-8'
    script.className = 'glossaryjs'
    script.dataset.site = 'ukrainian'
    script.dataset.backends = 'WikipediaBackend,Termer,LovdataBackend,LexinBackend,NavBackend,SnlBackend,EctBackend'
    script.dataset.apikey = 'ukrainian'
    script.id = 'tingtunGlossary'
    d.body.appendChild(script)
  }
}
</script>

<style lang="sass" scoped>
// Use sass style and scoped when writeing css
#whiteBubble
  background: white
  border: 2px solid black
  border-radius: 10px
  margin: 5vh

#demoContent
  padding-left: 10vw
  padding-right: 10vw
  padding-bottom: 43vh

@media (max-width: 450px)
  #whiteBubble
    margin: 1vh
    margin-top: 4vh

  #demoContent
    padding-left: 2vw
    padding-right: 2vw
    padding-bottom: 2vh
</style>

<style lang="sass">
.helpVideo
  width: 100%

.instructVideo
  width: 50%
  display: inline
</style>
