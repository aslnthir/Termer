<template>
  <!--
    <transition> is used just to get an event that fires after component
    load.
  -->
  <transition @after-enter="afterEnter" :css="false">
  <component :is="text" class="pretty-text"></component>
  </transition>
</template>

<script>
import eventBus from '@/eventbus'
export default {
  props: {
    document: {
      type: String,
      required: true
    },
    language: {
      type: String,
      required: true
    },
    site: {
      type: String,
      required: false
    }
  },
  data () {
    return {
      text: ''
    }
  },
  async mounted () {
    try {
      let module
      if (this.site) {
        module = await import(
          '@/documents/' + this.document + this.site + '.' + this.language
        )
      } else {
        module = await import(
          '@/documents/' + this.document + '.' + this.language
        )
      }
      this.text = module.default
    } catch (e) {
      const module = await import(
        '@/documents/' + this.document + 'default.' + this.language
      )
      this.text = module.default
    }
  },
  methods: {
    afterEnter () {
      eventBus.$emit('asyncComponentLoaded')
    }
  }
}
</script>

<style lang="sass" scoped>
.pretty-text
  @supports (hyphens: auto)
    text-align: justify
    text-justify: auto
    hyphens: auto
</style>
