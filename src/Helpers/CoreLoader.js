export class CoreLoader {
  /**
   * Return all commands from artisan console application.
   *
   * @return {any[]}
   */
  static loadCommands() {
    return [import('#src/Commands/Repl')]
  }

  /**
   * Return all templates from artisan console application.
   *
   * @return {any[]}
   */
  static loadTemplates() {
    return []
  }
}
