export class Status {
  statusName2message

  constructor(botId) {
    this.statusName2message = {
      '200': {
        messageType: 'success',
        messageText: `Bot Id「${botId}」のインポートに成功しました`
      },
      '400': {
        messageType: 'warning',
        messageText: '必要なパラメータが不足しています'
      },
      '401': {
        messageType: 'warning',
        messageText: 'Botpressの認証が無効です。もう一度ログインしてから、このページをリロードしてください'
      },
      '406': {
        messageType: 'warning',
        messageText: 'このExcelファイルは、Botとしてインポート可能な形式ではありません。\nサンプルフォーマットに従って作成したファイルをインポートしてください'
      },
      '409': {
        messageType: 'warning',
        messageText: 'そのbot Idは既に使われています。上書きする場合は allow Overwrite にチェックをいれてください。\n（ただし、IDが指定されていないコンテンツがシートに含まれる場合、上書きするとコンテンツの重複が発生します）'
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
