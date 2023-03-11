/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { LoadHelper } from '#src'
import { Test, BeforeEach, TestContext } from '@athenna/test'

export default class LoadHelperTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()

    Config.set('rc.meta', Config.get('meta'))
    Config.set('rc.providers', [
      '#tests/Stubs/providers/ReplEnvProvider',
      '#tests/Stubs/providers/HttpEnvProvider',
      '#tests/Stubs/providers/WorkerEnvProvider',
      '#tests/Stubs/providers/ConsoleEnvProvider',
      '#tests/Stubs/providers/HttpAndConsoleEnvProvider',
    ])

    LoadHelper.providers = []
    Config.set('rc.environments', [])
  }

  @Test()
  public async shouldBeAbleToLoadBootableProvidersByConsoleEnvironment({ assert }: TestContext) {
    Config.set('rc.environments', ['repl'])

    await LoadHelper.loadBootableProviders()

    assert.lengthOf(LoadHelper.providers, 1)
    assert.equal(LoadHelper.providers[0].name, 'ReplEnvProvider')
  }

  @Test()
  public async shouldBeAbleToLoadBootableProvidersByHttpEnvironment({ assert }: TestContext) {
    Config.set('rc.environments', ['http'])

    await LoadHelper.loadBootableProviders()

    assert.lengthOf(LoadHelper.providers, 2)
    assert.equal(LoadHelper.providers[0].name, 'HttpEnvProvider')
    assert.equal(LoadHelper.providers[1].name, 'HttpAndConsoleEnvProvider')
  }

  @Test()
  public async shouldBeAbleToLoadBootableProvidersByHttpAndConsoleEnvironment({ assert }: TestContext) {
    Config.set('rc.environments', ['http', 'console'])

    await LoadHelper.loadBootableProviders()

    assert.lengthOf(LoadHelper.providers, 3)
    assert.equal(LoadHelper.providers[0].name, 'HttpEnvProvider')
    assert.equal(LoadHelper.providers[1].name, 'ConsoleEnvProvider')
    assert.equal(LoadHelper.providers[2].name, 'HttpAndConsoleEnvProvider')
  }

  @Test()
  public async shouldLoadAllProvidersIfEnvironmentsIsAnEmptyArray({ assert }: TestContext) {
    Config.set('rc.environments', [])

    await LoadHelper.loadBootableProviders()

    assert.lengthOf(LoadHelper.providers, 5)
  }
}
