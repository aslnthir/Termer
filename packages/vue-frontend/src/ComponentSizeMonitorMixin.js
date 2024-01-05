import debounce from 'lodash/debounce'
import eventBus from './eventbus'

const resizeFun = debounce(() => {
  eventBus.$emit('requestResize')
}, 10)

export default {
  mounted: resizeFun,
  destroyed: resizeFun,
  updated: resizeFun
}
