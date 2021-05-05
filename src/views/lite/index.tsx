import {AxiosInstance} from 'axios'
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


export class AppView extends React.Component<Props, State> {
  fileInput: any
  axiosConfig: any

  constructor(props) {
    super(props)
    this.state = {
      filename: '',
      botId: '',
      allowOverwrite: false,
      messageType: '',
      messageText: ''
    }
    this.fileInput = React.createRef()
    this.axiosConfig = {
      baseURL: '/api/v1/bots/___/mod/sheet2bot',
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    this.handleFileChange = this.handleFileChange.bind(this)
    this.handleBotIdChange = this.handleBotIdChange.bind(this)
    this.handleAllowOverwriteChange = this.handleAllowOverwriteChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
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

  async handleSubmit(event) {
    event.preventDefault()

    const form = new FormData()
    const file = this.fileInput.current.files[0]
    form.append('file', file)
    form.append('botId', this.state.botId)
    form.append('allowOverwrite', String(this.state.allowOverwrite))

    try {
      const res = await this.props.bp.axios.post('/import', form, this.axiosConfig)
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
              <a className="navbar-brand" href="https://chatbot.today/botpress-empowerkit">Botpress EmpowerKit</a>
            </div>
            <ul className="nav navbar-nav navbar-right">
              <li><a href="https://chatbot.today/">by Chatbot.Today</a></li>
            </ul>
          </div>
        </nav>
        <div className="jumbotron">
          <div className="container">
            <h1>Sheet2Bot</h1>
            <p>ExcelファイルからBotを作成できます。</p>
            <p><a className="btn btn-primary btn-lg" href="https://chatbot.today/sheet2bot" role="button">提供元サイトへ</a></p>
          </div>
        </div>
        <main className="container">
          <section>
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label htmlFor="BotSheet">ボットシート <span className="text-danger">*</span></label>
                <input type="file"
                       id="BotSheet"
                       ref={this.fileInput}
                       onChange={this.handleFileChange}/>
                <p className="help-block">ボットシートとは、Botのコンテンツを所定の形式で格納したExcelファイルです。（<a
                  href="http://localhost:3000/assets/modules/sheet2bot/botsheet-example.xlsx">サンプル</a>）</p>
              </div>
              <div className="form-group">
                <label htmlFor="BotId">Bot Id <span className="text-danger">*</span></label>
                <input type="text"
                       className="form-control"
                       id="BotId"
                       placeholder="yourBotId"
                       value={this.state.botId}
                       onChange={this.handleBotIdChange}/>
                <p className="help-block">半角英数字のみで、記号等は含められません。最低４文字必要です。<br/>
                  作成後にIDの変更はできませんので注意して命名してください。<br/>
                  Bot IDはURLに表示されるので、ボットの利用者の目に触れます。
                </p>
              </div>
              <div className="checkbox">
                <label>
                  <input type="checkbox"
                         name="allowOverwrite"
                         checked={this.state.allowOverwrite}
                         onChange={this.handleAllowOverwriteChange}/> allow Overwrite
                </label>
                <p className="help-block">これにチェックを入れると、指定したBot IDのボットが既に存在した場合に上書きされます。</p>
              </div>
              <p>
                <button type="submit" className="btn btn-success"
                        disabled={!this.state.filename || !this.state.botId}>
                  インポート
                </button>
              </p>
              <p>
                {this.state.messageType &&
                <pre className={`alert alert-${this.state.messageType}`} role="alert">
                {this.state.messageText}
              </pre>
                }
              </p>
              <hr/>
              <p>
                <a href="/admin">管理パネルへ</a>
              </p>
            </form>
          </section>
          <link rel="icon" href="/assets/ui-studio/public/img/favicon.png"/>
          <link href="/assets/ui-studio/public/external/material-icons.css" rel="stylesheet"/>
          <link href="/assets/ui-studio/public/external/font-lato.css" rel="stylesheet"/>
          <link href="/assets/ui-studio/public/external/font-roboto.css" rel="stylesheet"/>
          <link href="/assets/ui-studio/public/external/bootstrap.min.css" rel="stylesheet"/>
        </main>
      </div>
    )
  }
}
