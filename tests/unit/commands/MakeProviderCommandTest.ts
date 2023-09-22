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
import { Test, type Context } from '@athenna/test'
import { BaseCommandTest } from '#tests/helpers/BaseCommandTest'

export default class MakeProviderCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAProviderFile({ assert }: Context) {
    await Artisan.call('make:provider TestProvider', false)

    const path = Path.providers('TestProvider.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(this.processExitMock.calledOnceWith(0))

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.containsSubset(Config.get('rc.providers'), ['#providers/TestProvider'])
    assert.containsSubset(athenna.providers, ['#providers/TestProvider'])
  }

  @Test()
  public async shouldBeAbleToCreateAProviderFileInDifferentDestPath({ assert }: Context) {
    Config.set('rc.commands.make:provider.destination', Path.fixtures('storage/providers'))

    await Artisan.call('make:provider TestProvider', false)

    const path = Path.fixtures('storage/providers/TestProvider.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(this.processExitMock.calledOnceWith(0))

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.containsSubset(Config.get('rc.providers'), ['#tests/fixtures/storage/providers/TestProvider'])
    assert.containsSubset(athenna.providers, ['#tests/fixtures/storage/providers/TestProvider'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: Context) {
    await Artisan.call('make:provider TestProvider', false)
    await Artisan.call('make:provider TestProvider', false)

    assert.isTrue(this.processExitMock.calledWith(1))
  }
}
