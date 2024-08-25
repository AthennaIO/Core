import { Test, type Context } from '@athenna/test'

export default class TestTest {
  @Test()
  public async shouldBeEqual({ assert }: Context) {
    assert.equal(1, 1)
  }
}