<license>
  Vertraulich
</license>

<template>
 <div class="onoffswitch"
      tabindex="1"
      @keyup.enter.space.prevent="toggleChecked">
  <input type="checkbox"
         name="onoffswitch"
         class="onoffswitch-checkbox"
         id="myonoffswitch"
         :checked="checked"
         @click="toggleChecked"/>
  <label class="onoffswitch-label" for="myonoffswitch">
   <span :data-content-on="$t('ON')"
         :data-content-off="$t('OFF')"
         class="onoffswitch-inner"
         :class="{ 'enable-transitions': enableTransitions }">
   </span>
   <span class="onoffswitch-switch"
         :class="{ 'enable-transitions': enableTransitions }">
   </span>
  </label>
 </div>
</template>

<script>
export default {
  name: 'onoffbutton',
  props: {
    value: {
      default: false
    }
  },
  data () {
    return {
      enableTransitions: true,
      checked: this.value
    }
  },
  watch: {
    value () {
      if (this.checked !== this.value) {
        // Disable transitions if the value prop was changed by the parent
        // component. This switches the checkbox over immediately instead of
        // animating it.
        this.enableTransitions = false
        window.setTimeout(() => {
          this.enableTransitions = true
        }, 0)
      }
      this.checked = this.value
    }
  },
  methods: {
    toggleChecked () {
      this.checked = !this.checked
      this.$emit('input', this.checked)
    }
  }
}
</script>

<style lang="css" scoped>
/*
* Taken from: https://proto.io/freebies/onoff/
*/
.onoffswitch {
  position:relative;
  width: 5.625em;
  display:inline-block;
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select: none;
   visibility: visible;
}
.onoffswitch-checkbox {
    display: none;
}
.onoffswitch-label {
    display: block;
    overflow: hidden;
    cursor: pointer;
    border: 0.125em solid #999999;
    border-radius: 1.25em;
}
.onoffswitch-inner {
    display: block;
    width: 200%;
    margin-left: -100%;
    transition-property: margin;
}
.onoffswitch-inner:before, .onoffswitch-inner:after {
    display: block;
    float: left;
    width: 50%;
    height: 1.875em;
    padding: 0;
    line-height: 1.875em;
    font-size: 0.875em;
    color: white;
    font-family: Trebuchet, Arial, sans-serif;
    font-weight: bold;
    box-sizing: border-box;
}
.onoffswitch-inner:before {
    content: attr(data-content-on);
    padding-left: 0.625em;
    background-color: white;
    color: #999999;
}
.onoffswitch-inner:after {
    content: attr(data-content-off);
    padding-right: 0.625em;
    background-color: #E7E7E7;
    color: #999999;
    text-align: right;
}
.onoffswitch-switch {
    display: block;
    width: 1.125em;
    height: 1.125em;
    margin: 0.225em 0.375em;
    background: #FFFFFF;
    position: absolute;
    right: 3.5em;
    border: 0.125em solid #999999; border-radius: 1.25em;
    transition-property: all;
}
.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {
    margin-left: 0;
}
.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch {
    right: 0;
    background: #72bf4b;
    border: 0.125em solid #72bf4b;
}

.enable-transitions {
    transition: 0.3s ease-in 0s;
}

</style>
