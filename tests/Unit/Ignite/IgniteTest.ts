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
import { pathToFileURL } from 'node:url'
import { BaseTest } from '#tests/Helpers/BaseTest'
import { Exec, File, Json } from '@athenna/common'
import { Test, ExitFaker, TestContext } from '@athenna/test'

export default class IgniteTest extends BaseTest {
  @Test()
  public async shouldBeAbleToIgniteTheApplicationWhenInstantiatingIgnite({ assert }: TestContext) {
    const ignite = await new Ignite().load(Config.get('meta'))

    assert.equal(ignite.meta, Config.get('meta'))
    assert.containsSubset(ignite.options, {
      bootLogs: true,
      shutdownLogs: false,
      beforePath: '/build',
      loadConfigSafe: true,
      configPath: Path.config(),
      athennaRcPath: Path.pwd('package.json'),
    })
    assert.isTrue(ioc.hasDependency('Athenna/Core/Ignite'))
  }

  @Test()
  public async shouldBeAbleToIgniteTheApplicationRunningTypescriptWhenInstantiatingIgnite({ assert }: TestContext) {
    const ignite = await new Ignite().load(Config.get('meta'), { beforePath: '/dist' })

    assert.isTrue(Env('IS_TS', false))
    assert.isFalse(Path.pwd().includes('dist'))
    assert.equal(ignite.meta, Config.get('meta'))
    assert.containsSubset(ignite.options, { beforePath: '/dist' })
  }

  @Test()
  public async shouldBeAbleToIgniteTheApplicationRunningJavascriptCompiledCodeWhenInstantiatingIgnite({
    assert,
  }: TestContext) {
    delete process.env.IS_TS
    const meta = pathToFileURL(Path.stubs('main.js')).href
    const ignite = await new Ignite().load(meta, { beforePath: '/dist' })

    assert.isFalse(Env('IS_TS', true))
    assert.isTrue(Path.pwd().includes('dist'))
    assert.equal(ignite.meta, meta)
    assert.containsSubset(ignite.options, { beforePath: '/dist' })
  }

  @Test()
  public async shouldBeAbleToIgniteTheApplicationLoadingADifferentRcFileWhenInstantiatingIgnite({
    assert,
  }: TestContext) {
    Config.delete('rc')
    const ignite = await new Ignite().load(Config.get('meta'), { athennaRcPath: Path.stubs('.athennarc.json') })

    assert.equal(ignite.meta, Config.get('meta'))
    assert.deepEqual(Config.get('rc.providers'), [])
    assert.containsSubset(ignite.options, { athennaRcPath: Path.stubs('.athennarc.json') })
  }

  @Test()
  public async shouldBeAbleToIgniteTheApplicationWithoutAnRcFileWhenInstantiatingIgnite({ assert }: TestContext) {
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
  public async shouldNotThrowAnErrorWhenTheNodeEngineSatisfiesTheSemverVersion({ assert }: TestContext) {
    Config.set('rc.engines', { node: '>=14.0.0' })

    await new Ignite().load(Config.get('meta'))

    assert.isFalse(ExitFaker.faker.called)
  }

  @Test()
  public async shouldThrowAnErrorWhenTheNodeEngineDoesNotSatisfiesTheSemverVersion({ assert }: TestContext) {
    Config.set('rc.engines', { node: '>=20.0.0' })

    await new Ignite().load(Config.get('meta'))

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }

  @Test()
  public async shouldBeAbleToFireTheIgniteClassLoadingAllTheRestOfTheApplication({ assert }: TestContext) {
    Config.set('rc.environments', ['other'])

    const ignite = await new Ignite().load(Config.get('meta'), {
      envPath: Path.stubs('.env'),
      configPath: Path.stubs('igniteConfig'),
    })

    await ignite.fire(['console'])

    assert.equal(Env('IGNITE_FIRED'), true)
    assert.equal(Env('NODE_ENV'), 'local')
    assert.isTrue(Config.is('ignite.fired', true))
    assert.deepEqual(Config.get('rc.environments'), ['console'])
    assert.deepEqual(Config.get('rc.providers'), [
      '@athenna/http/providers/HttpRouteProvider',
      '@athenna/http/providers/HttpServerProvider',
    ])
  }

  @Test()
  public async shouldBeAbleToFireTheIgniteClassLoadingAllTheRestOfTheApplicationResolvingTheEnvByNODE_ENV({
    assert,
  }: TestContext) {
    await new File(Path.stubs('.env')).copy(Path.pwd('.env'))
    await new File(Path.stubs('.env.local')).copy(Path.pwd('.env.local'))

    process.env.OVERRIDE_ENV = 'true'
    Config.set('rc.environments', ['other'])

    const ignite = await new Ignite().load(Config.get('meta'), { configPath: Path.stubs('igniteConfig') })

    await ignite.fire(['console'])

    assert.isUndefined(Env('IGNITE_FIRED'))
    assert.equal(Env('ENV_LOCAL_LOADED'), true)
    assert.isTrue(Config.is('ignite.fired', true))
    assert.deepEqual(Config.get('rc.environments'), ['console'])
    assert.deepEqual(Config.get('rc.providers'), [
      '@athenna/http/providers/HttpRouteProvider',
      '@athenna/http/providers/HttpServerProvider',
    ])
  }

  @Test()
  public async shouldBeAbleToHandleSyntaxErrorExceptionsOfConfigsUsingTheDefaultIgniteHandler({ assert }: TestContext) {
    const ignite = await new Ignite().load(Config.get('meta'), { configPath: Path.stubs('syntaxErrorConfig') })

    await ignite.fire(['console'])

    assert.isTrue(ExitFaker.faker.calledWith(1))
  }

  @Test()
  public async shouldBeAbleToDefineWrongVersionsInPackageJsonButStillWorks({ assert }: TestContext) {
    const copy = Json.copy(this.originalPJson)
    copy.version = 'a.b.c'
    await new File(Path.pwd('package.json')).setContent(JSON.stringify(copy, null, 2).concat('\n'))

    await new Ignite().load(Config.get('meta'))

    assert.isUndefined(Env('APP_VERSION'))
  }

  @Test()
  public async shouldBeAbleToDefineApplicationSignals({ assert }: TestContext) {
    let SIGINT = false
    let SIGTERM = false

    Config.set('app.signals', {
      SIGINT: () => (SIGINT = true),
      SIGTERM: () => (SIGTERM = true),
    })

    const ignite = await new Ignite().load(Config.get('meta'))

    await ignite.fire(['console'])

    process.emit('SIGINT')
    process.emit('SIGTERM')

    assert.equal(SIGINT, true)
    assert.equal(SIGTERM, true)
  }

  @Test()
  public async shouldNotDefineApplicationSignalsMoreThanOnce({ assert }: TestContext) {
    let SIGINT = false
    let SIGTERM = false

    Config.set('app.signals', {
      SIGINT: () => (SIGINT = true),
      SIGTERM: () => (SIGTERM = true),
    })

    const ignite = await new Ignite().load(Config.get('meta'))

    await ignite.fire(['console'])

    Config.set('app.signals', {
      SIGINT: () => (SIGINT = false),
      SIGTERM: () => (SIGTERM = false),
    })

    await ignite.fire(['console'])

    process.emit('SIGINT')
    process.emit('SIGTERM')

    assert.equal(SIGINT, true)
    assert.equal(SIGTERM, true)
  }

  @Test()
  public async shouldBeAbleToExecuteDefaultSIGINTSignalOfIgnite({ assert }: TestContext) {
    const ignite = await new Ignite().load(Config.get('meta'))

    await ignite.fire(['console'])

    process.emit('SIGINT')

    assert.isTrue(ExitFaker.faker.called)
  }

  @Test()
  public async shouldBeAbleToExecuteDefaultSIGTERMSignalOfIgnite({ assert }: TestContext) {
    const processKillStub = fake()
    process.kill = processKillStub
    Config.set('rc.providers', ['#tests/Stubs/providers/ConsoleEnvProvider'])

    const ignite = await new Ignite().load(Config.get('meta'))

    await ignite.fire(['console'])

    process.emit('SIGTERM', 'SIGTERM')

    await Exec.sleep(100)

    assert.isTrue(ioc.hasDependency('ConsoleEnvShutdown'))
    assert.isTrue(processKillStub.calledWith(process.pid, 'SIGTERM'))
  }

  @Test()
  public async shouldIgnoreUndefinedSignalsFromAppSignals({ assert }: TestContext) {
    Config.set('app.signals', {
      SIGINT: null, // will set the default signal
      IGNORE: undefined,
      SIGTERM: undefined, // will set the default signal
    })

    const ignite = await new Ignite().load(Config.get('meta'))

    await ignite.fire(['console'])

    const events = process.eventNames()

    assert.isTrue(events.includes('SIGINT'))
    assert.isTrue(events.includes('SIGTERM'))
    assert.isFalse(events.includes('IGNORE'))
  }

  @Test()
  public async shouldBeAbleToIgniteTheArtisanApplicationFromIgniteClass({ assert }: TestContext) {
    const ignite = await new Ignite().load(Config.get('meta'))

    await ignite.artisan(['node', 'artisan', 'test:generate'], { routePath: Path.stubs('routes/console.ts') })

    assert.isTrue(await File.exists(Path.stubs('storage/Command.ts')))
  }
}
