<license>
  Vertraulich
</license>

<template>
<div class="main">
  <div class="termerWhiteTextBox">
    <h1>
      Installere INSITU Termer på ditt nettsted
    </h1>
      <p>
        En felles forståelse av en hendelse er avgjørende for effektivt samvirke i en redningsaksjon.
        Begreper for redningskommunikasjon er definert i
        <a href="https://www.hovedredningssentralen.no/redningshandboken-er-endelig-her/">Redningshåndboken</a>
        og i ordlister fra hver enkelt sektor.
         INSITU Termer fra <a href="https://insitu.uia.no/">INSITU-prosjektet</a>
         gir enkel tilgang til ordforklaringer. Prosjektet skal bidra til å harmonisere bruk og utvikling av disse sammen med
         <a href="https://insitu.uia.no/referansegruppe">organisasjoner innen beredskap og redning</a>.
       </p>

        <p>Med INSITU Termer på nettstedet så kan brukerne
        </p>
        <ol>
          <li>
           Søke på forklaring til begreper fra nettstedet eller fra en smarttelefon.
          </li>
          <li>
           Slå opp ordforklaringer fra markerte begreper på nettsider eller PDF-dokumenter med et klikk.
          </li>
          <li>
           Bruk Termer i nettleseren på andre nettsteder eller PDF-dokumenter.
          </li>
        </ol>

        <p>
          Deltakerne i INSITU-prosjektet kan bruke Termer-tjenestene kostnadsfritt for test
          fram til prosjektets planlagte avslutning i 2022.
          Fyll ut skjema under med dine preferanser for å konfigurere installasjonen.
          Skjemaet gir både et skript for nettstedet og en bookmarklet for test før installasjon.
        </p>
  </div>
  <div class="termerWhiteTextBox">
    <h2>
       1. Om nettstedet
   </h2>
   <form
     @submit="postForm"
     action=""
     method="post">
     <label for="webpageSelectorId">
       {{ $t('Velg ditt nettsted') }}:
     </label><br>
     <div class="errorMsg">
       {{webpageErrorMsg}}
     </div>
     <select
       required="required"
       id="webpageSelectorId"
       v-model="webpage">
       <!-- inline object literal -->
       <option v-for="item in websites"
         v-bind:value="item.url"
         :key="item.url">{{item.name}}</option>
     </select><br><br>
     <label for="emailInoutId">
       {{ $t('Kontakt epost') }}:
     </label><br>
     <div class="errorMsg">
       {{emailErrorMsg}}
     </div>
     <input
       id="emailInoutId"
       class="emailInput"
       type="email"
       required="required"
       v-model="email"><br><br>
     <t-button type="submit"
       name="button">
       {{ $t('Send') }}
     </t-button>
   </form>
  </div>
  <div v-if="whenSubmited">
    <div class="termerWhiteTextBox">
      <h2 id="sourceConfigurations">
        2. Innstillinger for Termer på ditt nettsted
      </h2>
      <p>
        Her kan du velge ordlister som skal være forhåndsvalgt og rekkefølgen for søk i dem.
        Kryss i boksen viser at en ordliste er valgt. Klikk-og-dra i dobbelpilene for å endre
        rekkefølgen på ordlistene. Merk at ordlistene fra Redningshåndboka altid vil komme øverst.
        Dette som et bidrag til harmonisering av begreper.
      </p>
      <div>
        <source-selector
          :selectedSources="computedFilterdSelectedSources"
          :allSources="computedFilterdSources"
          :selectedFromLanguages="[]"
          :selectedToLanguages="[]"
          :userDeselectedSources="[]"
          :glossaryOrderById="computedGlossaryOrder"
          :setShowAll="true"
          :mandatoryOnSources="mandatorySourcesOn"
          @update-event="eventUpdate">
        </source-selector>
        <hr>
        <t-button type="button"
          @click="confirmEditEvent"
          name="button">
          {{ $t('Bekreft') }}
        </t-button>
      </div><br>
      <p>Skriptet blir generert når du bekrefter dine valg over.</p>
    </div>
    <div v-show="computedShowSourceEditConfimred">
      <div class="termerWhiteTextBox">
        <h2 id="bookmarkletTest">
          3. Teste Termer og instillingene før installasjon
       </h2>
       <div>
        <h3>
          {{ $t('Klikk-og-dra lenken som følger ')}}
          <a class="bookmarkletlink" :href="bookmarkletScriptString">{{ $t('Termer test') }}</a>
          {{ $t('til bokmerkeraden i din nettleser.') }}
        </h3>
         <p>
           Deretter kan du åpne en side på ditt nettsted og klikke på "Termer test" i bokmerkeraden.
         </p>
         <br>
       </div><br>
      </div>
      <div class="termerWhiteTextBox">
        <h2>
          4. Legg til skriptet på ditt nettsted
        </h2>
       <p>
         Legg til skript som vist under for å ta i bruk Termer-knappen med dine innstillinger.
         Merk at skriptet under blir oppdatert automatisk om du endrer innstillingene.
       </p>
       <div class="flexClass">
         <pre class="code" v-html="scriptHtmlText">
         </pre>
       </div><br>
       <h3>Termer-knappen</h3>
       <pre class="code" v-html="termerButtonString"></pre>
       <p>
         Skriptet vil plassere knappen i et div element. Legg til dette elementet
         på siden hvor du vil at knappen skal bli vist.
       </p>
      </div>
      <div class="termerWhiteTextBox">
        <h2>5. Mulige justeringer på nettsidene</h2>
        <p>
          Du kan slå av oppmerking på deler av nettsiden ved å legge til
          klassen <q>termer-disable-highlighting</q> til et HTML-element.
          Eksempel under.
        </p>
        <pre class="code" v-html="highlightClassString"></pre>
        <p>
          På tilsvarende måte kan du slå på oppmerking for deler av
          innholdet med <q>termer-enable-highlighting</q>.
        </p>
        <h3>
         Termer kan gi tilgang til ordforklaringer fra PDF dokumenter på ditt nettsted
        </h3>
        <p>
          For at PDF dokumenter skal åpne på riktig måte med Termer så må lenkene
          ha følgende form:
          <q>https://domain-name.no/pdf-file-name.pdf</q>. En lenke for nedlasting som den
          som følger vil ikke fungere med Termer.
          <q>https://domain-name.no/wp-content/download.php?id=xyz</q>.
        </p>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import sourceSelector from '@/components/selection_components/SourceSelector'
import { mapState } from 'vuex'
import { getAvalebleSites, fetchSiteConfiguration, getSiteName } from 'site-configurations'
export default {
  name: 'installguide',
  components: {
    sourceSelector
  },
  props: {
    loaderScript: {
      type: URL,
      default: () => new URL('https://termer.no/glossaryjs/glossary.js')
    }
  },
  data () {
    return {
      apikey: '',
      selectedBackends: [],
      compSelectedSources: [],
      compDeselectedSources: [],
      selectedSite: '',
      sitesAvaileble: getAvalebleSites(),
      sourceRank: [],
      SourcesSiteInstallOn: [],
      glossaryOrder: this.computedDefaultIdOrder,
      showSourceEditor: false,
      showSourceEditConfimred: false,
      extraInfoBoxText: '',
      email: null,
      webpage: null,
      whenSubmited: false,
      emailErrorMsg: '',
      webpageErrorMsg: '',
      highlightClassString: '&lt;div class="someclass termer-disable-highlighting"&gt;',
      termerButtonString: '&lt;div id="tingtun-termer-button"&gt;&lt;/div&gt;'
    }
  },
  created: async function () {
    const siteName = getSiteName() || 'default'
    this.selectedSite = siteName
    const siteConf = await fetchSiteConfiguration('http://127.0.0.1:8000?site=' + siteName)
    if (siteConf) {
      if (siteConf.apikeys && 'Termer' in siteConf.apikeys) {
        this.apikey = siteConf.apikeys.Termer
      }
      if (siteConf.backends) {
        this.selectedBackends = []
      }
    }
  },
  methods: {
    postForm (e) {
      e.preventDefault()
      const postUrl = 'https://glossary.tingtun.no/glossary2/register/webpage/'
      fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: this.email, webpage: this.webpage })
      })
        .then(async response => {
          if (response.ok) {
            this.whenSubmited = true
            this.emailErrorMsg = ''
            this.webpageErrorMsg = ''
            setTimeout(() => { document.getElementById('sourceConfigurations').scrollIntoView() }, 50)
          } else {
            const jsonData = await response.json()
            if ('errors' in jsonData) {
              const errors = jsonData.errors
              if ('email' in errors) {
                this.emailErrorMsg = errors.email[0]
              }
              if ('webpage' in errors) {
                this.webpageErrorMsg = errors.webpage[0]
              }
            }
          }
        }).catch(async response => {
          console.log('Error in post response')
        })
    },
    showEditorEvent () {
      this.showSourceEditor = true
      this.showSourceEditConfimred = false
    },
    confirmEditEvent () {
      this.showSourceEditor = false
      this.showSourceEditConfimred = true
      if (this.dataExtraInfoBoxText) {
        this.extraInfoBoxText = this.dataExtraInfoBoxText
      }
      setTimeout(() => { document.getElementById('bookmarkletTest').scrollIntoView() }, 50)
    },
    eventUpdate (eventData) {
      /*
      * Fetches all events thats happening from the source selector
      */
      if (eventData.type === 'Termer/setUserGlossaryOrderById') {
        this.glossaryOrder = eventData.value
      } else if (eventData.type === 'Termer/userDeselectSource') {
        if (this.initialDefaultSources.includes(eventData.value)) {
          this.compDeselectedSources.push(eventData.value)
        }
        const index = this.compSelectedSources.indexOf(eventData.value)
        if (index > -1) {
          this.compSelectedSources.splice(index, 1)
        }
      } else if (eventData.type === 'Termer/userSelectSource') {
        const index = this.compDeselectedSources.indexOf(eventData.value)
        if (index > -1) {
          this.compDeselectedSources.splice(index, 1)
        }
        if (!this.initialDefaultSources.includes(eventData.value)) {
          this.compSelectedSources.push(eventData.value)
        }
      }
    },
    backendSourceTurnedOn (key) {
      const backend = key.split('/')[0]
      return this.SourcesSiteInstallOn.includes(backend)
    },
    sourceBackendInList (sourceId, backends) {
      const backend = sourceId.split('/')[0]
      return backends.includes(backend)
    }
  },
  computed: {
    websites () {
      return [
        { name: 'Agder Energi', url: 'https://www.ae.no/' },
        { name: 'Avinet', url: 'https://www.avinet.no/' },
        { name: 'Barentswatch', url: 'https://www.barentswatch.no/' },
        { name: 'Brannvernforeningen', url: 'https://brannvernforeningen.no/' },
        { name: 'CIM fra F24', url: 'https://beta.onevoice.no/ciemlab/' },
        { name: 'Direktoratet for atomsikkerhet og strålevern', url: 'https://dsa.no/' },
        { name: 'Direktoratet for samfunnssikkerhet og beredskap (DSB)', url: 'https://www.dsb.no/' },
        { name: 'Frivillige organisasjoners redningsfaglige forum (FORF)', url: 'https://www.forf.no/' },
        { name: 'Forsvarets forskningsinstitutt (FFI)', url: 'https://www.ffi.no/' },
        { name: 'Forsvarets høgskole', url: 'https://forsvaret.no/fhs' },
        { name: 'Fylkesmannen i Trøndelag', url: 'https://www.fylkesmannen.no/nb/Trondelag/' },
        { name: 'Geodata', url: 'https://geodata.no/' },
        { name: 'Helsedirektoratet', url: 'https://www.helsedirektoratet.no/' },
        { name: 'INSITU prosjektet', url: 'https://insitu.uia.no/' },
        { name: 'Kartverket', url: 'https://www.kartverket.no/' },
        { name: 'Kollegiet for brannfaglig terminologi', url: 'http://kbt.no/' },
        { name: 'Kristiansand kommune', url: 'https://www.kristiansand.kommune.no/' },
        { name: 'Kystverket', url: 'https://kystverket.no/' },
        { name: 'Nasjonal kommunikasjonsmyndighet (Nkom)', url: 'https://www.nkom.no/' },
        { name: 'Nasjonalt redningsfaglig råd', url: 'https://nrr.org/no/' },
        { name: 'Norges brannskole', url: 'https://www.nbsk.no/' },
        { name: 'Næringslivets sikkerhetsorganisasjon, Industrivernet', url: 'https://nso.no' },
        { name: 'Oslo kommune, Beredskapsetaten', url: 'https://www.oslo.kommune.no/etater-foretak-og-ombud/beredskapsetaten/' },
        { name: 'Oslo politidistrikt', url: 'https://www.politiet.no/om/organisasjonen/politidistrikter/oslo/' },
        { name: 'Politidirektoratet', url: 'https://www.politiet.no/' },
        { name: 'Politihøgskolen', url: 'https://www.phs.no/' },
        { name: 'Norges vassdrags- og energidirektorat (NVE)', url: 'https://www.nve.no/' },
        { name: 'Språkrådet', url: 'https://www.sprakradet.no/' },
        { name: 'Standard Norge', url: 'https://www.standard.no/' },
        { name: 'Statens vegvesen', url: 'https://www.vegvesen.no/' },
        { name: 'Sørlandet sykehus – SSHS', url: 'https://sshf.no/' },
        { name: 'Østre Agder brannvesen', url: 'https://www.arendal.kommune.no/oabv' }
      ]
    },
    scriptHtmlText () {
      return this.scriptString + this.extraScript
    },
    computedShowSourceEditConfimred () {
      if (this.extraInfoBoxText) return true
      return this.showSourceEditConfimred
    },
    computedSourceRank () {
      /*
      * Order of sources based on source ID
      * Insitu site will allways have Redningshåndboken first
      */
      /*
      return this.mandatorySourcesOn.concat(
        this.sourceOrderByIdValue.filter(x =>
          !this.mandatorySourcesOn.includes(x)
        ))
      */
      return this.sourceOrderByIdValue
      /*
      .filter(x =>
        !this.mandatorySourcesOn.includes(x)
      )
      */
    },
    computedFilterdSources () {
      /*
      * All sources for the source selector
      * Insitu site will not show Redningshåndboken, so it will not be deselected
      */
      return this.sources
    },
    computedGlossaryOrder () {
      if (this.glossaryOrder) return this.glossaryOrder
      else return this.glossaryOrderById
    },
    initialDefaultSources () {
      /*
      * Keep the default sources selected so the extra script knows
      * what sources to include or not.
      */
      const selected = []
      Object.entries(this.computedFilterdSources).filter(([key, { data }]) => {
        if (this.mandatorySourcesOn.includes(key)) {
          return true
        } else if (data.defaultApikey) {
          return true
        } else if (!key.startsWith('Termer') && this.backendSourceTurnedOn(key)) {
          return true
        } else if (this.filterdSourceOn.includes(key)) {
          return true
        } else {
          return false
        }
      }).forEach(([key, value]) => {
        selected.push(key)
      })
      return selected
    },
    computedFilterdSelectedSources () {
      /*
      * Returns selected sources based on initial and user input
      */
      const selected = {}
      Object.entries(this.computedFilterdSources).filter(([key, { data }]) => {
        if (this.mandatorySourcesOn.includes(key)) {
          return true
        } else if (data.defaultApikey && !this.compDeselectedSources.includes(key)) {
          return true
        } else if (this.compSelectedSources.includes(key)) {
          return true
        } else if (!key.startsWith('Termer') && this.backendSourceTurnedOn(key) &&
          !this.compDeselectedSources.includes(key)) {
          return true
        } else if (this.filterdSourceOn.includes(key)) {
          return true
        } else {
          return false
        }
      }).forEach(([key, value]) => {
        selected[key] = value.data.glossaries
      })
      return selected
    },
    computedSourcesSiteInstallOn () {
      let sources = this.SourcesSiteInstallOn.filter(x => x.includes('/'))
      const backends = this.SourcesSiteInstallOn.filter(x => !x.includes('/'))
      if (backends.length > 0) {
        const addSources = Object.keys(this.computedFilterdSources).filter(x => {
          return this.sourceBackendInList(x, backends)
        })
        sources = sources.concat(addSources)
      }
      // this.compSelectedSources = sources
      return sources
    },
    filterdSourceOn () {
      return this.computedSourcesSiteInstallOn
        .filter(x => !this.compDeselectedSources.includes(x))
    },
    compiedSourceOnSelected () {
      return this.compSelectedSources.concat(this.filterdSourceOn)
    },
    filterDeselectedSources () {
      return this.compDeselectedSources
        .filter(x => !this.computedSourcesSiteInstallOn.includes(x))
    },
    computedDefaultIdOrder () {
      /*
      * Return order of glossaries
      * Insitu site do not have Redningshåndboken in this order as it will
      * allways be first.
      */
      let order = this.glossaryOrderById
      if (this.selectedSite === 'insitu') {
        order = order.filter(x => {
          return !(
            x.startsWith('Termer/308') ||
            x.startsWith('Termer/313') ||
            x.startsWith('Termer/314') ||
            x.startsWith('Termer/309') ||
            x.startsWith('Termer/312')
          )
        })
      }
      return order
    },
    defaultSourceOrder () {
      /*
      * simplyfy order down to sources rather then glossaries
      */
      return [...new Set(this.computedDefaultIdOrder.map(x => {
        const tempList = x.split('/')
        return tempList[0] + '/' + tempList[1]
      }))]
    },
    sourceOrderByIdValue () {
      /*
      * Return list of names of sources by order if the order is changed
      */
      if (this.glossaryOrder) {
        const list = [...new Set(this.glossaryOrder.map(x => {
          const tempList = x.split('/')
          return tempList[0] + '/' + tempList[1]
        }))]
        /*
        const nameList = list.map(x => {
          return this.computedFilterdSources[x].data.name
        })
        */
        if (JSON.stringify(list) === JSON.stringify(this.defaultSourceOrder)) return []
        else return list
      } else return []
    },
    customInfoBoxText () {
      /*
        XXX: If going to be used, needs update
      */
      let scriptText = ''
      if (this.extraInfoBoxText) {
        scriptText += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
        scriptText += 'window.termerCore.vueSettings({\'optional-infobox-text\': \'' +
          this.extraInfoBoxText +
        '\'});<br>'
      }
      return scriptText
    },
    scriptString () {
      /*
      * Script tag to include on sites
      */
      const f = '&lt;script ' +
      'type="text/javascript" ' +
      'id="tingtunGlossary" ' +
      'data-site="' + this.selectedSite + '" ' +
      'src="https://termer.no/glossaryjs/glossary.js"&gt;' +
      '<br>// Generate a new script from ' +
      window.location.href +
      ' to change the settings.' +
      ' In case of any issues please visit ' +
      window.location.origin +
      '/help<br>' +
      '&lt;/script&gt;'
      return f
    },
    extraScriptAddValue () {
      /*
      * Returns what values to change in extra script
      */
      const jsonData = {}
      if (this.selectedSite) {
        jsonData.site = this.selectedSite
      }
      if (this.sourceOrderByIdValue && this.sourceOrderByIdValue.length > 0) {
        jsonData.sourceRank = this.computedSourceRank
      }
      if (this.compiedSourceOnSelected && this.compiedSourceOnSelected.length > 0) {
        jsonData.SourcesGeneralOn = this.compiedSourceOnSelected
      }
      if (this.filterDeselectedSources && this.filterDeselectedSources.length > 0) {
        jsonData.deselectSources = this.filterDeselectedSources
      }
      return jsonData
    },
    extraScript () {
      /*
      * Extra script to include if changes to default selected and order
      */
      const sourceChange = this.extraScriptAddValue
      if (Object.keys(sourceChange).length === 0) {
        return ''
      }
      const f = '&lt;script id="termer-custom-settings" ' +
      'type="application/json"&gt;' +
      JSON.stringify(sourceChange) +
      '&lt;/script&gt;'
      return f
    },
    bookmarkletScriptString () {
      /*
      * Script for using in bookmarklet for testing the new settings.
      */
      let extraScriptString = ''
      if (Object.keys(this.extraScriptAddValue).length > 0) {
        extraScriptString = 'var cScript = d.createElement("script");' +
        'cScript.id = "termer-custom-settings";' +
        'cScript.innerHTML =\'' + JSON.stringify(this.extraScriptAddValue) +
        '\';d.body.appendChild(cScript);'
      }
      const f = `(function f(){
        var d = document;
        var hasScript = d.querySelector("#tingtunGlossary") !== null;
        var isTingtunLookup = -1 < (
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
        style.zIndex = 99999999;` +
          extraScriptString +
        `
        var script = d.createElement("script");
        script.dataset.sourceType = "sourcedescription";
        script.type = "text/javascript";
        script.src = "${this.loaderScript.toString()}";
        script.charset = "utf-8";
        script.className = "glossaryjs";
        script.dataset.site="${this.selectedSite}";
        script.id = "tingtunGlossary";
        d.body.appendChild(script);
      })()
      `
      return 'javascript:' +
        f.replaceAll('&nbsp;', '')
          .replaceAll('<br>', '')
          .replace(/ = /g, '=')
          .replace(/ !== /g, '!==')
          .replace(/\n/g, '')
          .replace(/  +/g, ' ')
          .replace(/; /g, ';')
    },
    ...mapState('Termer', ['availableBackends', 'selectedSources', 'sources',
      'selectedFromLanguages', 'selectedToLanguages', 'glossaryOrderById',
      'userDeselectedSources', 'mandatorySourcesOn'])
  },
  watch: {
    selectedSite: async function (newVal, oldVal) {
      const siteConf = await fetchSiteConfiguration('http://127.0.0.1:8000?site=' + newVal)
      if (siteConf) {
        if (siteConf.apikeys && 'Termer' in siteConf.apikeys) {
          this.apikey = siteConf.apikeys.Termer
        }
        if (siteConf.backends) {
          this.selectedBackends = []
        }
        if (siteConf.sourceRank) {
          this.sourceRank = siteConf.sourceRank
        }
        if (siteConf.SourcesSiteInstallOn) {
          this.SourcesSiteInstallOn = siteConf.SourcesSiteInstallOn
        }
      }
    }
  },
  metaInfo () {
    return {
      title: this.$t('Install Tingtun Termer')
    }
  }
}
</script>

<style lang="sass" scoped>
.main
  padding-left: 2em
  margin-top: 2em

.code
  background: var(--termer-code-snippets-background)
  border-radius: 1em
  padding: 1em
  display: inline-block
  overflow-wrap: break-word
  max-width: 100%

.codeLimitWith
  max-width: 40em

.codeLimitHeigt
  max-height: 22em
  overflow: auto

.htmlHidden
  display: none

.bookmarkletlink
  font-size: 1.5em

.emailInput
  width: 348px

.errorMsg
  color: var(--text-warrning)

.termerWhiteTextBox
  /* NOTE: sass is case senestive, but normal CSS is not */
  max-width: Max(30em, 55%)
  margin: auto
  margin-top: 0.2em
  margin-bottom: 0.2em

.flexClass
  display: flex

pre
  white-space: pre-wrap
  height: fit-content

p
  padding-left: 1em
  display: block
  margin-top: 1em
  margin-bottom: 1em
  margin-left: 0
  margin-right: 0
</style>
