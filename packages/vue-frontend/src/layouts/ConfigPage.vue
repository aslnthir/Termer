<template>
<layout>
  <template #header>
    <tingtun-header>
      <frame-controls></frame-controls>
    </tingtun-header>
  </template>

  <template #main>
    <!-- <router-view></router-view> -->
    <slot />
  </template>

  <template #footer>
    <hr>
    <footer-component class="footer"></footer-component>
  </template>
</layout>
</template>

<script>
import TingtunHeader from '@/components/TingtunHeader'
import FooterComponent from '@/components/FooterComponent'
import FrameControls from '@/components/FrameControls'

import Layout from '@/layouts/3rows'
export default {
  components: {
    TingtunHeader,
    FooterComponent,
    Layout,
    FrameControls
  }
}
</script>
