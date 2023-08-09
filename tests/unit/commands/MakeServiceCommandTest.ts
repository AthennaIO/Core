/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { File } from '@athenna/common'
import { Config } from '@athenna/config'
import { Artisan } from '@athenna/artisan'
import { Test, ExitFaker, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeServiceCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAServiceFile({ assert }: Context) {
    await Artisan.call('make:service TestService', false)

    const path = Path.services('TestService.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.containsSubset(Config.get('rc.services'), ['#app/services/TestService'])
    assert.containsSubset(athenna.services, ['#app/services/TestService'])
  }

  @Test()
  public async shouldBeAbleToCreateAServiceFileInDifferentDestPath({ assert }: Context) {
    Config.set('rc.commands.make:service.destination', Path.stubs('storage/services'))

    await Artisan.call('make:service TestService', false)

    const path = Path.stubs('storage/services/TestService.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.containsSubset(Config.get('rc.services'), ['#tests/stubs/storage/services/TestService'])
    assert.containsSubset(athenna.services, ['#tests/stubs/storage/services/TestService'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: Context) {
    await Artisan.call('make:service TestService', false)
    await Artisan.call('make:service TestService', false)

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}