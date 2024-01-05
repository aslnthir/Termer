declare module 'flyd-debouncetime' {
  import * as flyd from 'flyd'
  interface Debounce {
    <T>(timeout: number, stream: flyd.Stream<T>): flyd.Stream<T>
    <T>(timeout: number): (stream: flyd.Stream<T>) => flyd.Stream<T>
  }
  const _Debounce: Debounce
  export = _Debounce
}
