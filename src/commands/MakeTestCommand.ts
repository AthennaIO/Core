/**
 * @athenna/core
 *
 * (c) João Lenon <lenon@athenna.io>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Path } from '@athenna/common'
import { BaseCommand, Argument, Option } from '@athenna/artisan'

export class MakeTestCommand extends BaseCommand {
  @Argument({
    description: 'The test name.'
  })
  public name: string

  @Option({
    description: 'Create an unitary test.',
    signature: '-u, --unit',
    default: false
  })
  public isUnit: boolean

  @Option({
    description: 'Create a HTTP test.',
    signature: '-h, --http',
    default: false
  })
  public isHttp: boolean

  @Option({
    description: 'Create a Console test.',
    signature: '-c, --console',
    default: false
  })
  public isConsole: boolean

  @Option({
    description: 'Create a Cron test.',
    signature: '-cr, --cron',
    default: false
  })
  public isCron: boolean

  @Option({
    description: 'Create the test as function instead of class.',
    signature: '--function',
    default: false
  })
  public isFunction: boolean

  public static signature(): string {
    return 'make:test'
  }

  public static description(): string {
    return 'Make a new test file.'
  }

  public async handle(): Promise<void> {
    this.logger.simple('({bold,green} [ MAKING TEST ])\n')

    let template = 'test'

    if (this.isConsole) template = 'test-console'
    else if (this.isCron) template = 'test-cron'
    else if (this.isHttp) template = 'test-http'
    else if (this.isUnit) template = 'test' // This is necessary to avoid multiple options case.

    if (this.isFunction) {
      template = 'test-fn'
    }

    const destination = Config.get(
      'rc.commands.make:test.destination',
      this.isUnit ? Path.tests('unit') : Path.tests('e2e')
    )
    const file = await this.generator
      .fileName(this.name)
      .destination(destination)
      .template(template)
      .setNameProperties(true)
      .make()

    this.logger.success(`Test ({yellow} "${file.name}") successfully created.`)
  }
}
