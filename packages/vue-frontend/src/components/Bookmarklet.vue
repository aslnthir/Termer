<template>

<div>
  <div>
      <!--<h1>
        test {{browserIsMobile}} {{useragent}}
      </h1>-->
  </div>
  <div class="bookmarkletAndPopup">
    <div class="bookmarkletDiv">
      <div v-if="browserIsMobile">
      <!--<div v-if="true">-->
          <t-button>
            <a class="bookmarkletlink tooltip-btn"
              :href="scriptString"
              onclick="return false;"
              v-on:click="copyToClipboard(scriptString)"
              :data-tooltip='$t("Tap this button to copy the TERMER script as the first step in the installation")'
            >
              {{termerName}}
            </a>
          </t-button>
        </div>
      <div v-else>
          <t-button>
            <a class="bookmarkletlink" :href="scriptString" onclick="return false;" v-on:click="showInstructions = true;" >{{termerName}}</a>
          </t-button>
      </div>
  </div>

    <div id="instructionPopUp" v-if="showInstructions">
      <div v-if="browserIsFireFox">
        {{$t('Right-click on the button labelled ‘INSITU - TERMER’ and select "Bookmark link" from the menu.')}}
      </div>
      <div v-else>
        {{$t('Drag and drop the button labeled Termer-button to your bookmarks bar. Press Ctrl-Shift-B to show or hide the bookmarks bar.')}}
      </div>
      <button type="button" @click="showInstructions = false"> OK </button>
    </div>
  </div>
  <button
    v-show="showConfButton"
    style="margin-top: 1em"
    type="button"
    name="button"
    @click="showConfigureBookmarklet">
    {{$t('Configure Bookmarklet')}}
  </button>
  <div v-if="showConfBookmarklet">
    <div class="configBox">
      {{$t('Site configuration')}}:
      <br>
      <select v-model="selectedSite">
        <option v-for="site in sitesAvaileble" :key="site">{{site}}</option>
        <option key="default">default</option>
      </select>
    </div>
    <div class="configBox">
      {{$t('Backends')}}:
      <br>
      <select v-model="selectedBackends" multiple>
        <option
          v-for="backend in availableBackends"
          :key="backend">
          {{backend}}
        </option>
      </select>
    </div>
    <div class="configBox">
      {{$t('API Key')}}:
      <br>
      <input type="text" name="" v-model="apikey">
    </div>
  </div>
</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { getAvalebleSites, fetchSiteConfiguration, getSiteName } from 'site-configurations'

export default {
  name: 'Bookmarklet',
  props: {},
  data () {
    return {
      emptyBarAltText: this.$t('Empty bookmarklet bar with a red cirle to highlight it.'),
      TermerBarAltText: this.$t('Bookmarks bar with TERMER'),
      activateAltText: this.$t('Website with TERMER activated. 1. Click bookmarklet. 2. TERMER button appears'),
      apikey: '',
      sourceType: this.$route.query.sourcetype,
      showkeyboardInstructions: null,
      showConfBookmarklet: false,
      selectedBackends: [],
      selectedSite: '',
      sitesAvaileble: getAvalebleSites(),
      siteConfig: {},
      jsonScript: '',
      showInstructions: false,
      useragent: navigator.userAgent
    }
  },
  created: async function () {
    const siteName = getSiteName() || 'default'
    this.selectedSite = siteName
    const siteConf = await fetchSiteConfiguration(
      'http://127.0.0.1:8000?site=' + siteName
    )
    if (siteConf) {
      if (siteConf.apikeys && 'Termer' in siteConf.apikeys) {
        this.apikey = siteConf.apikeys.Termer
      }
      if (siteConf.backends) {
        this.selectedBackends = siteConf.backends
      }
      this.siteConfig = siteConf
    }
  },
  computed: {
    loaderScript () {
      const url = new URL(window.location.href)
      if (url.port === '3002') {
        url.port = '3001'
        return new URL(
          url.origin + '/glossary.js'
        )
      } else if (window.location.origin.indexOf('termer.x.tingtun') !== -1) {
        return new URL(
          window.location.origin + '/termer-js/glossaryjs/glossary.js'
        )
      } else {
        return new URL(
          window.location.origin + '/glossaryjs/glossary.js'
        )
      }
    },
    termerName () {
      if (getSiteName()) {
        return getSiteName().toUpperCase() + ' - ' + this.$t('TERMER')
      } else {
        return this.$t('TERMER')
      }
    },
    showConfButton () {
      if ('Termer' in this.backends) {
        const termerBackend = this.backends.Termer
        const login = termerBackend.config.authenticated.data
        return login
      } else {
        return false
      }
    },
    backendsString () {
      return this.selectedBackends.join(',')
    },
    scriptString () {
      const f = `(function%20f(){var%20d = document;
        var%20hasScript = d.querySelector("#tingtunGlossary") !== null;
        var%20isTingtunLookup = -1 < (
            d.head.querySelector('[name=keywords]') || {content: ''}
          ).content.split(',').indexOf('tingtunlookup');
        if(hasScript || isTingtunLookup){
          window.alert('${this.$t('Termer is already activated on this page')}');
          return;
        }
        var button = d.createElement("tingtun-termer-button-container");
        d.body.appendChild(button);
        button.id = "tingtun-termer-button";
        var style = button.style;
        style.position = "fixed";
        style.top = "10px";
        style.right = "10px";
        style.zIndex = 99999999;
        var script = d.createElement("script");` +
        this.jsonScript +
        `
        ${this.sourceType ? 'script.dataset.sourceType = "sourcedescription";' : ''}
        script.type = "text/javascript";
        script.src = "${'https://termer.no/glossaryjs/glossary.js'}";
        script.charset = "utf-8";
        script.className = "glossaryjs";
        script.dataset.site="${this.selectedSite}";
        script.dataset.backends="${this.backendsString}";
        script.dataset.apikey="${this.apikey}";
        script.id = "tingtunGlossary";
        d.body.appendChild(script);
      })()
      `
      return 'javascript:' +
        f.replace(/ = /g, '=')
          .replace(/ !== /g, '!==')
          .replace(/\n/g, '')
          .replace(/  +/g, ' ')
          .replace(/; /g, ';')
    },
    browserIsFireFox () {
      return this.browserType === 'Firefox'
    },
    browserIsMobile () {
      return /Mobi/i.test(navigator.userAgent)
      // return this.browserType
    },
    browserType () {
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // true for mobile device
        return true
      } else {
        // false for not mobile device
        return false
      }
    },
    ...mapState('Termer', ['availableBackends', 'backends']),
    ...mapGetters(['site'])
  },
  metaInfo () {
    return {
      title: this.site === 'kildebruk' ? 'Kildebruk – TERMER' : this.$t('Install Bookmarklet')
    }
  },
  methods: {
    changeKeyboardInstructions (what) {
      if (this.showkeyboardInstructions === what) {
        this.showkeyboardInstructions = null
      } else {
        this.showkeyboardInstructions = what
      }
    },
    showConfigureBookmarklet () {
      this.showConfBookmarklet = !this.showConfBookmarklet
    },
    initialSelectedBackends () {
      const selected = []
      if (this.$route.query.backends) {
        this.$route.query.backends.split(',').forEach(x => {
          selected.push(x)
        })
      } else {
        selected.push('Termer')
        selected.push('BrowserBackend')
        selected.push('WikipediaBackend')
        selected.push('LexinBackend')
      }
      return selected
    },
    copyToClipboard (script) {
      alert(this.$t('The script is copied'))
      navigator.clipboard.writeText(script)
    }
  },
  watch: {
    siteConfig: {
      handler (newVal, oldVal) {
        const jsonConf = {}
        if (newVal.sourceNameViewOrder) {
          jsonConf.sourceNameViewOrder = newVal.sourceNameViewOrder
        }
        if (this.siteConfig.SourcesGeneralOn) {
          jsonConf.SourcesGeneralOn = newVal.SourcesGeneralOn
        }
        if (this.siteConfig.deselectSources) {
          jsonConf.deselectSources = newVal.deselectSources
        }

        let extraScript = ''
        if (Object.keys(jsonConf).length > 0) {
          extraScript = 'var jsonScript = d.createElement("script");' +
          'jsonScript.id = "termer-custom-settings";' +
          'jsonScript.type = "application/json";' +
          'jsonScript.innerHTML =\'' + JSON.stringify(jsonConf) +
          '\';d.body.appendChild(jsonScript);'
        }
        this.jsonScript = extraScript
      },
      deep: true
    },
    selectedSite: async function (newVal, oldVal) {
      const siteConf = await fetchSiteConfiguration(
        'http://127.0.0.1:8000?site=' + newVal
      )
      if (siteConf) {
        if (siteConf.apikeys && 'Termer' in siteConf.apikeys) {
          this.apikey = siteConf.apikeys.Termer
        }
        if (siteConf.backends) {
          this.selectedBackends = siteConf.backends
        }
        this.siteConfig = siteConf
      }
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.bookmarkletAndPopup
  position: relative

.bookmarkletDiv
  display: flex
  justify-content: center

.configBox
  display: inline-block
  margin: 0.5em
  vertical-align: top

.bookmarkletlink
  color: var(--text-color)
  text-decoration: none
  position: relative
  display: inline-block
  border-bottom: 1px dotted black

#instructionPopUp
  position: absolute
  border: 2px solid var(--border-color)
  border-radius: 1em
  background-color: white
  padding: 1em

.tooltip-btn
  position: relative

.tooltip-btn::after
  content: attr(data-tooltip)
  visibility: hidden
  opacity: 0
  background-color: #333
  color: #fff
  padding: 5px
  border-radius: 4px
  position: absolute
  z-index: 1
  bottom: 100%
  left: 50%
  transform: translateX(-50%)
  transition: opacity 0.2s
  width: 50vw

.tooltip-btn:hover::after
  visibility: visible
  opacity: 1
</style>
