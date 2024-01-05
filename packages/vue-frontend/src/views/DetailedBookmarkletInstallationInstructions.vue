<template>
<div>
  <div class="box2">
    <h2>{{$t('Detailed installation instructions')}}</h2>
    <Bookmarklet />
    <a href="#keyboard-installation">
      {{$t('Jump to keyboard installation instructions.')}}
    </a>
    <p class="noteText">
      {{$t('Note: Firefox is used for this illustration.')}}
    </p>
    <ol>
      <li>
        <div>
          <div>
            {{$t('Press the keys Ctrl-Shift-B to show the bookmarks bar. Click and drag the TERMER demo link to your bookmarks bar. ')}}
          </div>
          <img
            :alt="emptyBarAltText"
            src="./assets/images/Bookmarklet-install-1.png"/>
        </div>
      </li>
      <li>
        <div>
          <div>
            {{$t('TERMER demo should now appear in your list of bookmarks.')}}
          </div>
          <img
            :alt="TermerBarAltText"
            src="./assets/images/Bookmarklet-install-2.png"/>
        </div>
      </li>
      <li>
        <div>
          <div>
            {{$t('Click on TERMER demo in the bookmarks bar (a) to use TERMER on a web page. A button (b) will appear when TERMER is activated.')}}
            <router-link
               id="termer-help"
               :to="{ name: 'help' }">
              {{ $t('How to use TERMER') }}
            </router-link></div>
          <img
            :alt="activateAltText"
            src="./assets/images/Bookmarklet-install-3.png"/>
        </div>
      </li>
    </ol>
  </div>

  <div class="box2">
    <a id="keyboard-installation" />
    <div>
      {{ $t('Install bookmarklet using keyboard:') }}
        <button
          type="button"
          name="button"
          v-on:click="changeKeyboardInstructions('chrome')"
          >
          Chrome
        </button>
        <button
          type="button"
          name="button"
          v-on:click="changeKeyboardInstructions('firefox')">
          Firefox
        </button>
        <button
          type="button"
          name="button"
          v-on:click="changeKeyboardInstructions('edge')">
          Edge
        </button>
    </div>
    <div  v-show="showkeyboardInstructions === 'chrome'">
      <MarkdownTextI18n
        document="Chrome_bookmarklet_install_guide" />
    </div>
    <div v-show="showkeyboardInstructions === 'firefox'">
      <MarkdownTextI18n
        document="Firefox_bookmarklet_install_guide" />
    </div>
    <div v-show="showkeyboardInstructions === 'edge'">
      <MarkdownTextI18n
        document="Edge_bookmarklet_install_guide" />
    </div>
  </div>

</div>
</template>
<script>
import MarkdownTextI18n from '@/components/MarkdownTextI18n'
import Bookmarklet from '@/components/Bookmarklet'

export default {
  name: 'installBookmarklet',
  data () {
    return {
      emptyBarAltText: this.$t('Empty bookmarklet bar with a red cirle to highlight it.'),
      TermerBarAltText: this.$t('Bookmarks bar with TERMER'),
      activateAltText: this.$t('Website with TERMER activated. 1. Click bookmarklet. 2. TERMER button appears'),
      showkeyboardInstructions: null
    }
  },
  components: {
    Bookmarklet,
    MarkdownTextI18n
  },
  metaInfo () {
    return {
      title: this.$t('Install Bookmarklet')
    }
  },
  methods: {
    changeKeyboardInstructions (what) {
      if (this.showkeyboardInstructions === what) {
        this.showkeyboardInstructions = null
      } else {
        this.showkeyboardInstructions = what
      }
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
li
  margin-right: 2em
  margin-bottom: 2em

.box2
  padding: 1em
  background: var(--information-box-color)
  border: solid thin
  border-radius: 1em
  margin-top: 1em

img
  border: solid thin
  border-radius: 1em
  margin-top: 0.3em
  max-width: 400px
  @media only screen and (max-width: 600px)
    max-width: 66vw

ol
  display: flex
  flex-wrap: wrap
  flex-direction: row

ol li div
  display: inline-flex
  flex-direction: column
  max-width: 440px
</style>
