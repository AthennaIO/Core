/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Artisan } from '@athenna/artisan'
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class ServeCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToServeTheApplication({ assert }: Context) {
    const { stdout, stderr } = await Artisan.callInChild('serve', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('serving application'))
  }

  @Test()
  public async shouldBeAbleToServeTheApplicationWithDifferentNodeEnv({ assert }: Context) {
    const { stdout, stderr } = await Artisan.callInChild('serve --env heyhey', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('heyhey'))
  }
}
