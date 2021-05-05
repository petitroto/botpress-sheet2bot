  const axios = require('axios')

  /**
   * 指定した文字列を質問に含むQnAを検索してドロップダウンで提示する
   * @title QnA検索結果からの選択肢表示
   * @category ChatbotToday
   * @author NAKAMURA Masayuki
   * @param {string} [question={{event.nlu.entities.0.data.value}}] - 質問文の検索文字列（デフォルトはエンティティ）
   * @param {string} [text=以下の選択肢に、ご質問に近いものがあればお選びいただけますか。もし無ければ、別の言い方でご質問ください。] - 問いかけ文
   * @param {string} [placeholder=選択してください] - ドロップダウンのプレースホルダー
   * @param {string} [other=選択肢の中に該当する質問がない] - 該当する質問がない場合の選択肢
   * @param {string} [typing=yes] - タイピング演出の有無
   */
  const replyQnaChoices = async (question, text, placeholder, other, typing) => {
    // QnAモジュールのREST APIを使って、questionを含むQnAを抽出する
    const path = `/mod/qna/questions`
    const axiosConfig = await bp.http.getAxiosConfigForBot(event.botId)
    const { data } = await axios.get(path, {
      ...axiosConfig,
      params: { question }
    })
    const questions = data.items.map(item => item.data.questions.ja[0])

    // 見つかったQnAの数を temp.count_qnas_found に格納する（ゼロだったらここで終了）
    temp.count_qnas_found = questions.length
    if (temp.count_qnas_found === 0) return

    // QnAの検索結果からSingleChoice型のコンテント要素を作る
    const choices = [...questions, other].map(q => {
      return { title: q, value: q }
    })
    const contentElement = {
      text,
      choices,
      typing: typing === 'yes',
      isDropdown: true,
      dropdownPlaceholder: placeholder
    }

    // イベントにして送信
    const eventDestination = {
      channel: event.channel,
      target: event.target,
      botId: event.botId,
      threadId: event.threadId
    }
    const payloads = await bp.cms.renderElement('builtin_single-choice', contentElement, eventDestination)
    await bp.events.replyToEvent(event, payloads)
  }

  return replyQnaChoices(args.question, args.text, args.placeholder, args.other, args.typing)