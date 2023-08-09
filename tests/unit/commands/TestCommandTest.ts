/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Test } from '@athenna/test'
import { Artisan } from '@athenna/artisan'
import type { Context } from '@athenna/test/types'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class TestCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToRunTheApplicationTests({ assert }: Context) {
    const { stdout, stderr } = await Artisan.callInChild('test', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('running tests'))
  }

  @Test()
  public async shouldBeAbleToRunTheApplicationTestsWithDifferentNodeEnv({ assert }: Context) {
    const { stdout, stderr } = await Artisan.callInChild('test --env heyhey', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('heyhey'))
  }
}
