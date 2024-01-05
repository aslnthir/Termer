<license>
  Vertraulich
</license>

<template>
<div id="search_page_info_box">
  <MarkdownTextI18n :document="document" :site="site" />
</div>
</template>

<script>
import eventBus from '../eventbus'
import { mapGetters } from 'vuex'
import MarkdownTextI18n from '@/components/MarkdownTextI18n'
export default {
  name: 'searchPageInfoBox',
  components: {
    MarkdownTextI18n
  },
  computed: {
    document () {
      return 'search_page/Search_info_box_'
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
#search_page_info_box
  background: var(--information-box-color)
  padding: 1em
  border: 1px solid #ddd
  border-radius: 0.5em
  text-align: initial

  &:empty
    display: none
</style>
