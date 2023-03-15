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
  public async shouldBeAbleToCreateAExceptionFile({ assert }: TestContext) {
    await Artisan.call('make:exception TestException')

    const path = Path.app('Exceptions/TestException.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: TestContext) {
    await Artisan.call('make:exception TestException')
    await Artisan.call('make:exception TestException')

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
