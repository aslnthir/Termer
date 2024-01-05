<template>
  <div id="defaultcontainer">
    <h4>{{ $t('Select default dictionary') }}</h4>
    <VueSelect
      multiple
      name="sources"
      :options="computedOptions"
      :value="computedValue"
      @input="input"
      @search:focus="onDropdownOpen"
      @search:blur="onDropdownClose"
      ref="select">
    </VueSelect>
    <div id="spacer" :style="{height: addedHeight + 'px'}"></div>
  </div>
</template>

<script>
import VueSelect from './VueSelect'
import eventBus from '../eventbus'

function arraysAreEqual (arrayA, arrayB) {
  return arrayA.length === arrayB.length &&
    arrayA.every((item, index) => item === arrayB[index])
}

export default {
  name: 'defaultGlossaries',
  props: {
    // options: Object with available source objects.
    options: { type: Object, default: () => { return {} } },
    // value: Array of selected source IDs.
    value: { type: Array, default: () => [] }
  },
  components: {
    VueSelect
  },
  data () {
    return {
      addedHeight: 0
    }
  },
  computed: {
    // Converts the options Object into an Array of objects with `label` and `value` keys.
    computedOptions () {
      const x = []
      for (const [id, { name }] of Object.entries(this.options)) {
        x.push({ value: id, label: name })
      }
      return x
    },
    // Converts the value Array into an Array with the same format as computedOptions.
    computedValue () {
      const x = []
      for (const id of this.value) {
        const source = this.options[id]
        if (!source) continue
        x.push({ value: id, label: source.name })
      }
      return x
    }
  },
  methods: {
    input (selected) {
      selected = selected.map(x => parseInt(x.value))
      if (arraysAreEqual(selected, this.value)) return
      this.$emit('input', selected)
      eventBus.$emit('requestResize')
    },
    onDropdownOpen () {
      setTimeout(() => {
        // setTimeout in order to wait for the menu to appear.
        const menu = this.$refs.select.$refs.dropdownMenu
        if (menu) {
          this.addedHeight = menu.scrollHeight
          eventBus.$emit('requestResize')
        }
      }, 0)
    },
    onDropdownClose () {
      this.addedHeight = 0
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
#defaultcontainer
  margin: 0 auto
select
  width: 50%
  min-width: 100%
.v-select
  // default background is transparent.
  background-color: white
h4
  margin-bottom: 0em
</style>
