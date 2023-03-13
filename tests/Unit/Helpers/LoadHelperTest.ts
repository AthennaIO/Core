/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fake } from 'sinon'
import { LoadHelper } from '#src'
import { Log, LoggerProvider } from '@athenna/logger'
import { CALLED_MAP } from '#tests/Helpers/CalledMap'
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
    Config.set('rc.preloads', [])
    Config.set('rc.bootLogs', false)
    Config.set('rc.environments', [])

    new LoggerProvider().register()
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

  @Test()
  public async shouldLoadProviderIfHisFirstIndexOfEnvironmentMethodIsAnAstheristic({ assert }: TestContext) {
    Config.set('rc.environments', [])
    Config.set('rc.providers', [
      '#tests/Stubs/providers/AllEnvProvider',
      '#tests/Stubs/providers/ReplEnvProvider',
      '#tests/Stubs/providers/HttpEnvProvider',
      '#tests/Stubs/providers/WorkerEnvProvider',
      '#tests/Stubs/providers/ConsoleEnvProvider',
      '#tests/Stubs/providers/HttpAndConsoleEnvProvider',
    ])

    await LoadHelper.loadBootableProviders()

    assert.lengthOf(LoadHelper.providers, 6)
  }

  @Test()
  public async shouldBeAbleToRegisterProviders({ assert }: TestContext) {
    await LoadHelper.loadBootableProviders()
    await LoadHelper.registerProviders()

    assert.isFalse(ioc.hasDependency('ReplEnvBoot'))
    assert.isFalse(ioc.hasDependency('HttpEnvBoot'))
    assert.isFalse(ioc.hasDependency('WorkerEnvBoot'))
    assert.isFalse(ioc.hasDependency('ConsoleEnvBoot'))
    assert.isFalse(ioc.hasDependency('HttpAndConsoleEnvBoot'))
    assert.isTrue(ioc.hasDependency('ReplEnvRegister'))
    assert.isTrue(ioc.hasDependency('HttpEnvRegister'))
    assert.isTrue(ioc.hasDependency('WorkerEnvRegister'))
    assert.isTrue(ioc.hasDependency('ConsoleEnvRegister'))
    assert.isTrue(ioc.hasDependency('HttpAndConsoleEnvRegister'))
  }

  @Test()
  public async shouldBeAbleToBootProviders({ assert }: TestContext) {
    await LoadHelper.loadBootableProviders()
    await LoadHelper.bootProviders()

    assert.isTrue(ioc.hasDependency('ReplEnvBoot'))
    assert.isTrue(ioc.hasDependency('HttpEnvBoot'))
    assert.isTrue(ioc.hasDependency('WorkerEnvBoot'))
    assert.isTrue(ioc.hasDependency('ConsoleEnvBoot'))
    assert.isTrue(ioc.hasDependency('HttpAndConsoleEnvBoot'))
    assert.isFalse(ioc.hasDependency('ReplEnvRegister'))
    assert.isFalse(ioc.hasDependency('HttpEnvRegister'))
    assert.isFalse(ioc.hasDependency('WorkerEnvRegister'))
    assert.isFalse(ioc.hasDependency('ConsoleEnvRegister'))
    assert.isFalse(ioc.hasDependency('HttpAndConsoleEnvRegister'))
  }

  @Test()
  public async shouldBeAbleToShutdownProviders({ assert }: TestContext) {
    await LoadHelper.loadBootableProviders()
    await LoadHelper.shutdownProviders()

    assert.isFalse(ioc.hasDependency('ReplEnvBoot'))
    assert.isFalse(ioc.hasDependency('HttpEnvBoot'))
    assert.isFalse(ioc.hasDependency('WorkerEnvBoot'))
    assert.isFalse(ioc.hasDependency('ConsoleEnvBoot'))
    assert.isFalse(ioc.hasDependency('HttpAndConsoleEnvBoot'))
    assert.isFalse(ioc.hasDependency('ReplEnvRegister'))
    assert.isFalse(ioc.hasDependency('HttpEnvRegister'))
    assert.isFalse(ioc.hasDependency('WorkerEnvRegister'))
    assert.isFalse(ioc.hasDependency('ConsoleEnvRegister'))
    assert.isFalse(ioc.hasDependency('HttpAndConsoleEnvRegister'))
    assert.isTrue(ioc.hasDependency('ReplEnvShutdown'))
    assert.isTrue(ioc.hasDependency('HttpEnvShutdown'))
    assert.isTrue(ioc.hasDependency('WorkerEnvShutdown'))
    assert.isTrue(ioc.hasDependency('ConsoleEnvShutdown'))
    assert.isTrue(ioc.hasDependency('HttpAndConsoleEnvShutdown'))
  }

  @Test()
  public async shouldBeAbleToLogThatProvidersAreShutingdownIfRcBootLogsIsTrue({ assert }: TestContext) {
    Config.set('rc.bootLogs', true)

    const mock = Log.getMock()
    const successFake = fake()

    mock
      .expects('channelOrVanilla')
      .exactly(5)
      .withArgs('application')
      .returns({ success: args => successFake(args) })

    await LoadHelper.loadBootableProviders()
    await LoadHelper.shutdownProviders()

    assert.isTrue(successFake.calledWith('Provider ({yellow} ReplEnvProvider) successfully shutdown'))
    assert.isTrue(successFake.calledWith('Provider ({yellow} HttpEnvProvider) successfully shutdown'))
    assert.isTrue(successFake.calledWith('Provider ({yellow} WorkerEnvProvider) successfully shutdown'))
    assert.isTrue(successFake.calledWith('Provider ({yellow} ConsoleEnvProvider) successfully shutdown'))
    assert.isTrue(successFake.calledWith('Provider ({yellow} HttpAndConsoleEnvProvider) successfully shutdown'))

    mock.verify()
  }

  @Test()
  public async shouldBeAbleToRegootProviders({ assert }: TestContext) {
    await LoadHelper.regootProviders()

    assert.isTrue(ioc.hasDependency('ReplEnvBoot'))
    assert.isTrue(ioc.hasDependency('HttpEnvBoot'))
    assert.isTrue(ioc.hasDependency('WorkerEnvBoot'))
    assert.isTrue(ioc.hasDependency('ConsoleEnvBoot'))
    assert.isTrue(ioc.hasDependency('HttpAndConsoleEnvBoot'))
    assert.isTrue(ioc.hasDependency('ReplEnvRegister'))
    assert.isTrue(ioc.hasDependency('HttpEnvRegister'))
    assert.isTrue(ioc.hasDependency('WorkerEnvRegister'))
    assert.isTrue(ioc.hasDependency('ConsoleEnvRegister'))
    assert.isTrue(ioc.hasDependency('HttpAndConsoleEnvRegister'))
  }

  @Test()
  public async shouldBeAbleToLogThatProvidersAreRegootingIfRcBootLogsIsTrue({ assert }: TestContext) {
    Config.set('rc.bootLogs', true)

    const mock = Log.getMock()
    const successFake = fake()

    mock
      .expects('channelOrVanilla')
      .exactly(5)
      .withArgs('application')
      .returns({ success: args => successFake(args) })

    await LoadHelper.regootProviders()

    assert.isTrue(successFake.calledWith('Provider ({yellow} ReplEnvProvider) successfully booted'))
    assert.isTrue(successFake.calledWith('Provider ({yellow} HttpEnvProvider) successfully booted'))
    assert.isTrue(successFake.calledWith('Provider ({yellow} WorkerEnvProvider) successfully booted'))
    assert.isTrue(successFake.calledWith('Provider ({yellow} ConsoleEnvProvider) successfully booted'))
    assert.isTrue(successFake.calledWith('Provider ({yellow} HttpAndConsoleEnvProvider) successfully booted'))

    mock.verify()
  }

  @Test()
  public async shouldBeAbleToPreloadFiles({ assert }: TestContext) {
    Config.set('rc.preloads', ['#tests/Stubs/routes/load'])

    await LoadHelper.preloadFiles()

    assert.isTrue(CALLED_MAP.has('load.ts'))
  }

  @Test()
  public async shouldBeAbleToLogPreloadFilesThatAreBeingImportedIfRcBootLogsIsTrue({ assert }: TestContext) {
    Config.set('rc.bootLogs', true)
    Config.set('rc.preloads', ['#tests/Stubs/routes/load'])

    const mock = Log.getMock()
    const successFake = fake()

    mock
      .expects('channelOrVanilla')
      .exactly(1)
      .withArgs('application')
      .returns({ success: args => successFake(args) })

    await LoadHelper.preloadFiles()

    assert.isTrue(successFake.calledWith('File ({yellow} load) successfully preloaded'))

    mock.verify()
  }
}
