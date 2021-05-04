import {AxiosInstance} from 'axios'
import React from 'react'

interface State {
  botId: string
  allowOverwrite: boolean
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
      botId: '',
      allowOverwrite: false
    }
    this.fileInput = React.createRef()
    this.axiosConfig = {
      baseURL: '/api/v1/bots/___/mod/sheet2bot',
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    this.handleBotIdChange = this.handleBotIdChange.bind(this)
    this.handleAllowOverwriteChange = this.handleAllowOverwriteChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
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
    await this.props.bp.axios.post('/import', form, this.axiosConfig)
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
                       ref={this.fileInput}/>
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
              <button type="submit">インポート</button>
            </p>
          </form>
        </section>
      </main>
    )
  }
}
