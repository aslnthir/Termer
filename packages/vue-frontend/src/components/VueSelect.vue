<script>
const vSelect = () => import('vue-select/dist/vue-select.js')
// ^ vue-select/src/index.js caused this error in IE11: “Reason: SyntaxError: Expected ':'”
export default {
  functional: true,
  components: { vSelect },
  render (createElement, context) {
    // https://vuejs.org/v2/guide/render-function.html#The-Data-Object-In-Depth
    const data = {
      ...context.data,
      props: context.props
    }
    return createElement(vSelect, data)
  }
}
</script>
