/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Artisan } from '@athenna/artisan'
import { Test, TestContext } from '@athenna/test'
import { BaseCommandTest } from '#tests/Helpers/BaseCommandTest'

export default class TestCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToRunTheApplicationTests({ assert }: TestContext) {
    const { stdout, stderr } = await Artisan.callInChild('test', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('running tests'))
  }

  @Test()
  public async shouldBeAbleToRunTheApplicationTestsWithDifferentNodeEnv({ assert }: TestContext) {
    const { stdout, stderr } = await Artisan.callInChild('test --env heyhey', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('heyhey'))
  }
}
