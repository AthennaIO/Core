/**
 * @athenna/artisan
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Artisan } from '@athenna/artisan'
import { File, Folder } from '@athenna/common'
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class BuildCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCompileTheApplication({ assert }: Context) {
    const { stdout, stderr } = await Artisan.callInChild('build', this.artisan)

    console.log(stderr)
    assert.isTrue(stdout.includes('Application successfully compiled'))
    assert.isTrue(Folder.existsSync(Path.stubs('build')))
    assert.isFalse(File.existsSync(Path.stubs('build/.env')))
    assert.isTrue(File.existsSync(Path.stubs('build/LICENSE.md')))
    assert.isTrue(File.existsSync(Path.stubs('build/app/index.js')))
    assert.isTrue(File.existsSync(Path.stubs('build/app/index.d.ts')))
  }
}
