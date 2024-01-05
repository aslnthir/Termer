<template>
  <div>
    <div v-for="(item, index) in questions" v-bind:key="index" class="faqItemContainer">
      <div class="faqItem">
        {{ item }}?
      </div>
    </div>
    <div class="bottomSpacer">

    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      questions: null
    }
  },
  mounted () {
    // redirect if not on faq subdomain
    if (window.location.href.indexOf('kildebruk') === -1) {
      const wl = window.location
      window.location.href = wl.protocol + '//' + wl.host
    }
    // get data from API
    fetch('https://glossary.tingtun.no/glossary2/glossaries/5101/wordlist/?sourcetype=sourcedescription&sources=364&api=kildebruk,kildebruk')
      .then((response) => response.json())
      .then(data => (this.questions = data.wordlist.sort()))
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
    script.src = 'https://kildebruk.termer.no/glossaryjs/glossary.js'
    script.charset = 'utf-8'
    script.className = 'glossaryjs'
    script.dataset.site = 'kildebruk'
    script.dataset.backends = 'WikipediaBackend,Termer,LovdataBackend,LexinBackend,IcnpBackend,NavBackend,SnlBackend,EctBackend,FelleskatalogenBackend'
    script.dataset.apikey = 'kildebruk'
    script.id = 'tingtunGlossary'
    d.body.appendChild(script)
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style>
  .faqItem{
    background-color: transparent;
    padding: 10px;
    font-size: 120%;
  }
  .bottomSpacer{
    height: 200px;
  }
</style>
