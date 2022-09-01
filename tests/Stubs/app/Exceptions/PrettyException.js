import { Exception } from '@secjs/utils'

export class PrettyException extends Exception {
  /**
   * Creates a new instance of PrettyException.
   *
   * @return {PrettyException}
   */
  constructor() {
    const content = `Error occurred inside ThrowErrorProvider.`

    super(content, 500, 'E_PRETTY_ERROR', `Restart computer.`)
  }
}
