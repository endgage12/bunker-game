import { Controller, Get, Post, Body } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import OpenAI from 'openai';

const DEFAULT_MODEL = 'gpt-4o-mini';
const keyOpenAI = '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';
const openAI = new OpenAI({
  apiKey: keyOpenAI,
  dangerouslyAllowBrowser: true,
});

const types: object = {
  chat: (promptHistory: object[], promptText: string) => {
    return [...promptText, { role: 'user', content: promptHistory }];
  },
  image: (promptHistory: object[], promptText: string, imageURL: string) => {
    return [
      ...promptHistory,
      { role: 'user', type: 'text', text: promptText },
      { type: 'image_url', image_url: { url: imageURL } },
    ];
  },
};

@Controller('chatgpt')
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}

  @Post('/send-message')
  async sendMessage(
    @Body()
    body: {
      model: string;
      type?: string;
      promptText: string;
      promptHistory: object[];
    },
  ): Promise<string> {
    try {
      const {
        type = 'chat',
        promptText,
        promptHistory,
        model = DEFAULT_MODEL,
      } = body;

      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
      const messages = types[type](promptText, promptHistory);
      const completion = await openAI.chat.completions.create({
        model,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        messages,
      });

      return JSON.stringify(completion);
      // res.json(completion);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('Error in send message:', error.message);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return
      return error.message;
    }
  }
}
