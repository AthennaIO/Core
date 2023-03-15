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
    description: 'The test name.',
  })
  public name: string

  @Option({
    description: 'Create an unitary test.',
    signature: '-u, --unit',
    default: false,
  })
  public isUnit: boolean

  @Option({
    description: 'Create the test as function instead of class.',
    signature: '--function',
    default: false,
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
    let path = Path.tests(`E2E/${this.name}.${Path.ext()}`)

    if (this.isFunction) {
      template = 'testFn'
    }

    if (this.isUnit) {
      path = Path.tests(`Unit/${this.name}.${Path.ext()}`)
    }

    const file = await this.generator
      .path(path)
      .template(template)
      .setNameProperties(true)
      .make()

    this.logger.success(`Test ({yellow} "${file.name}") successfully created.`)
  }
}
