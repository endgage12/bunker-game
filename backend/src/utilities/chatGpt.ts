import axios from 'axios';
import type { Disaster } from '../schemes/Disaster';

export interface Card {
  id: number;
  title: string;
  isRevealed: boolean;
  value: string;
}

const apiUrl = process.env.API_URL || 'https://krolpluskrosh.online/api';

export const sendMessage = async (
  promptText: string,
  {
    playersCards,
    disaster,
  }: {
    playersCards: Map<string, Card[]>;
    disaster: Disaster | null;
  },
) => {
  const serializedPlayersCards = Object.fromEntries(playersCards);

  const res = await axios.post(`${apiUrl}/chatgpt/send-message`, {
    promptText: `${promptText}; Карты: ${JSON.stringify(serializedPlayersCards)}, Катастрофа: ${JSON.stringify(disaster)}`,
    promptHistory: [],
  });

  return res?.data?.choices[0].message.content;
};
