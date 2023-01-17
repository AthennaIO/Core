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
      driver: 'null',
      formatter: 'simple',
    },
    console: {
      driver: 'null',
      formatter: 'cli',
    },
    discard: {
      driver: 'null',
    },
    exception: {
      driver: 'null',
      streamType: 'stderr',

      formatter: 'none',
    },
    request: {
      driver: 'null',
      streamType: 'stdout',

      formatter: 'request',
      formatterConfig: {
        asJson: false,
      },
    },
  },
}
