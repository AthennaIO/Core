/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path, Module } from '@athenna/common'
import { BaseCommand, Commander } from '@athenna/artisan'

export class TestCommand extends BaseCommand {
  public static signature(): string {
    return 'test'
  }

  public static description(): string {
    return 'Run the tests of your application.'
  }

  public static commander(commander: Commander) {
    return commander
      .allowUnknownOption()
      .option(
        '--tests',
        'Specify test titles: --tests="shouldBeOk,shouldNotBeOk"'
      )
      .option(
        '--groups',
        'Specify group titles: --groups="AppControllerTest,AppServiceTest"'
      )
      .option(
        '--files',
        'Specify files to match and run: --files="AppControllerTest.ts,AppServiceTest.ts"'
      )
      .option('--tags', 'Specify tags to match and run: --tags="unit"')
      .option('--force-exit', 'Enable/disable force exit')
      .option('--timeout', 'Define timeout for all tests: --timeout 3000')
  }

  public async handle(): Promise<void> {
    const entrypoint = Config.get(
      'rc.commands.test.entrypoint',
      Path.bin(`test.${Path.ext()}`)
    )

    process.argv.splice(2, 1)

    await Module.resolve(entrypoint, Config.get('rc.parentURL'))
  }
}
