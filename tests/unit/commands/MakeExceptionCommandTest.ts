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
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeExceptionCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAnExceptionFile({ assert }: Context) {
    await Artisan.call('make:exception TestException', false)

    const path = Path.exceptions('TestException.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(this.processExitMock.calledOnceWith(0))
  }

  @Test()
  public async shouldBeAbleToCreateAnExceptionFileInDifferentDestPath({ assert }: Context) {
    Config.set('rc.commands.make:exception.destination', Path.fixtures('storage/exceptions'))

    await Artisan.call('make:exception TestException', false)

    const path = Path.fixtures('storage/exceptions/TestException.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(this.processExitMock.calledOnceWith(0))
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: Context) {
    await Artisan.call('make:exception TestException', false)
    await Artisan.call('make:exception TestException', false)

    assert.isTrue(this.processExitMock.calledWith(1))
  }
}
