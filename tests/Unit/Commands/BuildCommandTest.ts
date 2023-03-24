/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Artisan } from '@athenna/artisan'
import { Exec, File, Folder } from '@athenna/common'
import { Test, TestContext, Timeout } from '@athenna/test'
import { BaseCommandTest } from '#tests/Helpers/BaseCommandTest'

export default class BuildCommandTest extends BaseCommandTest {
  @Test()
  @Timeout(60000)
  public async shouldBeAbleToBuildTheApplication({ assert }: TestContext) {
    const { stdout, stderr } = await Artisan.callInChild('build', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('[ BUILDING APPLICATION ]'))
    assert.isTrue(stdout.includes('Compiling all .ts files from your application'))
    assert.isTrue(stdout.includes('Application successfully compiled'))
    assert.isTrue(await File.exists(Path.src('Applications/Artisan.js')))
    assert.isTrue(await File.exists(Path.src('Applications/Artisan.d.ts')))
    assert.isFalse(await File.exists(Path.tests('Unit/Applications/ArtisanTest.js')))
    assert.isFalse(await File.exists(Path.tests('Unit/Applications/ArtisanTest.d.ts')))
  }

  @Test()
  @Timeout(60000)
  public async shouldBeAbleToBuildTheApplicationEvenIfTsConfigAlreadyExistsInTmp({ assert }: TestContext) {
    await Artisan.callInChild('build', this.artisan)

    await Folder.safeRemove(Path.pwd('tmp'))
    await Exec.command(`cd ${Path.pwd()} && sh scripts/clean`)

    const { stdout, stderr } = await Artisan.callInChild('build', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('[ BUILDING APPLICATION ]'))
    assert.isTrue(stdout.includes('Compiling all .ts files from your application'))
    assert.isTrue(stdout.includes('Application successfully compiled'))
    assert.isTrue(await File.exists(Path.src('Applications/Artisan.js')))
    assert.isTrue(await File.exists(Path.src('Applications/Artisan.d.ts')))
    assert.isFalse(await File.exists(Path.tests('Unit/Applications/ArtisanTest.js')))
    assert.isFalse(await File.exists(Path.tests('Unit/Applications/ArtisanTest.d.ts')))
  }

  @Test()
  @Timeout(60000)
  public async shouldBeAbleToCleanAllJsAndDTsFilesFromTheApplication({ assert }: TestContext) {
    const { stdout, stderr } = await Artisan.callInChild('build --clean', this.artisan)

    assert.deepEqual(stderr, '')
    assert.isTrue(stdout.includes('[ CLEANING APPLICATION ]'))
    assert.isTrue(stdout.includes('Cleaning all .js, .d.ts and .js.map files from your application'))
    assert.isTrue(stdout.includes('Application successfully cleaned'))
    assert.isFalse(await File.exists(Path.src('Applications/Artisan.js')))
    assert.isFalse(await File.exists(Path.src('Applications/Artisan.d.ts')))
    assert.isTrue(await File.exists(Path.stubs('main.js')))
  }
}
