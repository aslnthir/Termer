<license>
  Vertraulich
</license>

<template>
  <div id="domaincontainer">
    <VueSelect
      name="sources"
      label="name"
      :options="domainChoicesSorted"
      :value="domainChoice"
      @input="change"
      @search:focus="onDropdownOpen"
      @search:blur="onDropdownClose"
      ref="select">
    </VueSelect>
    <div id="spacer" :style="{height: addedHeight + 'px'}"></div>
  </div>
</template>

<script>
import eventBus from '../../eventbus'
import VueSelect from '../VueSelect'
import { mapState } from 'vuex'
export default {
  name: 'domain-select',
  components: {
    VueSelect
  },
  props: {
    value: {
      default: false
    }
  },
  data () {
    return {
      addedHeight: 0,
      active: true,
      domains: ['']
    }
  },
  computed: {
    domainChoices () {
      const returnVal = Object.entries(this.termDomains).map(([backend, data]) => {
        if (data.type === 'success') {
          return Object.values(data.data)
        } else return []
      }).flat()
      // console.log('domains', returnVal)
      return returnVal
    },
    domainChoice () {
      for (const i in this.domainChoices) {
        if (this.domains.includes(this.domainChoices[i].id)) {
          return this.domainChoices[i]
        }
      }
      return { name: 'All IATE domains', id: '' }
    },
    domainChoicesSorted () {
      let sorted = []
      for (var i = 0; i < this.domainChoices.length; i++) {
        if (this.domainChoices[i].id.length <= 2) {
          sorted.push(this.domainChoices[i])
        }
      }
      const obj = { name: 'ALL DOMAINS', id: 'None' }
      sorted.push(obj)
      sorted = sorted.sort(function (a, b) {
        return a.name.localeCompare(b.name)
      })
      return sorted
    },
    ...mapState('Termer', ['termDomains', 'userSelectedTermDomains'])
  },
  created: function () {
    this.domains = this.userSelectedTermDomains
  },
  methods: {
    change (selected) {
      if (selected && 'id' in selected &&
        (!this.domainChoice ||
        selected.id !== this.domainChoice.id)) {
        // Do this only if something is selected.
        this.$emit('update-event', {
          type: 'Termer/updateUserSelectedTermDomains',
          value: [selected.id]
        })
        eventBus.$emit('requestResize')
        if (this.value) {
          this.$store.dispatch('reloadMarkup')
        } else {
          this.$store.dispatch('Conf/activate', true)
          this.$emit('input', true)
        }
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
#domaincontainer
  margin: 0 auto
select
  width: 50%
  min-width: 100%
.v-select
  // default background is transparent.
  background-color: white
</style>
