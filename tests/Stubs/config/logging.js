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
  */

  channels: {
    application: {
      driver: 'console',
      formatter: 'simple',
      streamType: 'stdout',
      formatterConfig: {},
    },
    console: {
      driver: 'console',
      formatter: 'cli',
      streamType: 'stdout',
      formatterConfig: {},
    },
    exception: {
      driver: 'console',
      formatter: 'none',
      streamType: 'stdout',
    },
    request: {
      driver: 'console',
      formatter: 'request',
      streamType: 'stdout',
      formatterConfig: {
        asJson: false,
      },
    },
  },
}
