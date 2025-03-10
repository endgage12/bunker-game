import axios from 'axios'

export const useChatGpt = () => {
  const sendMessage = async () => {
    const res = await axios.post('https://krolpluskrosh.online/chatgpt/send-message', {
      promptText: 'test',
      promptHistory: [],
    })
    console.log(res)
  }

  return { sendMessage }
}
