/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ServerImpl } from '@athenna/http'
import { Json, Options } from '@athenna/common'
import { AfterAll, BeforeAll } from '@athenna/test'
import { Ignite, type HttpOptions, type IgniteOptions } from '@athenna/core'

export class BaseHttpTest {
  private env = Json.copy(process.env)
  private config = Json.copy(Config.get())
  public ignite: Ignite
  public httpServer: ServerImpl
  public httpOptions: HttpOptions = {}
  public igniteOptions: IgniteOptions = {}

  @BeforeAll()
  public async baseBeforeAll() {
    this.ignite = await new Ignite().load(
      Path.toHref(Path.bootstrap(`test.${Path.ext()}`)),
      this.getIgniteOptions()
    )

    this.httpServer = await this.ignite.httpServer(this.getHttpOptions())
  }

  @AfterAll()
  public async baseAfterAll() {
    await this.httpServer.close()
    ioc.reconstruct()
    process.env = Json.copy(this.env)
    Object.keys(this.config).forEach(key =>
      Config.set(key, Json.copy(this.config[key]))
    )
  }

  private getHttpOptions() {
    return Options.create(this.httpOptions, {})
  }

  private getIgniteOptions() {
    return Options.create(this.igniteOptions, {
      bootLogs: false,
      loadConfigSafe: false,
      environments: ['test']
    })
  }
}
