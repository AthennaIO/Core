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

export default class MakeExceptionCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAnExceptionFile({ assert }: TestContext) {
    await Artisan.call('make:exception TestException', false)

    const path = Path.app('Exceptions/TestException.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldBeAbleToCreateAnExceptionFileInDifferentDestPath({ assert }: TestContext) {
    Config.set('rc.commands.make:exception.destination', Path.stubs('storage/exceptions'))

    await Artisan.call('make:exception TestException', false)

    const path = Path.stubs('storage/exceptions/TestException.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: TestContext) {
    await Artisan.call('make:exception TestException', false)
    await Artisan.call('make:exception TestException', false)

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
