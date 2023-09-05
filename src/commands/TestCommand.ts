/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Module } from '@athenna/common'
import { Option, BaseCommand, Commander } from '@athenna/artisan'

export class TestCommand extends BaseCommand {
  @Option({
    signature: '-e, --env <env>',
    description: 'Change the environment where your tests wil run.',
    default: 'test',
  })
  public env: string

  public static signature(): string {
    return 'test'
  }

  public static description(): string {
    return 'Run the tests of your application.'
  }

  public static commander(commander: Commander) {
    return commander.allowUnknownOption()
  }

  // TODO Verify if this command still makes sense to exist.
  public async handle(): Promise<void> {
    if (this.env !== '') {
      process.env.NODE_ENV = this.env
    }

    const entrypoint = Config.get(
      'rc.commands.test.entrypoint',
      Path.bootstrap(`test.${Path.ext()}`),
    )

    process.argv.splice(2, 1)

    await Module.resolve(entrypoint, Config.get('rc.meta'))
  }
}
