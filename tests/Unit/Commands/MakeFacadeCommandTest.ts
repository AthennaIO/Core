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

export default class MakeFacadeCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAFacadeFile({ assert }: TestContext) {
    await Artisan.call('make:facade TestFacade')

    const path = Path.facades('TestFacade.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: TestContext) {
    await Artisan.call('make:facade TestFacade')
    await Artisan.call('make:facade TestFacade')

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
