import {AxiosInstance, ResponseType} from 'axios'
import * as sdk from 'botpress/sdk'
import React from 'react'
import Select from 'react-select'
import {Status} from './status'

interface State {
  filename: string
  botId: string
  allowOverwrite: boolean
  messageType: string
  messageText: string
  templates: sdk.BotTemplate[]
  selectedTemplate?: sdk.BotTemplate
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
      templates: [],
      selectedTemplate: undefined
    }
    this.fileInput = React.createRef()

    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleBotIdChange = this.handleBotIdChange.bind(this)
    this.handleAllowOverwriteChange = this.handleAllowOverwriteChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleExport = this.handleExport.bind(this)
  }

  async componentDidMount() {
    const url = '/api/v1/bots/___/mod/sheet2bot/listBotTemplate'
    const res = await this.props.bp.axios.get(url)
    this.setState({
      templates: res.data.templates,
      selectedTemplate: res.data.templates.find(template => template.id === 'qna-with-fallback')
    })
  }

  handleFileChange(event) {
    if (event.target.files.length > 0) {
      this.setState({filename: event.target.files[0].name})
    } else {
      this.setState({filename: ''})
    }
  }

  handleBotIdChange(event) {
    this.setState({botId: event.target.value.trim()})
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
    const status = new Status('export', this.state.botId)
    let res
    try {
      res = await this.props.bp.axios.get('/export', axiosConfig)
      const statusName = '200'
      const {messageType, messageText} = status.getMessage(statusName)
      this.setState({messageType, messageText})
    } catch (err) {
      const statusName = err.response ? String(err.response.status) : 'Other'
      const {messageType, messageText} = status.getMessage(statusName)
      this.setState({messageType, messageText})
      return
    }

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
    const status = new Status('import', this.state.botId)

    const form = new FormData()
    const file = this.fileInput.current.files[0]
    form.append('file', file)
    form.append('botId', this.state.botId)
    form.append('templateId', this.state.selectedTemplate.id)
    form.append('templateModuleId', this.state.selectedTemplate.moduleId)
    form.append('allowOverwrite', String(this.state.allowOverwrite))

    try {
      await this.props.bp.axios.post('/import', form, axiosConfig)
      const statusName = '200'
      const {messageType, messageText} = status.getMessage(statusName)
      this.setState({messageType, messageText})
    } catch (err) {
      const statusName = err.response ? String(err.response.status) : 'Other'
      const {messageType, messageText} = status.getMessage(statusName)
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
                <span className="icon-bar"/>
                <span className="icon-bar"/>
                <span className="icon-bar"/>
              </button>
              <a className="navbar-left" href="https://chatbot.today/botpress-heartkit"><img
                src="/assets/modules/sheet2bot/heartkit-logo.png" height="50"/></a>
            </div>
            <div id="navbar" className="navbar-collapse collapse">
              <div className="navbar-form navbar-right">
                <a href="https://chatbot.today/botpress-heartkit" type="submit" className="btn btn-primary">公式サイトへ</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="container">
          <section className="page-header">
            <h1>Sheet2Bot</h1>
            <p className="lead">Excelファイルでボットを作成・更新できます。</p>
          </section>
          <section className="row">
            <div className="col-sm-12">
              <p>
                {
                  this.state.messageType &&
                  <pre className={`alert alert-${this.state.messageType}`}
                       role="alert">{this.state.messageText}</pre>
                }
              </p>
            </div>
            <div className="col-sm-6">
              <h3>インポート</h3>
              <p><small>ボットシートをアップロードして、新規のボットを作成するか、既存のボットを上書きします。</small></p>
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
                  <label htmlFor="BotId">インポート先のBot Id <span className="text-danger">*</span></label>
                  <input type="text"
                         className="form-control"
                         id="BotId"
                         placeholder="my_bot-1"
                         value={this.state.botId}
                         onChange={this.handleBotIdChange}/>
                  <p className="help-block">半角英数字のみで、空白や特殊文字は含められません。最低４文字必要です。</p>
                </div>
                <div className="form-group">
                  <label htmlFor="allowOverwrite">上書き更新</label>
                  <div className="checkbox" id="allowOverwrite">
                    <label>
                      <input type="checkbox"
                             name="allowOverwrite"
                             checked={this.state.allowOverwrite}
                             onChange={this.handleAllowOverwriteChange}/> 上書き更新を許可
                    </label>
                    <p className="help-block">チェックを入れると、指定したBot
                      IDのボットが既に存在した場合に上書きされます。（インポート内容のコンテンツ以外は、既存のボットの内容が残ります）</p>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="BotTemplate">使用するボットテンプレート（既存ボットが存在しない場合） <span className="text-danger">*</span></label>
                  <Select
                    options={this.state.templates}
                    value={this.state.selectedTemplate}
                    onChange={selectedTemplate => this.setState({selectedTemplate: selectedTemplate as any})}
                    getOptionLabel={o => o.name}
                    getOptionValue={o => o.id}
                  />
                  <p className="help-block">新規作成するボットの元になるテンプレートを選択します。（空っぽのボットにインポートしたい場合はEmpty Botを選択してください）</p>
                </div>
                <p>
                  <button type="submit" className="btn btn-success"
                          disabled={!this.state.filename || !this.state.botId}>
                    インポート
                  </button>
                </p>
              </form>
            </div>

            <div className="col-sm-6">
              <h3>エクスポート</h3>
              <p><small>既存のボットのコンテンツを、ボットシート形式でダウンロードします。</small></p>
              <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                  <label htmlFor="BotId">エクスポートするBot Id <span className="text-danger">*</span></label>
                  <input type="text"
                         className="form-control"
                         id="BotIdForExport"
                         placeholder="my_bot-1"
                         value={this.state.botId}
                         onChange={this.handleBotIdChange}/>
                </div>
                <p>
                  <button type="button" className="btn btn-success"
                          disabled={!this.state.botId}
                          onClick={this.handleExport}>
                    エクスポート
                  </button>
                </p>
              </form>
            </div>

            <div className="col-sm-12">
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
        <link href="/assets/studio/ui/public/external/material-icons.css" rel="stylesheet"/>
        <link href="/assets/studio/ui/public/external/font-lato.css" rel="stylesheet"/>
        <link href="/assets/studio/ui/public/external/font-roboto.css" rel="stylesheet"/>
        <link href="/assets/studio/ui/public/external/bootstrap.min.css" rel="stylesheet"/>
      </div>
    )
  }
}
