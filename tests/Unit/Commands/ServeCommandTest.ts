/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Artisan } from '@athenna/artisan'
import { File, Folder } from '@athenna/common'
import { BaseCommandTest } from '#tests/Helpers/BaseCommandTest'
import { Test, TestContext, AfterEach } from '@athenna/test'

export default class ServeCommandTest extends BaseCommandTest {
  @AfterEach()
  public async deleteBootstrap() {
    await Folder.safeRemove(Path.bootstrap())
  }

  @Test()
  public async shouldBeAbleToServeTheApplication({ assert }: TestContext) {
    await new File(Path.bootstrap('main.ts'), 'console.log("Hello World")').load()

    const { stdout } = await Artisan.callInChild('serve', this.artisan)

    assert.isTrue(stdout.includes('Hello World'))
  }

  @Test()
  public async shouldBeAbleToServeTheApplicationWithDifferentNodeEnv({ assert }: TestContext) {
    await new File(Path.bootstrap('main.ts'), 'console.log(process.env.NODE_ENV)').load()

    const { stdout } = await Artisan.callInChild('serve --env heyhey', this.artisan)

    assert.isTrue(stdout.includes('heyhey'))
  }

  @Test()
  public async shouldBeAbleToServeTheApplicationInWatchMode({ assert }: TestContext) {
    await new File(Path.bootstrap('main.ts'), 'console.log("Hello World")').load()

    const { stdout } = await Artisan.callInChild('serve --watch', this.artisan)

    assert.isTrue(stdout.includes('Hello World'))
  }
}
