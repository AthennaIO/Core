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

export default class ServeCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToServeTheApplication({ assert }: TestContext) {
    const { stdout, stderr } = await Artisan.callInChild('serve', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('serving application'))
  }

  @Test()
  public async shouldBeAbleToServeTheApplicationWithDifferentNodeEnv({ assert }: TestContext) {
    const { stdout, stderr } = await Artisan.callInChild('serve --env heyhey', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('heyhey'))
  }

  @Test()
  public async shouldBeAbleToServeTheApplicationInWatchMode({ assert }: TestContext) {
    const { stdout, stderr } = await Artisan.callInChild('serve --watch', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('serving application'))
  }
}
