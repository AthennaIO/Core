/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ignite } from '#src'
import { pathToFileURL } from 'node:url'
import { BeforeEach, Test, TestContext } from '@athenna/test'

export default class IgniteTest {
  @BeforeEach()
  public async beforeEach() {
    ioc.reconstruct()
    Config.delete('rc')
    Path.defaultBeforePath = ''

    delete process.env.IS_TS
  }

  @Test()
  public async shouldBeAbleToIgniteTheApplicationWhenInstantiatingIgnite({ assert }: TestContext) {
    const ignite = new Ignite(Config.get('meta'))

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
    const ignite = new Ignite(Config.get('meta'), { beforePath: '/dist' })

    assert.isTrue(Env('IS_TS', false))
    assert.isFalse(Path.pwd().includes('/dist'))
    assert.equal(ignite.meta, Config.get('meta'))
    assert.containsSubset(ignite.options, {
      beforePath: '/dist',
    })
  }

  @Test()
  public async shouldBeAbleToIgniteTheApplicationRunningJavascriptCompiledCodeWhenInstantiatingIgnite({
    assert,
  }: TestContext) {
    const meta = pathToFileURL(Path.stubs('main.js')).href
    const ignite = new Ignite(meta, { beforePath: '/dist' })

    assert.isFalse(Env('IS_TS', true))
    assert.isTrue(Path.pwd().includes('/dist'))
    assert.equal(ignite.meta, meta)
    assert.containsSubset(ignite.options, {
      beforePath: '/dist',
    })
  }

  @Test()
  public async shouldBeAbleToIgniteTheApplicationLoadingADifferentRcFileWhenInstantiatingIgnite({
    assert,
  }: TestContext) {
    const ignite = new Ignite(Config.get('meta'), { athennaRcPath: Path.stubs('.athennarc.json') })

    assert.equal(ignite.meta, Config.get('meta'))
    assert.deepEqual(Config.get('rc.providers'), [])
    assert.containsSubset(ignite.options, {
      athennaRcPath: Path.stubs('.athennarc.json'),
    })
  }
}
