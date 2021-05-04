import React from 'react'

export class AppView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {botId: ''};
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
    this.axiosConfig = {
      baseURL: '/api/v1/bots/___/mod/sheet2bot',
      headers: {
        'content-type': 'multipart/form-data'
      }
    }

    this.handleBotIdChange = this.handleBotIdChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleBotIdChange(event) {
    this.setState({botId: event.target.value});
  }

  handleSubmit(event) {
    event.preventDefault();
    const file = this.fileInput.current.files[0]
    const form = new FormData()
    form.append('botId', this.state.botId)
    form.append('file', file)
    this.props.bp.axios.post('/import', form, this.axiosConfig)
  }

  render() {
    return (
      <main>
        <h1>Sheet2Bot</h1>
        <section>
          <p>ExcelファイルをインポートしてBotを作成できます。</p>
          <form onSubmit={this.handleSubmit}>
            <p>
              BotId: <input type="text" value={this.state.botId} onChange={this.handleBotIdChange}/>
            </p>
            <p>
              <label>BotSheet: <input type="file" ref={this.fileInput}/> </label>
            </p>
            <p>
              <button type="submit">インポート</button>
            </p>
          </form>
        </section>
      </main>
    );
  }
}
