/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ignite, LoadHelper } from '#src'
import { Rc } from '@athenna/config'
import { sep, resolve } from 'node:path'
import { Repl } from '#src/applications/Repl'
import { Http } from '#src/applications/Http'
import { Console } from '#src/applications/Console'
import { Log, LoggerProvider } from '@athenna/logger'
import { Exception, File, Json, Module } from '@athenna/common'
import { Test, type Context, BeforeEach, Mock, AfterEach } from '@athenna/test'
import { NotSatisfiedNodeVersion } from '#src/exceptions/NotSatisfiedNodeVersion'

export default class IgniteTest {
  public oldEnv: NodeJS.ProcessEnv
  public oldDirs: Record<string, string>

  @BeforeEach()
  public async beforeEach() {
    this.oldDirs = Json.copy(Path.dirs)
    this.oldEnv = Json.copy(process.env)
    Mock.when(process, 'chdir').return(undefined)
    new LoggerProvider().register()
  }

  @AfterEach()
  public async afterEach() {
    Mock.restoreAll()
    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGTERM')
    process.removeListener('uncaughtException', Repl.handleError)
    process.removeListener('uncaughtException', new Ignite().handleError)
    Config.clear()
    ioc.reconstruct()
    LoadHelper.providers = []
    LoadHelper.alreadyPreloaded = []
    Path.dirs = this.oldDirs
    process.env = this.oldEnv
  }

  @Test()
  public async shouldSaveTheParentURLInIgniteAndInConfigWhenBootingTheAppFoundation({ assert }: Context) {
    const parentURL = Path.toHref(Path.pwd() + '/')
    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    assert.equal(parentURL, ignite.parentURL)
    assert.equal(parentURL, Config.get('rc.parentURL'))
  }

  @Test()
  public async shouldSaveTheApplicationCWDInConfigWhenBootingTheAppFoundation({ assert }: Context) {
    await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    assert.equal(Config.get('rc.callPath'), process.cwd())
  }

  @Test()
  public async shouldSaveTheIgniteConfigUsedWhenBootingTheAppFoundation({ assert }: Context) {
    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    assert.containsSubset(ignite.options, {
      bootLogs: true,
      shutdownLogs: true,
      beforePath: 'build',
      envPath: undefined,
      loadConfigSafe: true,
      athennaRcPath: Path.pwd('package.json')
    })
  }

  @Test()
  public async shouldRegisterIgniteInstanceUsedInAthennaContainer({ assert }: Context) {
    await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    assert.isTrue(ioc.has('Athenna/Core/Ignite'))
  }

  @Test()
  public async shouldAutomaticallyResolveTheProcessCWDOfTheUserProjectUsingChdir({ assert }: Context) {
    await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    const __dirname = Module.createDirname(import.meta.url)

    assert.calledWith(process.chdir, resolve(__dirname, '..', '..', '..', '..', '..', '..'))
  }

  @Test()
  public async shouldAutomaticallyResolveIfApplicationIsUsingTypeScriptOrNot({ assert }: Context) {
    process.env.IS_TS = undefined

    await new Ignite().load(Path.toHref(Path.pwd() + '/main.ts'))

    assert.equal(process.env.IS_TS, 'true')
  }

  @Test()
  public async shouldAutomaticallyResolveIfApplicationIsUsingJavaScriptOrNot({ assert }: Context) {
    process.env.IS_TS = undefined

    await new Ignite().load(Path.toHref(Path.pwd() + '/main.js'))

    assert.equal(process.env.IS_TS, 'false')
  }

  @Test()
  public async shouldNotSubscribeIS_TSEnvIfIsAlreadyDefined({ assert }: Context) {
    process.env.IS_TS = 'true'

    await new Ignite().load(Path.toHref(Path.pwd() + '/main.js'))

    assert.equal(process.env.IS_TS, 'true')
  }

  @Test()
  public async shouldNotBePossibleToHaveMultipleEqualUncaughtExceptionHandlersBeingRegisteredByIgnite({
    assert
  }: Context) {
    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    ignite.setUncaughtExceptionHandler()
    ignite.setUncaughtExceptionHandler()
    ignite.setUncaughtExceptionHandler()
    ignite.setUncaughtExceptionHandler()
    ignite.setUncaughtExceptionHandler()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    assert.lengthOf(process?._events?.uncaughtException, 3)
  }

  @Test()
  public async shouldBeAbleToSetTheAbsolutePathToTheEnvFile({ assert }: Context) {
    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      envPath: Path.pwd() + '/.env'
    })

    assert.equal(ignite.options.envPath, Path.pwd() + sep + '.env')
  }

  @Test()
  public async shouldBeAbleToSetTheRelativePathToTheEnvFile({ assert }: Context) {
    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      envPath: '.env'
    })

    assert.equal(ignite.options.envPath, Path.pwd() + sep + '.env')
  }

  @Test()
  public async shouldBeAbleToLoadTheAthennaPropertyAsRcFromPackageJsonFile({ assert }: Context) {
    await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    const pjson = new File(Path.pwd('package.json')).getContentAsJsonSync()

    assert.containsSubset(Config.get('rc'), pjson.athenna)
  }

  @Test()
  public async shouldSetAllTheDefaultValuesInTheRcConfig({ assert }: Context) {
    await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    const pjson = new File(Path.pwd('package.json')).getContentAsJsonSync()

    assert.containsSubset(Config.get('rc'), {
      typescript: true,
      version: pjson.version,
      bootLogs: true,
      shutdownLogs: true,
      callPath: process.cwd(),
      controllers: [],
      engines: {
        node: '>=20.0.0'
      },
      ignoreDirsBeforePath: ['nodeModules', 'nodeModulesBin'],
      environments: [],
      globalMiddlewares: [],
      middlewares: [],
      namedMiddlewares: {},
      parentURL: Path.toHref(Path.pwd() + '/'),
      preloads: [],
      services: [],
      athennaVersion: `Athenna Framework v${pjson.version}`
    })
  }

  @Test()
  public async shouldBeAbleToSetTheAbsolutePathToTheAthennaRcFile({ assert }: Context) {
    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      athennaRcPath: Path.fixtures('.athennarc.json')
    })

    assert.equal(Config.get('rc.hello'), 'world!')
    assert.equal(ignite.options.athennaRcPath, Path.fixtures('.athennarc.json'))
  }

  @Test()
  public async shouldBeAbleToSetTheRelativePathToTheAthennaRcFile({ assert }: Context) {
    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      athennaRcPath: './tests/fixtures/.athennarc.json'
    })

    assert.equal(Config.get('rc.hello'), 'world!')
    assert.equal(ignite.options.athennaRcPath, Path.fixtures('.athennarc.json'))
  }

  @Test()
  public async shouldSetTheRcFileInTheRcHelper({ assert }: Context) {
    await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      athennaRcPath: './tests/fixtures/.athennarc.json'
    })

    assert.equal(Rc.content.get('hello'), 'world!')
  }

  @Test()
  public async shouldBeAbleToMergeDirsSetInTheRcFileInPathDirs({ assert }: Context) {
    Config.set('rc.directories', {
      bin: 'test/bin',
      src: 'test/src',
      tests: 'test/tests'
    })

    await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    assert.equal(Path.dirs.bin, 'test/bin')
    assert.equal(Path.dirs.src, 'test/src')
    assert.equal(Path.dirs.tests, 'test/tests')
    assert.equal(Path.dirs.app, 'app')
    assert.equal(Path.dirs.bootstrap, 'bootstrap')
  }

  @Test()
  public async shouldNotSetTheApplicationRootPathIfApplicationIsRunningTSCode({ assert }: Context) {
    process.env.IS_TS = 'true'

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    assert.deepEqual(Path.dirs, { ...this.oldDirs, bootstrap: 'bin' })
    assert.equal(ignite.options.beforePath, 'build')
  }

  @Test()
  public async shouldNotSetTheApplicationRootPathIfItsUndefined({ assert }: Context) {
    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      beforePath: undefined
    })

    assert.deepEqual(Path.dirs, { ...this.oldDirs, bootstrap: 'bin' })
    assert.equal(ignite.options.beforePath, undefined)
  }

  @Test()
  public async shouldBeAbleToSetTheApplicationBeforePathWhenRunningJSCode({ assert }: Context) {
    process.env.IS_TS = 'false'

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/main.js'))

    assert.equal(Path.dirs.bootstrap, 'build/bin')
    assert.equal(Path.dirs.nodeModules, 'node_modules')
    assert.equal(Path.dirs.nodeModulesBin, 'node_modules/.bin')
    assert.equal(Path.dirs.app, 'build/app')
    assert.equal(ignite.options.beforePath, 'build')
  }

  @Test()
  public async shouldBeAbleToIgnorePathsWhenAddingTheApplicationBeforePath({ assert }: Context) {
    process.env.IS_TS = 'false'
    Config.set('rc.ignoreDirsBeforePath', ['bootstrap', 'nodeModules'])

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/main.js'))

    assert.equal(Path.dirs.bootstrap, 'bin')
    assert.equal(Path.dirs.nodeModules, 'node_modules')
    assert.equal(Path.dirs.nodeModulesBin, 'build/node_modules/.bin')
    assert.equal(Path.dirs.app, 'build/app')
    assert.equal(ignite.options.beforePath, 'build')
  }

  @Test()
  public async shouldThrownIfTheNodeEngineSatisfiesTheActualNodeJSVersion({ assert }: Context) {
    const ignite = new Ignite()

    Mock.when(ignite, 'handleError').throw(new NotSatisfiedNodeVersion(process.version, '<=18.0.0'))
    Config.set('rc.engines.node', '<=18.0.0')

    await assert.rejects(() => ignite.load(Path.toHref(Path.pwd() + '/')), NotSatisfiedNodeVersion)
  }

  @Test()
  public async shouldIgnoreVersionValidationIfEnginesIsNotDefined({ assert }: Context) {
    const ignite = new Ignite()

    Config.set('rc.engines', undefined)

    await assert.doesNotRejects(() => ignite.load(Path.toHref(Path.pwd() + '/')))
  }

  @Test()
  public async shouldSetTheApplicationSIGTERMSignalByDefault({ assert }: Context) {
    assert.lengthOf(process.listeners('SIGTERM'), 0)

    await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    assert.isTrue(Env('SIGNALS_CONFIGURED', false))
    assert.lengthOf(process.listeners('SIGTERM'), 1)
  }

  @Test()
  public async shouldSetTheApplicationSIGINTSignalByDefault({ assert }: Context) {
    assert.lengthOf(process.listeners('SIGINT'), 0)

    await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    assert.isTrue(Env('SIGNALS_CONFIGURED', false))
    assert.lengthOf(process.listeners('SIGINT'), 1)
  }

  @Test()
  public async shouldSetACustomSIGTERMSignalForTheApplication({ assert }: Context) {
    assert.lengthOf(process.listeners('SIGTERM'), 0)

    const sigterm = () => {}
    Config.set('app.signals', {
      SIGTERM: sigterm
    })

    await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    assert.isTrue(Env('SIGNALS_CONFIGURED', false))
    assert.lengthOf(process.listeners('SIGTERM'), 1)
    assert.deepEqual(process.listeners('SIGTERM')[0], sigterm)
  }

  @Test()
  public async shouldSetACustomSIGINTSignalForTheApplication({ assert }: Context) {
    assert.lengthOf(process.listeners('SIGINT'), 0)

    const sigint = () => {}
    Config.set('app.signals', {
      SIGINT: sigint
    })

    await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    assert.isTrue(Env('SIGNALS_CONFIGURED', false))
    assert.lengthOf(process.listeners('SIGINT'), 1)
    assert.deepEqual(process.listeners('SIGINT')[0], sigint)
  }

  @Test()
  public async shouldBeAbleToMergeCustomSIGTERMWithDefaultSIGINTForTheApplication({ assert }: Context) {
    assert.lengthOf(process.listeners('SIGINT'), 0)
    assert.lengthOf(process.listeners('SIGTERM'), 0)

    const sigterm = () => {}
    Config.set('app.signals', {
      SIGTERM: sigterm
    })

    await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    assert.isTrue(Env('SIGNALS_CONFIGURED', false))
    assert.lengthOf(process.listeners('SIGINT'), 1)
    assert.lengthOf(process.listeners('SIGTERM'), 1)
    assert.deepEqual(process.listeners('SIGTERM')[0], sigterm)
  }

  @Test()
  public async shouldBeAbleToMergeCustomSIGINTWithDefaultSIGTERMForTheApplication({ assert }: Context) {
    assert.lengthOf(process.listeners('SIGINT'), 0)
    assert.lengthOf(process.listeners('SIGTERM'), 0)

    const sigint = () => {}
    Config.set('app.signals', {
      SIGINT: sigint
    })

    await new Ignite().load(Path.toHref(Path.pwd() + '/'))

    assert.isTrue(Env('SIGNALS_CONFIGURED', false))
    assert.lengthOf(process.listeners('SIGINT'), 1)
    assert.lengthOf(process.listeners('SIGTERM'), 1)
    assert.deepEqual(process.listeners('SIGINT')[0], sigint)
  }

  @Test()
  public async shouldCatchVanillaErrorsThatHappensDuringBootOfTheFoundationAndHandleIt({ assert }: Context) {
    const fatalMock = Mock.fake()
    Log.when('channelOrVanilla').return({
      fatal: fatalMock
    })
    Mock.when(process, 'exit').return(undefined)

    const ignite = new Ignite()

    Mock.spy(ignite, 'handleError')
    Mock.when(ignite, 'setUncaughtExceptionHandler').throw(new Error('test'))

    await ignite.load(Path.toHref(Path.pwd() + '/'))

    assert.calledWith(process.exit, 1)
    assert.calledWith(ignite.handleError, new Error('test'))
    assert.calledWith(fatalMock, await new Error('test').toAthennaException().prettify())
  }

  @Test()
  public async shouldCatchAthennaExceptionsThatHappensDuringBootOfTheFoundationAndHandleIt({ assert }: Context) {
    const fatalMock = Mock.fake()
    Log.when('channelOrVanilla').return({
      fatal: fatalMock
    })
    Mock.when(process, 'exit').return(undefined)

    const ignite = new Ignite()

    Mock.spy(ignite, 'handleError')
    Mock.when(ignite, 'setUncaughtExceptionHandler').throw(new Exception())

    await ignite.load(Path.toHref(Path.pwd() + '/'))

    assert.calledWith(process.exit, 1)
    assert.calledWith(ignite.handleError, new Exception())
    assert.calledWith(fatalMock, await new Exception().prettify())
  }

  @Test()
  public async shouldCatchAnyKindOfErrorsWhenUsingBun({ assert }: Context) {
    process.versions.bun = '1.0.0'
    const fatalMock = Mock.fake()
    Log.when('channelOrVanilla').return({
      fatal: fatalMock
    })
    Mock.when(process.stderr, 'write').return(undefined)
    Mock.when(process, 'exit').return(undefined)

    const ignite = new Ignite()

    Mock.spy(ignite, 'handleError')
    Mock.when(ignite, 'setUncaughtExceptionHandler').throw(new Exception())

    await ignite.load(Path.toHref(Path.pwd() + '/'))

    assert.calledOnce(process.stderr.write)
    assert.calledWith(process.exit, 1)
    assert.calledWith(ignite.handleError, new Exception())
    assert.notCalled(fatalMock)
  }

  @Test()
  public async shouldBeAbleToLoadAnEnvFileWhenFiringAthennaApplication({ assert }: Context) {
    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false,
      envPath: Path.fixtures('.env')
    })

    await ignite.fire()

    assert.equal(ignite.options.envPath, Path.fixtures('.env'))
    assert.equal(process.env.LOADED_FIXTURE_ENV, 'true')
  }

  @Test()
  public async shouldBeAbleToLoadConfigPathWhenFiringAthennaApplication({ assert }: Context) {
    Config.set('rc.directories.config', 'tests/fixtures/igniteConfig')

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })

    await ignite.fire()

    assert.equal(Config.get('hello.hello'), 'world!')
  }

  @Test()
  public async shouldBeAbleToLoadConfigPathSafeWhenFiringAthennaApplication({ assert }: Context) {
    Config.set('rc.directories.config', 'tests/fixtures/igniteConfig')
    Config.set('hello.hello', 'will-not-be-changed!')

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false,
      loadConfigSafe: true
    })

    await ignite.fire()

    assert.equal(Config.get('hello.hello'), 'will-not-be-changed!')
  }

  @Test()
  public async shouldPushTheEnvironmentsSetInIgniteLoadToTheConfigValueOfIt({ assert }: Context) {
    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false,
      environments: ['test']
    })

    await ignite.fire()

    assert.deepEqual(Config.get('rc.environments'), ['test'])
  }

  @Test()
  public async shouldNotSubscribeEnvironmentsConfigButOnlyAddNewValues({ assert }: Context) {
    Config.set('rc.environments', ['development'])

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false,
      environments: ['test']
    })

    await ignite.fire()

    assert.deepEqual(Config.get('rc.environments'), ['development', 'test'])
  }

  @Test()
  public async shouldCatchAndHandleVanillaErrorsThatHappensInsideFireMethod({ assert }: Context) {
    const ignite = new Ignite()

    Mock.when(ignite, 'handleError').return(undefined)
    Mock.when(ignite, 'setEnvVariablesFile').throw(new Error())

    await ignite.load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.fire()

    assert.calledWith(ignite.handleError, new Error())
  }

  @Test()
  public async shouldCatchAndHandleExceptionsThatHappensInsideFireMethod({ assert }: Context) {
    const ignite = new Ignite()

    Mock.when(ignite, 'handleError').return(undefined)
    Mock.when(ignite, 'setEnvVariablesFile').throw(new Exception())

    await ignite.load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.fire()

    assert.calledWith(ignite.handleError, new Exception())
  }

  @Test()
  public async shouldRegisterAndBootProvidersWhenFiringTheFoundation({ assert }: Context) {
    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.fire()

    assert.lengthOf(LoadHelper.providers, 3)
  }

  @Test()
  public async shouldPreloadModulesWhenFiringTheFoundation({ assert }: Context) {
    Config.set('rc.preloads', ['#tests/fixtures/routes/load'])

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.fire()

    assert.deepEqual(LoadHelper.alreadyPreloaded, ['#tests/fixtures/routes/load'])
  }

  @Test()
  public async shouldSetTheReplEnvironmentInOptionsWhenIgnitingAReplApplication({ assert }: Context) {
    Mock.when(Repl, 'boot').resolve(undefined)

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.repl()

    assert.deepEqual(Config.get('rc.environments'), ['repl'])
  }

  @Test()
  public async shouldFireTheFoundationWhenIgnitingReplApplication({ assert }: Context) {
    Mock.when(Repl, 'boot').resolve(undefined)

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })

    Mock.spy(ignite, 'fire')

    await ignite.repl()

    assert.calledOnce(ignite.fire)
  }

  @Test()
  public async shouldSetACustomUncaughtExceptionHandlerForReplApplication({ assert }: Context) {
    Mock.when(Repl, 'boot').resolve(undefined)

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })

    Mock.spy(ignite, 'setUncaughtExceptionHandler')

    await ignite.repl()

    assert.calledOnce(ignite.setUncaughtExceptionHandler)
  }

  @Test()
  public async shouldCatchAndHandleVanillaErrorsThatHappensInsideReplMethod({ assert }: Context) {
    const ignite = new Ignite()

    Mock.when(ignite, 'handleError').return(undefined)
    Mock.when(ignite, 'fire').throw(new Error())

    await ignite.load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.repl()

    assert.calledWith(ignite.handleError, new Error())
  }

  @Test()
  public async shouldCatchAndHandleExceptionsThatHappensInsideReplMethod({ assert }: Context) {
    const ignite = new Ignite()

    Mock.when(ignite, 'handleError').return(undefined)
    Mock.when(ignite, 'fire').throw(new Exception())

    await ignite.load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.repl()

    assert.calledWith(ignite.handleError, new Exception())
  }

  @Test()
  public async shouldSetTheConsoleEnvironmentInOptionsWhenIgnitingAnArtisanApplication({ assert }: Context) {
    Mock.when(Console, 'boot').resolve(undefined)

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.console([])

    assert.deepEqual(ignite.options.environments, ['console'])
  }

  @Test()
  public async shouldNotFireTheFoundationWhenIgnitingConsoleApplications({ assert }: Context) {
    Mock.when(Console, 'boot').resolve(undefined)

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })

    Mock.when(ignite, 'fire').resolve(undefined)

    await ignite.console([])

    assert.notCalled(ignite.fire)
    assert.deepEqual(ignite.options.environments, ['console'])
  }

  @Test()
  public async shouldSendTheCorrectArgvAndOptionsToTheConsoleBootMethod({ assert }: Context) {
    Mock.when(Console, 'boot').resolve(undefined)

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })

    await ignite.console(['test'], {
      displayName: 'Artisan'
    })

    assert.calledWith(Console.boot, ['test'], { displayName: 'Artisan' })
  }

  @Test()
  public async shouldCatchAndHandleVanillaErrorsThatHappensInsideConsoleMethod({ assert }: Context) {
    Mock.when(Console, 'boot').reject(new Error())
    const ignite = new Ignite()

    Mock.when(ignite, 'handleError').return(undefined)

    await ignite.load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.console([])

    assert.calledWith(ignite.handleError, new Error())
  }

  @Test()
  public async shouldCatchAndHandleExceptionsThatHappensInsideConsoleMethod({ assert }: Context) {
    Mock.when(Console, 'boot').reject(new Exception())
    const ignite = new Ignite()

    Mock.when(ignite, 'handleError').return(undefined)

    await ignite.load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.console([])

    assert.calledWith(ignite.handleError, new Exception())
  }

  @Test()
  public async shouldSetTheHttpEnvironmentInOptionsWhenIgnitingAHttpApplication({ assert }: Context) {
    Mock.when(Http, 'boot').resolve(undefined)

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.httpServer()

    assert.deepEqual(Config.get('rc.environments'), ['http'])
  }

  @Test()
  public async shouldFireTheFoundationWhenIgnitingHttpApplication({ assert }: Context) {
    Mock.when(Http, 'boot').resolve(undefined)

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })

    Mock.spy(ignite, 'fire')

    await ignite.httpServer()

    assert.calledOnce(ignite.fire)
  }

  @Test()
  public async shouldSendTheCorrectOptionsToTheHttpBootMethod({ assert }: Context) {
    Mock.when(Http, 'boot').resolve(undefined)

    const ignite = await new Ignite().load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })

    await ignite.httpServer({ host: 'localhost', port: 3000 })

    assert.calledWith(Http.boot, { host: 'localhost', port: 3000 })
  }

  @Test()
  public async shouldCatchAndHandleVanillaErrorsThatHappensInsideHttpMethod({ assert }: Context) {
    Mock.when(Http, 'boot').reject(new Error())
    const ignite = new Ignite()

    Mock.when(ignite, 'handleError').return(undefined)

    await ignite.load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.httpServer()

    assert.calledWith(ignite.handleError, new Error())
  }

  @Test()
  public async shouldCatchAndHandleExceptionsThatHappensInsideHttpMethod({ assert }: Context) {
    Mock.when(Http, 'boot').reject(new Exception())
    const ignite = new Ignite()

    Mock.when(ignite, 'handleError').return(undefined)

    await ignite.load(Path.toHref(Path.pwd() + '/'), {
      bootLogs: false
    })
    await ignite.httpServer()

    assert.calledWith(ignite.handleError, new Exception())
  }
}
