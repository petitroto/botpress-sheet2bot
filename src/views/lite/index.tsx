import {AxiosInstance, ResponseType} from 'axios'
import React from 'react'
import {Status} from './status'

interface State {
  filename: string
  botId: string
  allowOverwrite: boolean
  messageType: string
  messageText: string
}

interface Props {
  bp: { axios: AxiosInstance }
}

function getBaseURL(botId = '___') {
  return `/api/v1/bots/${botId}/mod/sheet2bot`
}

export class AppView extends React.Component<Props, State> {
  fileInput: any

  constructor(props) {
    super(props)
    this.state = {
      filename: '',
      botId: '',
      allowOverwrite: false,
      messageType: '',
      messageText: '',
    }
    this.fileInput = React.createRef()

    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleBotIdChange = this.handleBotIdChange.bind(this)
    this.handleAllowOverwriteChange = this.handleAllowOverwriteChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleExport = this.handleExport.bind(this)
  }

  handleFileChange(event) {
    if (event.target.files.length > 0) {
      this.setState({filename: event.target.files[0].name})
    } else {
      this.setState({filename: ''})
    }
  }

  handleBotIdChange(event) {
    this.setState({botId: event.target.value})
  }

  handleAllowOverwriteChange(event) {
    this.setState({allowOverwrite: event.target.checked})
  }

  async handleExport() {
    // サーバーから受信
    const axiosConfig = {
      baseURL: getBaseURL(this.state.botId),
      responseType: 'blob' as ResponseType
    }
    const res = await this.props.bp.axios.get('/export', axiosConfig)
    const mineType = res.headers['content-type']
    const contentDisposition = res.headers['content-disposition']

    // 保存データの作成
    const blob = new Blob([res.data], {type: mineType})
    const downloadUrl = window.URL.createObjectURL(blob)
    const downloadFilename = contentDisposition.replace((/attachment; filename=(.+)$/), '$1')

    // ファイル保存の実行
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', downloadFilename)
    document.body.appendChild(link)
    link.click()
    window.URL.revokeObjectURL(downloadUrl)
  }

  async handleSubmit(event) {
    event.preventDefault()

    const axiosConfig = {
      baseURL: getBaseURL(),
      headers: {'content-type': 'multipart/form-data'}
    }
    const form = new FormData()
    const file = this.fileInput.current.files[0]
    form.append('file', file)
    form.append('botId', this.state.botId)
    form.append('allowOverwrite', String(this.state.allowOverwrite))

    try {
      const res = await this.props.bp.axios.post('/import', form, axiosConfig)
      const statusName = '200'
      const {messageType, messageText} = new Status(res.data.botId).getMessage(statusName)
      this.setState({messageType, messageText})
    } catch (err) {
      const statusName = err.response ? String(err.response.status) : 'Other'
      const {messageType, messageText} = new Status(this.state.botId).getMessage(statusName)
      this.setState({messageType, messageText})
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-inverse navbar-static-top">
          <div className="container">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar"
                      aria-expanded="false" aria-controls="navbar">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="https://chatbot.today/botpress-heartkit">HeartKit for Botpress</a>
            </div>
            <div id="navbar" className="navbar-collapse collapse">
              <div className="navbar-form navbar-right">
                <a href="https://chatbot.today/botpress-heartkit" type="submit" className="btn btn-success">公式サイトへ</a>
              </div>
            </div>
          </div>
        </nav>
        <div className="jumbotron">
          <div className="container">
            <h1>Sheet2Bot</h1>
            <p>Excelファイルでボットを作成・更新できます。</p>
          </div>
        </div>
        <main className="container">
          <section className="row marketing">
            <div className="col-md-6">
              <h3>インポート</h3>
              <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label htmlFor="BotSheet">ボットシート <span className="text-danger">*</span></label>
                  <input type="file"
                         id="BotSheet"
                         ref={this.fileInput}
                         onChange={this.handleFileChange}/>
                  <p className="help-block">ボットシートとは、ボットのコンテンツを所定の形式で格納したExcelファイルです。（<a
                    href="http://localhost:3000/assets/modules/sheet2bot/botsheet-example.xlsx">サンプルファイル</a>を加工するか、既存のボットをエクスポートして作成してください）
                  </p>
                </div>
                <div className="form-group">
                  <label htmlFor="BotId">Bot Id <span className="text-danger">*</span></label>
                  <input type="text"
                         className="form-control"
                         id="BotId"
                         placeholder="my_bot-1"
                         value={this.state.botId}
                         onChange={this.handleBotIdChange}/>
                  <p className="help-block">半角英数字のみで、空白や特殊文字は含められません。最低４文字必要です。</p>
                </div>
                <div className="checkbox">
                  <label>
                    <input type="checkbox"
                           name="allowOverwrite"
                           checked={this.state.allowOverwrite}
                           onChange={this.handleAllowOverwriteChange}/> 上書き更新を許可
                  </label>
                  <p className="help-block">チェックを入れると、指定したBot IDのボットが既に存在した場合に上書きされます。</p>
                </div>
                <p>
                  <button type="submit" className="btn btn-success"
                          disabled={!this.state.filename || !this.state.botId}>
                    インポート
                  </button>
                </p>
              </form>
            </div>

            <div className="col-md-6">
              <h3>エクスポート</h3>
              <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label htmlFor="BotId">Bot Id <span className="text-danger">*</span></label>
                  <input type="text"
                         className="form-control"
                         id="BotIdForExport"
                         placeholder="my_bot-1"
                         value={this.state.botId}
                         onChange={this.handleBotIdChange}/>
                </div>
                <p>
                  <button type="button" className="btn btn-success"
                          onClick={this.handleExport}>
                    エクスポート
                  </button>
                </p>
              </form>
            </div>

            <div className="col-md-12">
              <p>
                {
                  this.state.messageType &&
                  <pre className={`alert alert-${this.state.messageType}`}
                       role="alert">{this.state.messageText}</pre>
                }
              </p>
              <p className="text-right">
                <a href="/admin">Botpress管理パネルへ移動</a>
              </p>
              <hr/>
              <footer className="pull-right text-muted">
                HeartKit is distributed under MIT License by <a href="https://chatbot.today">Chatbot.Today</a>.
              </footer>
            </div>
          </section>
        </main>
        <link rel="icon" href="/assets/ui-studio/public/img/favicon.png"/>
        <link href="/assets/ui-studio/public/external/material-icons.css" rel="stylesheet"/>
        <link href="/assets/ui-studio/public/external/font-lato.css" rel="stylesheet"/>
        <link href="/assets/ui-studio/public/external/font-roboto.css" rel="stylesheet"/>
        <link href="/assets/ui-studio/public/external/bootstrap.min.css" rel="stylesheet"/>
      </div>
    )
  }
}
