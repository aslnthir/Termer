<license>
  Vertraulich
</license>

<template>
<div id="install-addon-view" class="fullHeight">
  <div class="content">
  <p class="ptag"><button v-on:click="install">{{ $t('Click to install for Firefox') }}</button></p>
  <p class="ptag"><a href="https://chrome.google.com/webstore/detail/tingtun-termer/paaggbegnemfekmbabdacfnmkmodfadm">{{ $t('Click to install for Chrome') }}</a></p>
  <a v-if="backUrl" title="Back to the previus page" :href="backUrl">{{ $t('Back') }}</a>
  </div>
</div>
</template>

<script>

export default {
  name: 'installAddon',
  data () {
    return {
    }
  },
  components: {
  },
  computed: {
    backUrl () {
      if (this.$route.query.back) return decodeURIComponent(this.$route.query.back)
      return false
    }
  },
  created: function () {
  },
  methods: {
    install: function () {
      let textString = this.$t('Install Tingtun Termer for Firefox')
      if (!textString) {
        textString = 'fail'
      }
      var xpi = { [textString]: '/media/webextensions/firefox/gecko/tingtun-glossary@glossary.tingtun.no/latest.zip?t=' + new Date() }
      window.InstallTrigger.install(xpi)
    }
  },
  metaInfo () {
    return {
      title: this.$t('Install Addon')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.content
  padding: 1em
  background: var(--information-box-color)
  border: solid thin
  border-radius: 1em
  margin-left: -100px
  top: 50%
  margin-top: -102px
  display: table
  left: 50%
  position: relative
  // margin-top: 2em
.ptag
  display: block
.fullHeight
  height: 100%
</style>
