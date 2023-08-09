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

export default class ReplCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToRunTheReplApplication({ assert }: Context) {
    const { stdout, stderr } = await Artisan.callInChild('repl', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('running repl session'))
  }

  @Test()
  public async shouldBeAbleToRunTheReplApplicationWithDifferentNodeEnv({ assert }: Context) {
    const { stdout, stderr } = await Artisan.callInChild('repl --env heyhey', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('heyhey'))
  }
}
