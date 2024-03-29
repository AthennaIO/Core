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
    description: 'The provider name.'
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

    const destination = Config.get(
      'rc.commands.make:provider.destination',
      Path.providers()
    )
    const file = await this.generator
      .fileName(this.name)
      .destination(destination)
      .template('provider')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Provider ({yellow} "${file.name}") successfully created.`
    )

    const importPath = this.generator.getImportPath()

    await this.rc.pushTo('providers', importPath).save()

    this.logger.success(
      `Athenna RC updated: ({dim,yellow} [ providers += "${importPath}" ])`
    )
  }
}
