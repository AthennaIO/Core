/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Options } from '@athenna/common'
import { BeforeAll } from '@athenna/test'
import { Artisan } from '@athenna/artisan'
import { Ignite, type IgniteOptions } from '@athenna/core'

export class BaseCliTest {
  public ignite: Ignite
  public igniteOptions: IgniteOptions = {}

  @BeforeAll()
  public async baseBeforeAll() {
    this.ignite = await new Ignite().load(
      import.meta.url,
      this.getIgniteOptions(),
    )
  }

  public async execute(
    command: string,
  ): Promise<{ stdout: string; stderr: string }> {
    return Artisan.callInChild(command, Path.bootstrap('artisan.ts'))
  }

  private getIgniteOptions() {
    return Options.create(this.igniteOptions, {
      bootLogs: false,
      loadConfigSafe: false,
      environments: ['test'],
    })
  }
}
