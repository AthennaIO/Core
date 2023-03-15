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
import { Test, ExitFaker, TestContext } from '@athenna/test'
import { BaseCommandTest } from '#tests/Helpers/BaseCommandTest'

export default class MakeTestCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAnE2ETestFileAsClass({ assert }: TestContext) {
    await Artisan.call('make:test TestTest')

    const path = Path.tests('E2E/TestTest.ts')
    const file = await new File(path).load({ withContent: true })

    assert.isTrue(file.fileExists)
    assert.isTrue(file.content.toString().includes('export default class TestTest'))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldBeAbleToCreateAnUnitTestFileAsClass({ assert }: TestContext) {
    await Artisan.call('make:test TestTest --unit')

    const path = Path.tests('Unit/TestTest.ts')
    const file = await new File(path).load({ withContent: true })

    assert.isTrue(file.fileExists)
    assert.isTrue(file.content.toString().includes('export default class TestTest'))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldBeAbleToCreateAnE2ETestFileAsFunction({ assert }: TestContext) {
    await Artisan.call('make:test TestTest --function')

    const path = Path.tests('E2E/TestTest.ts')
    const file = await new File(path).load({ withContent: true })

    assert.isTrue(file.fileExists)
    assert.isTrue(file.content.toString().includes("test.group('TestTest'"))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldBeAbleToCreateAnUnitTestFileAsFunction({ assert }: TestContext) {
    await Artisan.call('make:test TestTest --unit --function')

    const path = Path.tests('Unit/TestTest.ts')
    const file = await new File(path).load({ withContent: true })

    assert.isTrue(file.fileExists)
    assert.isTrue(file.content.toString().includes("test.group('TestTest'"))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: TestContext) {
    await Artisan.call('make:test TestTest')
    await Artisan.call('make:test TestTest')

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
