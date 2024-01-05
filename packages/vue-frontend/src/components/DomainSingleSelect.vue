<license>
  Vertraulich
</license>

<template>
  <div id="domaincontainer">
  <hr>
    <VueSelect
      name="sources"
      label="domain_name"
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
import eventBus from '../eventbus'
import VueSelect from './VueSelect'
import { mapGetters } from 'vuex'
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
      domainChoices: [],
      active: true
    }
  },
  computed: {
    domainChoice () {
      for (const i in this.domainChoices) {
        if (this.domainChoices[i].domain_number === this.domains) {
          return this.domainChoices[i]
        }
      }
      return { domain_name: 'All IATE domains', domain_number: '' }
    },
    domainChoicesSorted () {
      let sorted = []
      for (var i = 0; i < this.domainChoices.length; i++) {
        if (this.domainChoices[i].domain_number.length <= 2) {
          sorted.push(this.domainChoices[i])
        }
      }
      const obj = { domain_name: 'ALL DOMAINS', domain_number: 'None' }
      sorted.push(obj)
      sorted = sorted.sort(function (a, b) {
        return a.domain_name.localeCompare(b.domain_name)
      })

      return sorted
    },
    ...mapGetters(['GlossaryAPI', 'domains'])
  },
  created: function () {
    this.GlossaryAPI.getDomains({})
      .then(response => {
        this.domainChoices = response
      })
      .catch(() => {
        this.domainChoices = []
      })
  },
  methods: {
    change (selected) {
      if ('domain_number' in selected && (!this.domainChoice || selected.domain_number !== this.domainChoice.domain_number)) {
        // Do this only if something is selected.
        this.$store.dispatch('updateDomains', selected.domain_number)
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
