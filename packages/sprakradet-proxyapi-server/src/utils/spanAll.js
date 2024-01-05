// Takes an array and a discriminator function
// e.g.:
//
// spanAll([aa, aba, ca, cb, ara], x => x.charAt(0))
// => [[aa, aba], [ca, cb], [ara]]
export default function spanAll (array, fn) {
  let a
  return array.reduce((acc, el) => {
    const res = fn(el)
    if (a === res) {
      acc[acc.length - 1].push(el)
    } else {
      a = res
      acc.push([el])
    }
    return acc
  }, [])
}
