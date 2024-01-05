import spanAll from '../src/utils/spanAll'

describe('spanAll', () => {
  it('works', () => {
    function fn(a) { return a % 2 }
    const arr = [1, 3, 2, 4, 5, 6]
    const expected = [[1,3], [2,4], [5], [6]]
    const result = spanAll(arr, fn)
    expect(result).toEqual(expected)
  })
})
