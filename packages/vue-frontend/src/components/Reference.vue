<license>
  Vertraulich
</license>

<template>
<div>
  <span
  tabindex="0"
  @click="toggleShowRefernces"
  @keypress.enter.prevent="toggleShowRefernces"
  @keypress.space.prevent="toggleShowRefernces"
  :title="titleText">
    <strong>
      {{$t('References')}} {{showMoreSign}}
    </strong>
  </span>
  <ul v-if="showRefernces">
    <li
      v-for="(reference, index) in filterdRefrences"
      :key="index"
      :lang="language"
      v-html="refrenceText(reference)">
    </li>
  </ul>
</div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  name: 'Reference',
  components: {
  },
  data: function () {
    return {
      showRefernces: false
    }
  },
  props: {
    refrences: {
      required: true
    },
    language: {
      required: true
    }
  },
  computed: {
    titleText () {
      if (!this.showRefernces) {
        return this.$t('Show references')
      } else {
        return this.$t('Show references')
      }
    },
    showMoreSign () {
      if (!this.showRefernces) {
        return '+'
      } else {
        return '-'
      }
    },
    filterdRefrences () {
      const uList = []
      this.refrences.forEach((item, i) => {
        if (!uList.includes(item.reference)) uList.push(item.reference)
      })
      return uList
    },
    ...mapState('Termer', ['rightAlignedLanguages'])
  },
  methods: {
    toggleShowRefernces () {
      this.showRefernces = !this.showRefernces
    },
    refrenceText (text) {
      if (this.rightAlignedLanguages.includes(this.language)) {
        return '<div style="text-align: right;">' + text + '</div>'
      } else {
        return text
      }
    }
  }
}
</script>

<style lang="sass" scoped>
ul
  margin: 0
</style>
