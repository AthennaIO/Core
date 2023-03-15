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

export class MakeProviderCommand extends BaseCommand {
  @Argument({
    description: 'The provider name.',
  })
  public name: string

  public static signature(): string {
    return 'make:provider'
  }

  public static description(): string {
    return 'Make a new provider file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING PROVIDER ])\n')

    const file = await this.generator
      .path(Path.providers(`${this.name}.${Path.ext()}`))
      .template('provider')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Provider ({yellow} "${file.name}") successfully created.`,
    )

    const importPath = `#providers/${file.name}`

    await this.rc.pushTo('providers', importPath).save()

    this.logger.success(
      `Athenna RC updated: ({dim,yellow} [ providers += "${importPath}" ])`,
    )
  }
}
