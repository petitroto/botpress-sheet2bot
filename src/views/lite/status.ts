export class Status {
  statusName2message

  constructor(context, botId) {
    this.statusName2message = {
      '200': {
        messageType: 'success',
        messageText: {
          import: `Bot Id「${botId}」のインポートに成功しました`,
          export: `Bot Id「${botId}」のエクスポートに成功しました`
        }[context]
      },
      '400': {
        messageType: 'warning',
        messageText: '必要なパラメータが不足しています'
      },
      '401': {
        messageType: 'warning',
        messageText: 'Botpressの認証が無効です。もう一度ログインしてから、このページをリロードしてください'
      },
      '404': {
        messageType: 'warning',
        messageText: '指定したBot Idのボットが存在しませんでした。既に存在するボットのBot Idを正しく入力してください'
      },
      '406': {
        messageType: 'warning',
        messageText: 'このExcelファイルは、Botとしてインポート可能な形式ではありません。\nサンプルフォーマットに従って作成したファイルをインポートしてください'
      },
      '409': {
        messageType: 'warning',
        messageText: '指定したBot Idは既に使われています。上書きする場合は「上書き更新を許可」にチェックをいれてください。\n（ただし、シート内のコンテンツにIDが指定されていない場合、上書きするとコンテンツの重複が発生します）'
      },
      '415': {
        messageType: 'warning',
        messageText: 'このファイルはxlsx形式ではありません'
      },
      'Other': {
        messageType: 'danger',
        messageText: 'インポートに失敗しました'
      }
    }
  }

  getMessage(statusName) {
    if (!this.includes(statusName)) {
      statusName = 'Other'
    }
    return this.statusName2message[statusName]
  }

  includes(statusName) {
    return Object.keys(this.statusName2message).includes(statusName)
  }
}
