/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Options } from '@athenna/common'
import { ServerImpl } from '@athenna/http'
import { AfterAll, BeforeAll } from '@athenna/test'
import { Ignite, type HttpOptions, type IgniteOptions } from '@athenna/core'

export class BaseRestTest {
  public ignite: Ignite
  public restServer: ServerImpl
  public restOptions: HttpOptions = {}
  public igniteOptions: IgniteOptions = {}

  @BeforeAll()
  public async baseBeforeAll() {
    this.ignite = await new Ignite().load(
      import.meta.url,
      this.getIgniteOptions(),
    )

    this.restServer = await this.ignite.httpServer(this.getRestOptions())
  }

  @AfterAll()
  public async baseAfterAll() {
    await this.restServer.close()
  }

  private getRestOptions() {
    return Options.create(this.restOptions, {})
  }

  private getIgniteOptions() {
    return Options.create(this.igniteOptions, {
      bootLogs: false,
      loadConfigSafe: false,
      environments: ['test'],
    })
  }
}
