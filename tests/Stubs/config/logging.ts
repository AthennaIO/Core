import { Path } from '@secjs/utils'
import { Color } from '@athenna/logger'

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
  | Available Formatters: "cli", "simple", "nest", "json".
  |
  */

  channels: {
    application: {
      driver: 'console',
      formatter: 'nest',
      streamType: 'stdout',
      formatterConfig: {
        level: 'INFO',
        chalk: Color.cyan,
        context: 'Logger',
      },
    },
    debug: {
      driver: 'debug',
      formatter: 'nest',
      namespace: 'api:main',
      formatterConfig: {
        level: 'DEBUG',
        chalk: Color.purple,
        context: 'Debugger',
      },
    },
    file: {
      driver: 'file',
      formatter: 'simple',
      filePath: Path.noBuild().logs('athenna.log'),
      formatterConfig: {
        level: 'INFO',
        chalk: Color.cyan,
        context: 'Logger',
      },
    },
  },
}
