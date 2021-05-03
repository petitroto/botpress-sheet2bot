import React from 'react'

export class AppView extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.fileInput = React.createRef();
    this.axiosConfig = {baseURL: '/api/v1/bots/___/mod/sheet2bot'}
  }

  handleSubmit(event) {
    event.preventDefault();
    const file = this.fileInput.current.files[0]
    const data = new FormData()
    data.append('file', file)
    this.props.bp.axios.post('/import', data, this.axiosConfig)
  }

  render() {
    return (
      <main>
        <h1>Sheet2Bot</h1>
        <section>
          <p>Excel形式のボット定義ファイルをアップロードしてください</p>
          <form onSubmit={this.handleSubmit}>
            <label>
              <input type="file" ref={this.fileInput}/>
            </label>
            <button type="submit">送信</button>
          </form>
        </section>
      </main>
    );
  }
}
