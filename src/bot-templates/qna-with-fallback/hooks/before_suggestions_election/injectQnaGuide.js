  const guideContents = [
    {
      type: 'typing',
      value: true
    },
    {
      type: 'text',
      text: 'FAQからお答えします。以下の内容でご回答になりますでしょうか。'
    }
  ]

  suggestions.forEach(suggestion => {
    if (suggestion.source === 'qna' && suggestion.decision.status === 'elected') {
      suggestion.payloads = [...guideContents, ...suggestion.payloads]
    }
  })