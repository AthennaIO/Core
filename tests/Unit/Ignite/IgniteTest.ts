/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Ignite } from '#src'
import { Test, TestContext } from '@athenna/test'

export default class IgniteTest {
  @Test()
  public async shouldBeAbleToIgniteTheApplicationWhenInstantiatingIgnite({ assert }: TestContext) {
    const ignite = new Ignite(import.meta.url)

    assert.equal(ignite.meta, import.meta.url)
    assert.containsSubset(ignite.options, {
      bootLogs: true,
      shutdownLogs: false,
      beforePath: '/build',
      loadConfigSafe: true,
      configPath: Path.config(),
      athennaRcPath: Path.pwd('.athennarc.json'),
    })
    assert.isTrue(ioc.hasDependency('Athenna/Core/Ignite'))
  }
}
