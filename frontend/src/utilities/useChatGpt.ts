import axios from 'axios'

export const useChatGpt = () => {
  const sendMessage = async () => {
    const res = await axios.post('http://5.35.103.104:3000/chatgpt/send-message', {
      promptText: 'test',
      promptHistory: [],
    })
    console.log(res)
  }

  return { sendMessage }
}
