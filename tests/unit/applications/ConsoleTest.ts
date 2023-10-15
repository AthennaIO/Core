/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Rc } from '@athenna/config'
import { Console } from '#src/applications/Console'
import { Log, LoggerProvider } from '@athenna/logger'
import { Artisan, ArtisanProvider, CommanderHandler } from '@athenna/artisan'
import { Test, type Context, BeforeEach, AfterEach, Mock } from '@athenna/test'

export default class ConsoleTest {
  @BeforeEach()
  public async beforeEach() {
    new ArtisanProvider().register()
    new LoggerProvider().register()
    await Config.loadAll(Path.fixtures('config'))
    await Rc.setFile(Path.fixtures('rcs/.athennarc.json'))
  }

  @AfterEach()
  public async afterEach() {
    ioc.reconstruct()
    Config.clear()
    Mock.restoreAll()
    CommanderHandler.reconstruct()
  }

  @Test()
  public async shouldBeAbleToBootAConsoleApplicationInYourEntrypoint({ assert }: Context) {
    const parseMock = Artisan.when('parse').resolve(undefined)

    const argv = ['node', 'artisan']
    await Console.boot(argv)

    assert.calledOnceWith(parseMock, argv, null)
    assert.isTrue(CommanderHandler.hasCommand('test'))
    assert.isTrue(CommanderHandler.hasCommand('repl'))
    assert.isTrue(CommanderHandler.hasCommand('build'))
    assert.isTrue(CommanderHandler.hasCommand('make:provider'))
  }

  @Test()
  public async shouldBeAbleToBootAConsoleApplicationByCommandOfArgv({ assert }: Context) {
    const parseMock = Artisan.when('parse').resolve(undefined)

    const argv = ['node', 'artisan', 'test']
    await Console.boot(argv)

    assert.calledOnceWith(parseMock, argv, null)
    assert.isTrue(CommanderHandler.hasCommand('test'))
    assert.isFalse(CommanderHandler.hasCommand('repl'))
    assert.isFalse(CommanderHandler.hasCommand('build'))
    assert.isFalse(CommanderHandler.hasCommand('make:provider'))
  }

  @Test()
  public async shouldBeAbleToBootAConsoleApplicationWithADisplayName({ assert }: Context) {
    const parseMock = Artisan.when('parse').resolve(undefined)

    const argv = ['node', 'artisan', 'test']
    await Console.boot(argv, { displayName: 'Artisan' })

    assert.calledOnceWith(parseMock, argv, 'Artisan')
    assert.isTrue(CommanderHandler.hasCommand('test'))
  }

  @Test()
  public async shouldBeAbleToBootAConsoleApplicationWithADifferentRoutePath({ assert }: Context) {
    const parseMock = Artisan.when('parse').resolve(undefined)

    const argv = ['node', 'artisan']
    await Console.boot(argv, { routePath: Path.fixtures('routes/console.ts') })

    assert.calledOnceWith(parseMock, argv, null)
    assert.isTrue(CommanderHandler.hasCommand('route:console'))
  }

  @Test()
  public async shouldBeAbleToBootAConsoleApplicationWithADifferentKernelPath({ assert }: Context) {
    const infoMock = Log.when('info').return(undefined)
    const parseMock = Artisan.when('parse').resolve(undefined)

    const argv = ['node', 'artisan']
    await Console.boot(argv, { kernelPath: Path.fixtures('kernels/CustomConsoleKernel.ts') })

    assert.calledOnceWith(parseMock, argv, null)
    assert.calledOnceWith(infoMock, 'importing CustomConsoleKernel')
    assert.isTrue(CommanderHandler.hasCommand('test'))
  }

  @Test()
  public async shouldBeAbleToBootAConsoleApplicationWithADifferentExceptionHandlerPath({ assert }: Context) {
    const infoMock = Log.when('info').return(undefined)
    const parseMock = Artisan.when('parse').resolve(undefined)

    const argv = ['node', 'artisan']
    await Console.boot(argv, { exceptionHandlerPath: Path.fixtures('handlers/CustomConsoleExceptionHandler.ts') })

    assert.calledOnceWith(parseMock, argv, null)
    assert.calledOnceWith(infoMock, 'importing CustomConsoleExceptionHandler')
    assert.isTrue(CommanderHandler.hasCommand('test'))
  }

  @Test()
  public async shouldBeAbleToBootAConsoleApplicationAndLogTheBootstrapInfos({ assert }: Context) {
    Config.set('rc.bootLogs', true)
    const successMock = Mock.fake()
    Log.when('channelOrVanilla').return({
      success: successMock
    })
    const parseMock = Artisan.when('parse').resolve(undefined)

    const argv = ['node', 'artisan']
    await Console.boot(argv)

    assert.calledOnceWith(parseMock, argv, null)
    assert.calledWith(successMock, 'Kernel ({yellow} ConsoleKernel) successfully booted')
    assert.isTrue(CommanderHandler.hasCommand('test'))
  }
}
