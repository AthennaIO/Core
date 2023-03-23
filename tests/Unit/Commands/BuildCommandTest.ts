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
import { Exec, File, Folder } from '@athenna/common'
import { BaseCommandTest } from '#tests/Helpers/BaseCommandTest'

export default class BuildCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToBuildTheApplication({ assert }: TestContext) {
    const { stdout, stderr } = await Artisan.callInChild('build', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('Application successfully compiled'))
    assert.isTrue(await File.exists(Path.src('Applications/Artisan.js')))
    assert.isTrue(await File.exists(Path.src('Applications/Artisan.d.ts')))
    assert.isFalse(await File.exists(Path.tests('Unit/Applications/ArtisanTest.js')))
    assert.isFalse(await File.exists(Path.tests('Unit/Applications/ArtisanTest.d.ts')))
  }

  @Test()
  public async shouldBeAbleToBuildTheApplicationEvenIfTsConfigAlreadyExistsInTmp({ assert }: TestContext) {
    await Artisan.callInChild('build', this.artisan)

    await Folder.safeRemove(Path.pwd('tmp'))
    await Exec.command(`cd ${Path.pwd()} && sh scripts/clean`)

    const { stdout, stderr } = await Artisan.callInChild('build', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('Application successfully compiled'))
    assert.isTrue(await File.exists(Path.src('Applications/Artisan.js')))
    assert.isTrue(await File.exists(Path.src('Applications/Artisan.d.ts')))
    assert.isFalse(await File.exists(Path.tests('Unit/Applications/ArtisanTest.js')))
    assert.isFalse(await File.exists(Path.tests('Unit/Applications/ArtisanTest.d.ts')))
  }

  @Test()
  public async shouldBeAbleToCleanAllJsAndDTsFilesFromTheApplication({ assert }: TestContext) {
    const { stdout, stderr } = await Artisan.callInChild('build --clean', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('Application successfully cleaned'))
    assert.isFalse(await File.exists(Path.src('Applications/Artisan.js')))
    assert.isFalse(await File.exists(Path.src('Applications/Artisan.d.ts')))
    assert.isTrue(await File.exists(Path.stubs('main.js')))
  }
}
