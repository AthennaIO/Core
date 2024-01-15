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

export class MakeServiceCommand extends BaseCommand {
  @Argument({
    description: 'The service name.'
  })
  public name: string

  public static signature(): string {
    return 'make:service'
  }

  public static description(): string {
    return 'Make a new service file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING SERVICE ])\n')

    const destination = Config.get(
      'rc.commands.make:service.destination',
      Path.services()
    )
    const file = await this.generator
      .fileName(this.name)
      .destination(destination)
      .template('service')
      .setNameProperties(true)
      .make()

    this.logger.success(
      `Service ({yellow} "${file.name}") successfully created.`
    )

    const importPath = this.generator.getImportPath()

    await this.rc.pushTo('services', importPath).save()

    this.logger.success(
      `Athenna RC updated: ({dim,yellow} [ services += "${importPath}" ])`
    )
  }
}
