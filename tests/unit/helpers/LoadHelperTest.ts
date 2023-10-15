/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { LoadHelper } from '#src'
import { Log, LoggerProvider } from '@athenna/logger'
import { CALLED_MAP } from '#tests/helpers/CalledMap'
import { Test, BeforeEach, type Context, Mock, AfterEach } from '@athenna/test'

export default class LoadHelperTest {
  @BeforeEach()
  public beforeEach() {
    new LoggerProvider().register()
    Config.set('rc.parentURL', Path.toHref(Path.pwd() + '/'))
    Config.set('rc.providers', [
      '#tests/fixtures/providers/ReplEnvProvider',
      '#tests/fixtures/providers/HttpEnvProvider',
      '#tests/fixtures/providers/WorkerEnvProvider',
      '#tests/fixtures/providers/ConsoleEnvProvider',
      '#tests/fixtures/providers/HttpAndConsoleEnvProvider'
    ])
  }

  @AfterEach()
  public async afterEach() {
    Config.clear()
    ioc.reconstruct()
    LoadHelper.providers = []
    LoadHelper.alreadyPreloaded = []
  }

  @Test()
  public async shouldBeAbleToLoadBootableProvidersByConsoleEnvironment({ assert }: Context) {
    Config.set('rc.environments', ['repl'])

    await LoadHelper.loadBootableProviders()

    assert.lengthOf(LoadHelper.providers, 1)
    assert.equal(LoadHelper.providers[0].name, 'ReplEnvProvider')
  }

  @Test()
  public async shouldBeAbleToLoadBootableProvidersByHttpEnvironment({ assert }: Context) {
    Config.set('rc.environments', ['http'])

    await LoadHelper.loadBootableProviders()

    assert.lengthOf(LoadHelper.providers, 2)
    assert.equal(LoadHelper.providers[0].name, 'HttpEnvProvider')
    assert.equal(LoadHelper.providers[1].name, 'HttpAndConsoleEnvProvider')
  }

  @Test()
  public async shouldBeAbleToLoadBootableProvidersByHttpAndConsoleEnvironment({ assert }: Context) {
    Config.set('rc.environments', ['http', 'console'])

    await LoadHelper.loadBootableProviders()

    assert.lengthOf(LoadHelper.providers, 3)
    assert.equal(LoadHelper.providers[0].name, 'HttpEnvProvider')
    assert.equal(LoadHelper.providers[1].name, 'ConsoleEnvProvider')
    assert.equal(LoadHelper.providers[2].name, 'HttpAndConsoleEnvProvider')
  }

  @Test()
  public async shouldLoadAllProvidersIfEnvironmentsIsAnEmptyArray({ assert }: Context) {
    Config.set('rc.environments', [])

    await LoadHelper.loadBootableProviders()

    assert.lengthOf(LoadHelper.providers, 5)
  }

  @Test()
  public async shouldLoadProviderIfHisFirstIndexOfEnvironmentMethodIsAnAstheristic({ assert }: Context) {
    Config.set('rc.environments', [])
    Config.set('rc.providers', [
      '#tests/fixtures/providers/AllEnvProvider',
      '#tests/fixtures/providers/ReplEnvProvider',
      '#tests/fixtures/providers/HttpEnvProvider',
      '#tests/fixtures/providers/WorkerEnvProvider',
      '#tests/fixtures/providers/ConsoleEnvProvider',
      '#tests/fixtures/providers/HttpAndConsoleEnvProvider'
    ])

    await LoadHelper.loadBootableProviders()

    assert.lengthOf(LoadHelper.providers, 6)
  }

  @Test()
  public async shouldBeAbleToRegisterProviders({ assert }: Context) {
    await LoadHelper.loadBootableProviders()
    await LoadHelper.registerProviders()

    assert.isFalse(ioc.has('ReplEnvBoot'))
    assert.isFalse(ioc.has('HttpEnvBoot'))
    assert.isFalse(ioc.has('WorkerEnvBoot'))
    assert.isFalse(ioc.has('ConsoleEnvBoot'))
    assert.isFalse(ioc.has('HttpAndConsoleEnvBoot'))
    assert.isTrue(ioc.has('ReplEnvRegister'))
    assert.isTrue(ioc.has('HttpEnvRegister'))
    assert.isTrue(ioc.has('WorkerEnvRegister'))
    assert.isTrue(ioc.has('ConsoleEnvRegister'))
    assert.isTrue(ioc.has('HttpAndConsoleEnvRegister'))
  }

  @Test()
  public async shouldBeAbleToBootProviders({ assert }: Context) {
    await LoadHelper.loadBootableProviders()
    await LoadHelper.bootProviders()

    assert.isTrue(ioc.has('ReplEnvBoot'))
    assert.isTrue(ioc.has('HttpEnvBoot'))
    assert.isTrue(ioc.has('WorkerEnvBoot'))
    assert.isTrue(ioc.has('ConsoleEnvBoot'))
    assert.isTrue(ioc.has('HttpAndConsoleEnvBoot'))
    assert.isFalse(ioc.has('ReplEnvRegister'))
    assert.isFalse(ioc.has('HttpEnvRegister'))
    assert.isFalse(ioc.has('WorkerEnvRegister'))
    assert.isFalse(ioc.has('ConsoleEnvRegister'))
    assert.isFalse(ioc.has('HttpAndConsoleEnvRegister'))
  }

  @Test()
  public async shouldBeAbleToShutdownProviders({ assert }: Context) {
    await LoadHelper.loadBootableProviders()
    await LoadHelper.shutdownProviders()

    assert.isFalse(ioc.has('ReplEnvBoot'))
    assert.isFalse(ioc.has('HttpEnvBoot'))
    assert.isFalse(ioc.has('WorkerEnvBoot'))
    assert.isFalse(ioc.has('ConsoleEnvBoot'))
    assert.isFalse(ioc.has('HttpAndConsoleEnvBoot'))
    assert.isFalse(ioc.has('ReplEnvRegister'))
    assert.isFalse(ioc.has('HttpEnvRegister'))
    assert.isFalse(ioc.has('WorkerEnvRegister'))
    assert.isFalse(ioc.has('ConsoleEnvRegister'))
    assert.isFalse(ioc.has('HttpAndConsoleEnvRegister'))
    assert.isTrue(ioc.has('ReplEnvShutdown'))
    assert.isTrue(ioc.has('HttpEnvShutdown'))
    assert.isTrue(ioc.has('WorkerEnvShutdown'))
    assert.isTrue(ioc.has('ConsoleEnvShutdown'))
    assert.isTrue(ioc.has('HttpAndConsoleEnvShutdown'))
  }

  @Test()
  public async shouldBeAbleToLogThatProvidersAreShutingDownIfRcShutdownLogsIsTrue({ assert }: Context) {
    Config.set('rc.shutdownLogs', true)

    const successFake = Mock.fake()
    const mock = Log.when('channelOrVanilla').return({
      success: successFake
    })

    await LoadHelper.loadBootableProviders()
    await LoadHelper.shutdownProviders()

    assert.calledWith(successFake, 'Provider ({yellow} ReplEnvProvider) successfully shutdown')
    assert.calledWith(successFake, 'Provider ({yellow} HttpEnvProvider) successfully shutdown')
    assert.calledWith(successFake, 'Provider ({yellow} WorkerEnvProvider) successfully shutdown')
    assert.calledWith(successFake, 'Provider ({yellow} ConsoleEnvProvider) successfully shutdown')
    assert.calledWith(successFake, 'Provider ({yellow} HttpAndConsoleEnvProvider) successfully shutdown')
    assert.calledTimesWith(mock, 5, 'application')
  }

  @Test()
  public async shouldBeAbleToRegootProviders({ assert }: Context) {
    await LoadHelper.regootProviders()

    assert.isTrue(ioc.has('ReplEnvBoot'))
    assert.isTrue(ioc.has('HttpEnvBoot'))
    assert.isTrue(ioc.has('WorkerEnvBoot'))
    assert.isTrue(ioc.has('ConsoleEnvBoot'))
    assert.isTrue(ioc.has('HttpAndConsoleEnvBoot'))
    assert.isTrue(ioc.has('ReplEnvRegister'))
    assert.isTrue(ioc.has('HttpEnvRegister'))
    assert.isTrue(ioc.has('WorkerEnvRegister'))
    assert.isTrue(ioc.has('ConsoleEnvRegister'))
    assert.isTrue(ioc.has('HttpAndConsoleEnvRegister'))
  }

  @Test()
  public async shouldBeAbleToLogThatProvidersAreRegootingIfRcBootLogsIsTrue({ assert }: Context) {
    Config.set('rc.bootLogs', true)

    const successFake = Mock.fake()
    const mock = Log.when('channelOrVanilla').return({
      success: successFake
    })

    await LoadHelper.regootProviders()

    assert.calledWith(successFake, 'Provider ({yellow} ReplEnvProvider) successfully booted')
    assert.calledWith(successFake, 'Provider ({yellow} HttpEnvProvider) successfully booted')
    assert.calledWith(successFake, 'Provider ({yellow} WorkerEnvProvider) successfully booted')
    assert.calledWith(successFake, 'Provider ({yellow} ConsoleEnvProvider) successfully booted')
    assert.calledWith(successFake, 'Provider ({yellow} HttpAndConsoleEnvProvider) successfully booted')

    assert.calledTimesWith(mock, 5, 'application')
  }

  @Test()
  public async shouldBeAbleToPreloadFiles({ assert }: Context) {
    Config.set('rc.preloads', ['#tests/fixtures/routes/load'])

    await LoadHelper.preloadFiles()

    assert.isTrue(CALLED_MAP.has('load.ts'))
  }

  @Test()
  public async shouldBeAbleToLogPreloadFilesThatAreBeingImportedIfRcBootLogsIsTrue({ assert }: Context) {
    Config.set('rc.bootLogs', true)
    Config.set('rc.preloads', ['#tests/fixtures/routes/load'])

    const successFake = Mock.fake()
    const mock = Log.when('channelOrVanilla').return({
      success: successFake
    })

    await LoadHelper.preloadFiles()

    assert.calledTimesWith(mock, 1, 'application')
    assert.calledWith(successFake, 'File ({yellow} load) successfully preloaded')
  }

  @Test()
  public async shouldNotPreloadFilesThatHasBeenAlreadyLoaded({ assert }: Context) {
    Config.set('rc.preloads', ['#tests/fixtures/routes/load'])

    await LoadHelper.preloadFiles()

    assert.deepEqual(LoadHelper.alreadyPreloaded, ['#tests/fixtures/routes/load'])

    await LoadHelper.preloadFiles()

    assert.deepEqual(LoadHelper.alreadyPreloaded, ['#tests/fixtures/routes/load'])
  }
}
