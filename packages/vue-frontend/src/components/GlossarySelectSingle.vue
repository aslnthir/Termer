<license>
  Vertraulich
</license>

<template>
  <div id="container">
    <VueSelect
      name="sources"
      label="name"
      :options="options"
      :value="value"
      @input="change"
      @search:focus="onDropdownOpen"
      @search:blur="onDropdownClose"
      ref="select">
    </VueSelect>
    <div id="spacer" :style="{height: addedHeight + 'px'}"></div>
  </div>
</template>

<script>
import VueSelect from './VueSelect'
import { mapState } from 'vuex'
import eventBus from '../eventbus'
export default {
  name: 'glossary-select-single',
  components: {
    VueSelect
  },
  data () {
    return {
      addedHeight: 0
    }
  },
  props: ['value', 'writeOnly'],
  computed: {
    options () {
      const wirteSources = []
      if (this.writeOnly) {
        for (const index in this.sources) {
          if (this.sources[index].permissions.write) {
            wirteSources.push(this.sources[index])
          }
        }
        return wirteSources
      }
      return Object.values(this.sources)
    },
    ...mapState(['sources'])
  },
  methods: {
    change (selected) {
      this.$emit('input', selected)
      eventBus.$emit('requestResize')
    },
    onDropdownOpen () {
      setTimeout(() => {
        // setTimeout in order to wait for the menu to appear.
        const menu = this.$refs.select.$refs.dropdownMenu
        if (menu) {
          this.addedHeight = menu.clientHeight
          eventBus.$emit('requestResize')
        }
      }, 0)
    },
    onDropdownClose () {
      this.addedHeight = 0
      eventBus.$emit('requestResize')
    }
  }
}
</script>

<style lang="sass" scoped>
#container
  margin: 0 auto
select
  width: 50%
  min-width: 100%
.v-select
  // default background is transparent.
  background-color: white
</style>
