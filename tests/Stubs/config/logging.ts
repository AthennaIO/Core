import { Path } from '@secjs/utils'

export default {
  /*
  |--------------------------------------------------------------------------
  | Default Log Channel
  |--------------------------------------------------------------------------
  |
  | This option defines the default log channel that gets used when writing
  | messages to the logs. The name specified in this option should match
  | one of the channels defined in the "channels" configuration object.
  |
  */

  default: 'application',

  /*
  |--------------------------------------------------------------------------
  | Log Channels
  |--------------------------------------------------------------------------
  |
  | Here you may configure the log channels for your application.
  |
  | Available Drivers: "console", "debug", "file".
  | Available Formatters: "context", "debug", "json", "log".
  |
  */

  channels: {
    application: {
      driver: 'console',
      context: 'Logger',
      formatter: 'context',
    },
    debug: {
      driver: 'debug',
      context: 'Debugger',
      formatter: 'context',
      namespace: 'api:main',
    },
    file: {
      driver: 'file',
      context: 'Logger',
      formatter: 'log',
      filePath: Path.noBuild().logs('athenna.log'),
    },
  },
}
