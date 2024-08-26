/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { CronImpl } from '@athenna/cron'
import { Path, Options } from '@athenna/common'
import { AfterAll, BeforeAll } from '@athenna/test'
import { Ignite, type CronOptions, type IgniteOptions } from '#src'

export class BaseCronTest {
  public ignite: Ignite
  public cron: CronImpl
  public cronOptions: CronOptions = {}
  public igniteOptions: IgniteOptions = {}

  @BeforeAll()
  public async baseBeforeAll() {
    this.ignite = await new Ignite().load(
      Path.toHref(Path.bin(`test.${Path.ext()}`)),
      this.getIgniteOptions()
    )

    this.cron = await this.ignite.cron(this.getCronOptions())
  }

  @AfterAll()
  public async baseAfterAll() {
    await this.cron.close()
  }

  private getCronOptions() {
    return Options.create(this.cronOptions, {})
  }

  private getIgniteOptions() {
    return Options.create(this.igniteOptions, {
      bootLogs: false,
      loadConfigSafe: false,
      environments: ['test']
    })
  }
}
