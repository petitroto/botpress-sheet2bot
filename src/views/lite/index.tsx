import {AxiosInstance} from 'axios'
import React from 'react'

interface State {
  filename: string
  botId: string
  allowOverwrite: boolean
  message: string
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
      message: ''
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
    const file = this.fileInput.current.files[0]
    const form = new FormData()
    form.append('file', file)
    form.append('botId', this.state.botId)
    form.append('allowOverwrite', String(this.state.allowOverwrite))
    try {
      const res = await this.props.bp.axios.post('/import', form, this.axiosConfig)
      this.setState({message: `BotId「${res.data.botId}」のインポートに成功しました`})
    } catch (err) {
      this.setState({message: 'インポートに失敗しました'})
    }
  }

  render() {
    return (
      <main>
        <h1>Sheet2Bot</h1>
        <section>
          <p>ExcelファイルをインポートしてBotを作成できます。</p>
          <form onSubmit={this.handleSubmit}>
            <p>
              <label>
                BotSheet:
                <input type="file"
                       ref={this.fileInput}
                       onChange={this.handleFileChange}/>
              </label>
            </p>
            <p>
              <label>
                BotId:
                <input type="text"
                       value={this.state.botId}
                       onChange={this.handleBotIdChange}/>
              </label>
            </p>
            <p>
              <label>
                allowOverwrite:
                <input type="checkbox"
                       name="allowOverwrite"
                       checked={this.state.allowOverwrite}
                       onChange={this.handleAllowOverwriteChange}/>
              </label>
            </p>
            <p>
              <button type="submit"
                      disabled={!this.state.filename || !this.state.botId}>
                インポート
              </button>
            </p>
            <p>
              {this.state.message && <span>{this.state.message}</span>}
            </p>
          </form>
        </section>
      </main>
    )
  }
}
