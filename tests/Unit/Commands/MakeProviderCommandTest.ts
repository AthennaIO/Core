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

export default class MakeProviderCommandTest extends BaseCommandTest {
  @Test()
  public async shouldBeAbleToCreateAProviderFile({ assert }: TestContext) {
    await Artisan.call('make:provider TestProvider')

    const path = Path.providers('TestProvider.ts')

    assert.isTrue(await File.exists(path))
    assert.isTrue(ExitFaker.faker.calledOnceWith(0))

    const { athenna } = await new File(Path.pwd('package.json')).getContentAsJson()

    assert.containsSubset(Config.get('rc.providers'), ['#providers/TestProvider'])
    assert.containsSubset(athenna.providers, ['#providers/TestProvider'])
  }

  @Test()
  public async shouldThrowAnExceptionWhenTheFileAlreadyExists({ assert }: TestContext) {
    await Artisan.call('make:provider TestProvider')
    await Artisan.call('make:provider TestProvider')

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }
}
