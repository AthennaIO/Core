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
import { Test, ExitFaker, TestContext } from '@athenna/test'
import { BaseCommandTest } from '#tests/Helpers/BaseCommandTest'

export default class MakeServiceCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAServiceFile({ assert }: TestContext) {
    await Artisan.call('make:service TestService')

    const path = Path.services('TestService.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.containsSubset(Config.get('rc.services'), ['#app/Services/TestService'])
    assert.containsSubset(athenna.services, ['#app/Services/TestService'])
  }

  @Test()
  public async shouldBeAbleToCreateAServiceFileInDifferentDestPath({ assert }: TestContext) {
    Config.set('rc.commandsManifest.make:service.destination', Path.stubs('storage/services'))

    await Artisan.call('make:service TestService')

    const path = Path.stubs('storage/services/TestService.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.containsSubset(Config.get('rc.services'), ['#tests/Stubs/storage/services/TestService'])
    assert.containsSubset(athenna.services, ['#tests/Stubs/storage/services/TestService'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: TestContext) {
    await Artisan.call('make:service TestService')
    await Artisan.call('make:service TestService')

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
