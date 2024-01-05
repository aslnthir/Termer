<license>
  Vertraulich
</license>

<template>
  <div id="langSelector">
    <label>{{label}}</label>
    <VueSelect
      multiple
      name="sources"
      label="name"
      :options="options"
      :value="value"
      @input="change"
      @search:focus="onDropdownOpen"
      @search:blur="onDropdownClose"
      ref="select">
      <template slot="no-options">{{ $t('Sorry, no matching options.') }}</template>
    </VueSelect>
    <div :style="{height: addedHeight + 'px'}"></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import eventBus from '../eventbus'
import VueSelect from './VueSelect'
export default {
  name: 'lang-select',
  props: [
    'label',
    'selectedList',
    'commitName',
    'languagesFilterd'
  ],
  components: {
    VueSelect
  },
  data () {
    return {
      active: true,
      selected: false,
      addedHeight: 0
    }
  },
  computed: {
    options () {
      const options = this.languagesFilterd
      return options
    },
    value () {
      const value = this.languagesFilterd.filter(x => this.selectedList.includes(x.code))
      return value
    },
    ...mapState(['supportedLanguages'])
  },
  methods: {
    change (selected) {
      selected = selected.filter(x => x).map(x => x.code + '')
      if (selected.length) {
        eventBus.$emit('requestResize')
        this.$store.dispatch(this.commitName, selected)
      }
    },
    _poll (predicate, timeout, rounds, modifier, fun) {
      if (predicate()) {
        fun()
      } else if (rounds > 0) {
        timeout = modifier(timeout)
        setTimeout(
          () => this._poll(predicate, timeout, --rounds, modifier, fun),
          timeout
        )
      }
    },
    onDropdownOpen () {
      const self = this
      function triggerResize () {
        const menu = self.$refs.select.$refs.dropdownMenu
        if (menu) {
          self.addedHeight = menu.clientHeight
          eventBus.$emit('requestResize')
        }
      }

      function predicate () {
        const menu = self.$refs.select.$refs.dropdownMenu
        return !!menu
      }

      function increaseTimeout (x) {
        return x ** 2
      }

      const timeout = 2
      const rounds = 10
      // wait for the menu to appear. IE11 may be a bit slow.
      this._poll(predicate, timeout, rounds, increaseTimeout, triggerResize)
    },
    onDropdownClose () {
      this.addedHeight = 0
      eventBus.$emit('requestResize')
    }
  }
}
</script>

<style lang="sass" scoped>
.v-select
  // default background is transparent.
  background-color: white
</style>
