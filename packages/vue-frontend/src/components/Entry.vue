<license>
  Vertraulich
</license>

<template>
  <div>
  <span v-if="!inlineCKEditor && edit === 'inline'">
    <input :value="entry.meaning"
           @blur="saveChanges"
           @input="onInput" />
  </span>
  <concept-editor v-if="(inlineCKEditor && edit) || edit === 'expanded'"
    :value="entry"
    @save="saveChanges"
    @input="onInput"
    :inline="edit === 'inline'"></concept-editor>
  <div v-else>
    <div v-if="entry.images" class="entry-images">
      <async-img v-for="image in entry.images"
        :key="image.url"
        :url="image.url"></async-img>
    </div>
    <div class="entry">
      <span
        v-html="entry.meaning"
        :lang="entryLanguage"
        ref="meaning"
        class="entry-meaning"
      ></span>
      <span v-if="domainTitle"
        :title="domainTitle"
        v-html="'\uD83D\uDCD6'"
      ></span><!--
 --><a
       v-if="entry.url"
       :href="entry.url"
       :title="linkTitle"
       target="_blank"><!--
   --><img src="../views/assets/images/Icon_External_Link.png">
    </a>
    </div>
  </div>
  </div>
</template>

<script>
import ConceptEditor from './ConceptEditor'
import eventBus from '../eventbus'
import AsyncImg from './AsyncImg'
export default {
  name: 'entry',
  components: {
    ConceptEditor,
    AsyncImg
  },
  props: {
    entry: {
      required: true
    },
    entryLanguage: {
      required: true
    },
    entrySourceName: {
      required: false
    },
    inlineCKEditor: {
      required: false,
      default: false
    },
    edit: {
      required: false,
      default: ''
    }
  },
  computed: {
    domainTitle () {
      let title = ''
      let num = 0
      if (!this.entry || !this.entry.domains) return ''
      for (const item of this.entry.domains) {
        num++
        title += num.toString() + ': ' + item.domain_name + '.\n'
      }
      return title
    },
    linkTitle () {
      return this.$t('Go to ') + this.entrySourceName + this.$t(' search results')
    }
  },
  methods: {
    onInput (value) {
      const trimmed = value.trim()
      this.$emit('input', trimmed)
    },
    saveChanges (value) {
      if (value.trim() !== this.entry.meaning) {
        this.$emit('save', value)
      }
    }
  },
  watch: {
    edit () {
      eventBus.$emit('requestResize')
    }
  }
}
</script>

<style lang="sass" scoped>
.entry-reference
  font-size: 80%
  color: #0047b1
  text-decoration: none
  &:visited
    text-decoration: none

.entry
  hyphens: auto
  text-align: justify

input
  width: 100%
</style>
