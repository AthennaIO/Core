/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { BeforeAll } from '@athenna/test'
import { Path, Options } from '@athenna/common'
import { Ignite, type IgniteOptions } from '@athenna/core'
import { TestCommand } from '@athenna/artisan/testing/plugins'

export class BaseConsoleTest {
  public ignite: Ignite
  public igniteOptions: IgniteOptions = {}
  public artisanPath: string = Path.bootstrap(`artisan.${Path.ext()}`)

  @BeforeAll()
  public async baseBeforeAll() {
    TestCommand.setArtisanPath(this.artisanPath)

    this.ignite = await new Ignite().load(
      Path.toHref(Path.bootstrap(`test.${Path.ext()}`)),
      this.getIgniteOptions()
    )
  }

  private getIgniteOptions() {
    return Options.create(this.igniteOptions, {
      bootLogs: false,
      loadConfigSafe: false,
      environments: ['test']
    })
  }
}
