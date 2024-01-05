<license>
  Vertraulich
</license>

<template>
  <div
    v-show="showSelectSources">
      <div v-if="!hasSelectedSources" class="warning">
        {{ $t('No sources available for the selected language pairs.') }}
      </div>
      <glossary-select :openSourceSelection="true"></glossary-select>
      <slot />
      <span>
        <div class="saveDefaultButton">
          <span :class="{elementToFadeInAndOut: clicked, hidden: !clicked}">
            {{ $t('Saved') }}
          </span>
          <t-button
            :title="saveDefaultButtonTitle"
            @click="click">
            {{ $t('Save as default') }}
          </t-button>
        </div>
      </span>
  </div>
</template>

<script>
import GlossarySelect from '@/components/GlossarySelect'
import { mapState } from 'vuex'

export default {
  name: 'source-language-configuration',
  props: ['visible'],
  components: {
    GlossarySelect
  },
  data () {
    return {
      saveDefaultButtonTitle: this.$t('Save settings for use on this, and on other web sites.'),
      clicked: false
    }
  },
  computed: {
    hasSelectedSources () {
      if (Object.keys(this.backendSources).length === 0) return true
      for (const id in this.backendSources) {
        const type = this.backendSources[id].type
        if (type === 'loading' || type === 'notasked') {
          return true
        }
      }
      const hasSources = Object.keys(this.selectedSources).length > 0
      if (!hasSources) {
        this.$emit('openSelecting', true)
      }
      return hasSources
    },
    showSelectSources () {
      return this.visible || !this.hasSelectedSources
    },
    ...mapState('Termer', ['selectedSources', 'backendSources'])
  },
  methods: {
    click () {
      this.$store.dispatch('Termer/saveUserDefault')
      this.clicked = true
      setTimeout(() => { this.clicked = false }, 10000)
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.warning
  background: #ffee63
  margin-bottom: 0.2em

.saveDefaultButton
  float: right

.hidden
  display: none

.elementToFadeInAndOut
  opacity: 0
  animation: fade 10s linear 1 forwards

@keyframes fade
  0%
    opacity: 0
  5%
    opacity: 1
  95%
    opacity: 1
  100%
    opacity: 0
</style>
