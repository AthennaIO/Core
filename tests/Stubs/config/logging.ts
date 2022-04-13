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
  | Available Drivers:
  |   "console", "debug", "discord", "file", "null", "pino", "slack", "telegram".
  | Available Formatters:
  |   "cli", "simple", "nest", "json", "request", "message", "pino-pretty(only for pino driver)".
  |
  */

  channels: {
    application: {
      driver: 'console',
      formatter: 'nest',
      formatterConfig: {
        level: 'INFO',
        chalk: Color.cyan,
        context: 'Logger',
      },

      streamType: 'stdout',
    },
    request: {
      driver: 'console',
      formatter: 'request',
      formatterConfig: {
        asJson: false,
      },

      streamType: 'stdout',
    },
    pino: {
      driver: 'pino',
      formatter: 'pino-pretty',
      formatterConfig: {
        level: 'INFO',
        colorize: true,
      },
    },
    debug: {
      driver: 'debug',
      formatter: 'nest',
      formatterConfig: {
        level: 'DEBUG',
        chalk: Color.purple,
        context: 'Debugger',
      },

      namespace: 'api:main',
    },
    discard: {
      driver: 'null',
    },
    file: {
      driver: 'file',
      formatter: 'simple',
      formatterConfig: {
        level: 'INFO',
        chalk: Color.cyan,
        context: 'Logger',
      },

      filePath: Path.noBuild().logs('athenna.log'),
    },
    slack: {
      driver: 'slack',
      formatter: 'message',
      formatterConfig: {
        level: 'INFO',
      },

      url: 'your-slack-webhook-url',
    },
    discord: {
      driver: 'discord',
      formatter: 'message',
      formatterConfig: {
        level: 'INFO',
      },

      username: 'Athenna',
      url: 'your-discord-webhook-url',
    },
    telegram: {
      driver: 'telegram',
      formatter: 'message',
      formatterConfig: {
        level: 'INFO',
      },

      token: 'your-telegram-bot-token',
      chatId: 0,
      parseMode: 'HTML',
    },
  },
}
