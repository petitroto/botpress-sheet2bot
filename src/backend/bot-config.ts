export const botConfig = {
  locked: false,
  disabled: false,
  private: false,
  details: {},
  $schema: '../../bot.config.schema.json',
  description: '',
  active: true,
  version: '12.20.1',
  author: 'Your Name Here',
  license: 'AGPL-3.0',
  imports: {
    modules: [],
    incomingMiddleware: [],
    outgoingMiddleware: [],
    contentTypes: [
      'builtin_action-button',
      'builtin_card',
      'builtin_carousel',
      'builtin_image',
      'builtin_single-choice',
      'builtin_text',
      'dropdown'
    ]
  },
  dialog: {
    timeoutInterval: '5m'
  },
  logs: {
    expiration: '1 week'
  },
  defaultLanguage: 'ja',
  languages: [
    'ja'
  ],
  id: 'empty',
  name: 'empty',
  pipeline_status: {
    current_stage: {
      id: 'prod',
      promoted_on: '2021-05-05T00:00:00.000Z',
      promoted_by: 'example@example.com'
    }
  }
}
