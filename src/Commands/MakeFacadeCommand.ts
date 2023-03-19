/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { BaseCommand, Argument } from '@athenna/artisan'

export class MakeFacadeCommand extends BaseCommand {
  @Argument({
    description: 'The facade name.',
  })
  public name: string

  public static signature(): string {
    return 'make:facade'
  }

  public static description(): string {
    return 'Make a new facade file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING FACADE ])\n')

    const destPath = Config.get(
      'rc.commandsManifest.__options.makeFacade.destPath',
      Path.facades(),
    )

    const path = destPath.concat(`/${this.name}.${Path.ext()}`)

    const file = await this.generator
      .path(path)
      .template('facade')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Facade ({yellow} "${file.name}") successfully created.`,
    )
  }
}
