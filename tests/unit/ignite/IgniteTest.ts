/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fake } from 'sinon'
import { Ignite } from '#src'
import { Server } from '@athenna/http'
import { pathToFileURL } from 'node:url'
import { ExitFaker, Test } from '@athenna/test'
import { BaseTest } from '#tests/helpers/BaseTest'
import { Exec, File, Json } from '@athenna/common'
import type { Context } from '@athenna/test/types'

export default class IgniteTest extends BaseTest {
  @Test()
  public async shouldBeAbleToIgniteTheApplicationWhenInstantiatingIgnite({ assert }: Context) {
    const cwd = process.cwd()
    const ignite = await new Ignite().load(Config.get('meta'))

    assert.equal(ignite.meta, Config.get('meta'))
    assert.equal(Config.get('rc.callPath'), cwd)
    assert.containsSubset(ignite.options, {
      bootLogs: true,
      shutdownLogs: true,
      beforePath: '',
      envPath: undefined,
      loadConfigSafe: true,
      athennaRcPath: Path.pwd('package.json'),
    })
    assert.isTrue(ioc.hasDependency('Athenna/Core/Ignite'))
  }

  @Test()
  public async shouldBeAbleToIgniteTheApplicationRunningTypescriptWhenInstantiatingIgnite({ assert }: Context) {
    const ignite = await new Ignite().load(Config.get('meta'), { beforePath: '/dist' })

    assert.isTrue(Env('IS_TS', false))
    assert.isFalse(Path.pwd().includes('dist'))
    assert.equal(ignite.meta, Config.get('meta'))
    assert.containsSubset(ignite.options, { beforePath: '/dist' })
  }

  @Test()
  public async shouldBeAbleToIgniteTheApplicationRunningJavascriptCompiledCodeWhenInstantiatingIgnite({
    assert,
  }: Context) {
    delete process.env.IS_TS
    const meta = pathToFileURL(Path.stubs('main.js')).href
    const ignite = await new Ignite().load(meta, { beforePath: '/dist' })

    assert.isFalse(Env('IS_TS', true))
    assert.isTrue(Path.app().includes('dist'))
    assert.equal(ignite.meta, meta)
    assert.containsSubset(ignite.options, { beforePath: '/dist' })
  }

  @Test()
  public async shouldBeAbleToIgniteTheApplicationLoadingADifferentRcFileWhenInstantiatingIgnite({ assert }: Context) {
    Config.delete('rc')
    const ignite = await new Ignite().load(Config.get('meta'), { athennaRcPath: Path.stubs('.athennarc.json') })

    assert.equal(ignite.meta, Config.get('meta'))
    assert.deepEqual(Config.get('rc.providers'), [])
    assert.containsSubset(ignite.options, { athennaRcPath: Path.stubs('.athennarc.json') })
  }

  @Test()
  public async shouldBeAbleToIgniteTheApplicationWithoutAnRcFileWhenInstantiatingIgnite({ assert }: Context) {
    Config.delete('rc')
    const copy = Json.copy(this.originalPJson)
    delete copy.athenna
    await new File(Path.pwd('package.json')).setContent(JSON.stringify(copy, null, 2).concat('\n'))

    const ignite = await new Ignite().load(Config.get('meta'))

    assert.equal(ignite.meta, Config.get('meta'))
    assert.deepEqual(Config.get('rc.providers'), [])
    assert.containsSubset(ignite.options, { athennaRcPath: null })
  }

  @Test()
  public async shouldNotThrowAnErrorWhenTheNodeEngineSatisfiesTheSemverVersion({ assert }: Context) {
    Config.set('rc.engines', { node: '>=14.0.0' })

    await new Ignite().load(Config.get('meta'))

    assert.isFalse(ExitFaker.faker.called)
  }

  @Test()
  public async shouldThrowAnErrorWhenTheNodeEngineDoesNotSatisfiesTheSemverVersion({ assert }: Context) {
    Config.set('rc.engines', { node: '>=20.0.0' })

    await new Ignite().load(Config.get('meta'))

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }

  @Test()
  public async shouldBeAbleToFireTheIgniteClassLoadingAllTheRestOfTheApplication({ assert }: Context) {
    Config.set('rc.environments', ['other'])
    Config.set('rc.directories', { config: 'tests/stubs/igniteConfig' })

    const ignite = await new Ignite().load(Config.get('meta'), {
      envPath: Path.stubs('.env'),
      environments: ['console'],
    })

    await ignite.fire()

    assert.equal(Env('IGNITE_FIRED'), true)
    assert.equal(Env('NODE_ENV'), 'local')
    assert.isTrue(Config.is('ignite.fired', true))
    assert.deepEqual(Config.get('rc.environments'), ['other', 'console'])
    assert.deepEqual(Config.get('rc.providers'), [
      '#src/providers/CoreProvider',
      '@athenna/http/providers/HttpRouteProvider',
      '@athenna/http/providers/HttpServerProvider',
    ])
  }

  @Test()
  public async shouldBeAbleToFireTheIgniteClassLoadingAllTheRestOfTheApplicationResolvingTheEnvByNODE_ENV({
    assert,
  }: Context) {
    await new File(Path.stubs('.env')).copy(Path.pwd('.env'))
    await new File(Path.stubs('.env.local')).copy(Path.pwd('.env.local'))

    process.env.OVERRIDE_ENV = 'true'
    Config.set('rc.environments', ['other'])
    Config.set('rc.directories', { config: 'tests/stubs/igniteConfig' })

    const ignite = await new Ignite().load(Config.get('meta'), {
      environments: ['console'],
    })

    await ignite.fire()

    assert.isUndefined(Env('IGNITE_FIRED'))
    assert.equal(Env('ENV_LOCAL_LOADED'), true)
    assert.isTrue(Config.is('ignite.fired', true))
    assert.deepEqual(Config.get('rc.environments'), ['other', 'console'])
    assert.deepEqual(Config.get('rc.providers'), [
      '#src/providers/CoreProvider',
      '@athenna/http/providers/HttpRouteProvider',
      '@athenna/http/providers/HttpServerProvider',
    ])
  }

  @Test()
  public async shouldBeAbleToHandleSyntaxErrorExceptionsOfConfigsUsingTheDefaultIgniteHandler({ assert }: Context) {
    Config.set('rc.directories', { config: 'tests/stubs/syntaxErrorConfig' })

    const ignite = await new Ignite().load(Config.get('meta'), {
      environments: ['console'],
    })

    await ignite.fire()

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }

  @Test()
  public async shouldBeAbleToDefineWrongVersionsInPackageJsonButStillWorks({ assert }: Context) {
    const copy = Json.copy(this.originalPJson)
    copy.version = 'a.b.c'
    await new File(Path.pwd('package.json')).setContent(JSON.stringify(copy, null, 2).concat('\n'))

    await new Ignite().load(Config.get('meta'))

    assert.isUndefined(Env('APP_VERSION'))
  }

  @Test()
  public async shouldBeAbleToDefineApplicationSignals({ assert }: Context) {
    let SIGINT = false
    let SIGTERM = false

    Config.set('app.signals', {
      SIGINT: () => (SIGINT = true),
      SIGTERM: () => (SIGTERM = true),
    })

    await new Ignite().load(Config.get('meta'))

    process.emit('SIGINT')
    process.emit('SIGTERM')

    assert.equal(SIGINT, true)
    assert.equal(SIGTERM, true)
  }

  @Test()
  public async shouldNotDefineApplicationSignalsMoreThanOnce({ assert }: Context) {
    let SIGINT = false
    let SIGTERM = false

    Config.set('app.signals', {
      SIGINT: () => (SIGINT = true),
      SIGTERM: () => (SIGTERM = true),
    })

    const ignite = await new Ignite().load(Config.get('meta'))

    Config.set('app.signals', {
      SIGINT: () => (SIGINT = false),
      SIGTERM: () => (SIGTERM = false),
    })

    await ignite.load(Config.get('meta'))

    process.emit('SIGINT')
    process.emit('SIGTERM')

    assert.equal(SIGINT, true)
    assert.equal(SIGTERM, true)
  }

  @Test()
  public async shouldBeAbleToExecuteDefaultSIGINTSignalOfIgnite({ assert }: Context) {
    const ignite = await new Ignite().load(Config.get('meta'), {
      environments: ['console'],
    })

    await ignite.fire()

    process.emit('SIGINT')

    assert.isTrue(ExitFaker.faker.called)
  }

  @Test()
  public async shouldBeAbleToExecuteDefaultSIGTERMSignalOfIgnite({ assert }: Context) {
    const processKillStub = fake()
    process.kill = processKillStub
    Config.set('rc.providers', ['#tests/stubs/providers/ConsoleEnvProvider'])

    const ignite = await new Ignite().load(Config.get('meta'), {
      environments: ['console'],
    })

    await ignite.fire()

    process.emit('SIGTERM', 'SIGTERM')

    await Exec.sleep(100)

    assert.isTrue(ioc.hasDependency('ConsoleEnvShutdown'))
    assert.isTrue(processKillStub.calledWith(process.pid, 'SIGTERM'))
  }

  @Test()
  public async shouldIgnoreUndefinedSignalsFromAppSignals({ assert }: Context) {
    Config.set('app.signals', {
      SIGINT: null, // will set the default signal
      IGNORE: undefined,
      SIGTERM: undefined, // will set the default signal
    })

    await new Ignite().load(Config.get('meta'))

    const events = process.eventNames()

    assert.isTrue(events.includes('SIGINT'))
    assert.isTrue(events.includes('SIGTERM'))
    assert.isFalse(events.includes('IGNORE'))
  }

  @Test()
  public async shouldBeAbleToIgniteTheArtisanApplicationFromIgniteClass({ assert }: Context) {
    const ignite = await new Ignite().load(Config.get('meta'))

    await ignite.artisan(['node', 'artisan', 'test:generate'], { routePath: Path.stubs('routes/console.ts') })

    assert.isTrue(await File.exists(Path.stubs('storage/Command.ts')))
  }

  @Test()
  public async shouldBeAbleToIgniteTheHttpApplicationFromIgniteClass({ assert }: Context) {
    const ignite = await new Ignite().load(Config.get('meta'))

    await ignite.httpServer()

    assert.isTrue(Server.isListening)
  }

  @Test()
  public async shouldBeAbleToIgniteTheReplApplicationFromIgniteClass({ assert }: Context) {
    const ignite = await new Ignite().load(Config.get('meta'))

    const repl = await ignite.repl()

    assert.deepEqual(repl.context.ioc, ioc)

    repl.close()
  }

  @Test()
  public async shouldBeAbleToRegisterTheServicesDepsUsingTheCoreProvider({ assert }: Context) {
    const ignite = await new Ignite().load(Config.get('meta'), {
      environments: ['console'],
    })

    await ignite.fire()

    assert.isTrue(ioc.hasDependency('welcomeService'))
    assert.isTrue(ioc.hasDependency('App/Services/WelcomeService'))
    assert.isTrue(ioc.hasDependency('decoratedWelcomeService'))
    assert.isTrue(ioc.hasDependency('App/Services/DecoratedWelcomeService'))
  }

  @Test()
  public async shouldBeAbleToIgniteTheApplicationWithDifferentDirectoriesRegistered({ assert }: Context) {
    await new Ignite().load(Config.get('meta'), { athennaRcPath: Path.stubs('.athennarc-dirs.json') })

    assert.equal(Path.app(), Path.pwd('app'))
    assert.equal(Path.controllers(), Path.pwd('src/http/controllers'))
    assert.equal(Path.middlewares(), Path.pwd('src/http/middlewares'))
    assert.equal(Path.interceptors(), Path.pwd('src/http/interceptors'))
    assert.equal(Path.terminators(), Path.pwd('src/http/terminators'))
  }
}
