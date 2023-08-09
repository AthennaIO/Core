/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File } from '@athenna/common'
import { Artisan } from '@athenna/artisan'
import { Test, ExitFaker, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeTestCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAnE2ETestFileAsClass({ assert }: Context) {
    await Artisan.call('make:test TestTest', false)

    const path = Path.tests('e2e/TestTest.ts')
    const file = await new File(path).load({ withContent: true })

    assert.isTrue(file.fileExists)
    assert.isTrue(file.content.toString().includes('export default class TestTest'))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldBeAbleToCreateATestFileInDifferentDestPath({ assert }: Context) {
    Config.set('rc.commands.make:test.destination', Path.stubs('storage/tests'))

    await Artisan.call('make:test TestTest', false)

    const path = Path.stubs('storage/tests/TestTest.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldBeAbleToCreateAnUnitTestFileAsClass({ assert }: Context) {
    await Artisan.call('make:test TestTest --unit', false)

    const path = Path.tests('unit/TestTest.ts')
    const file = await new File(path).load({ withContent: true })

    assert.isTrue(file.fileExists)
    assert.isTrue(file.content.toString().includes('export default class TestTest'))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldBeAbleToCreateAnE2ETestFileAsFunction({ assert }: Context) {
    await Artisan.call('make:test TestTest --function', false)

    const path = Path.tests('e2e/TestTest.ts')
    const file = await new File(path).load({ withContent: true })

    assert.isTrue(file.fileExists)
    assert.isTrue(file.content.toString().includes("test.group('TestTest'"))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldBeAbleToCreateAnUnitTestFileAsFunction({ assert }: Context) {
    await Artisan.call('make:test TestTest --unit --function', false)

    const path = Path.tests('unit/TestTest.ts')
    const file = await new File(path).load({ withContent: true })

    assert.isTrue(file.fileExists)
    assert.isTrue(file.content.toString().includes("test.group('TestTest'"))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: Context) {
    await Artisan.call('make:test TestTest', false)
    await Artisan.call('make:test TestTest', false)

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
