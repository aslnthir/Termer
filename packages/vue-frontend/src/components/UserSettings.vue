<template>
<div>
  <h3>{{ $t('Dictionary settings') }}</h3>
  <default-glossaries
    v-model="tingtunDefault"
    :options="sources"></default-glossaries>
  <label>
    <span>{{ $t('Hide public') }}</span>
    <input v-model="hide_public_glossaries" type="checkbox" />
  </label><br>
  <label>
    {{ $t('Hide private') }}
    <input v-model="hide_private_glossaries" type="checkbox" />
  </label><br>
  <label>
    {{ $t('Hide group') }}
    <input v-model="hide_group_glossaries" type="checkbox" />
  </label><br>
</div>
</template>

<script>
import defaultGlossaries from './DefaultGlossaries'
import { mapUserFields } from '@/store/user'
import { mapGetters } from 'vuex'

export default {
  name: 'userSettings',
  components: {
    defaultGlossaries
  },
  computed: {
    ...mapUserFields([
      'usersettings.hide_public_glossaries',
      'usersettings.hide_private_glossaries',
      'usersettings.hide_group_glossaries',
      'usersettings.stored_selected_glossaries.tingtunDefault'
    ]),
    ...mapGetters(['sources'])
  }
}
</script>

<style lang="sass" scoped>
h3
  margin-top: 0em
</style>
