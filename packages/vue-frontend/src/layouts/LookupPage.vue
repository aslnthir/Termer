<template>
<layout>
  <template #header>
    <heading :header="term" id="heading"></heading>
  </template>

  <template #main>
    <!-- <router-view></router-view> -->
    <slot />
  </template>

  <template #footer>
    <div id="help-links" @click="hideSearch">
      <a v-if="appStyle === 'wien'"
         :title="$t('This link will open a new window')"
         href="https://www.geschichtewiki.wien.gv.at/Wien_Geschichte_Wiki"
         target="_blank">Magistratslexikon</a>
      <a v-else
         class="tingtunLogo"
         :title="$t('This link will open a new window')"
         href="http://tingtun.no" target="_blank">
         <img
          src="../assets/logo.png"
          class="termerLogoImage">
       </a>
    </div>
      <!--<pbt-button></pbt-button>-->
      <div class="feedbackDiv">
        <FeedbackComponent/>
      </div>
  </template>
</layout>
</template>

<script>
import Heading from '@/components/Heading'
import Layout from '@/layouts/3rows'
// import PbtButton from '@/components/PbtButton'
import FeedbackComponent from '@/components/FeedbackComponent'
import eventBus from '../eventbus'
export default {
  components: {
    Heading,
    Layout,
    FeedbackComponent
    // PbtButton
  },
  props: {
    appStyle: {
      default: ''
    }
  },
  methods: {
    hideSearch () {
      eventBus.$emit('hide-search-field')
    }
  },
  computed: {
    term () {
      return this.$route.params.term || ''
    }
  }
}
</script>
<style lang="sass" scoped>
#heading
  margin-left: 3px // steer clear of the rounded corner
  margin-top: 2px // steer clear of the rounded corner
  background-color: #fffde9

#help-links
  margin-top: 1.2em
  margin-left: 2px // steer clear of the rounded corner
  font-size: 8pt

.tingtunLogo
  position: absolute
  bottom: 0px

.termerLogoImage
  width: 7em
  background: #efefef
  border: thin solid #d0d0d0
  border-radius: 5px

.feedbackDiv
  position: absolute
  bottom: 5px
  right: 5px
</style>
