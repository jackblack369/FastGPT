import type { ChatMessageItemType } from '@fastgpt/global/core/ai/type.d';
import { getAIApi } from '../config';
import { countGptMessagesTokens } from '@fastgpt/global/common/string/tiktoken';

export const Prompt_QuestionGuide = `我不太清楚问你什么问题，请帮我生成 3 个问题，引导我继续提问。问题的长度应小于20个字符，按 JSON 格式返回: ["问题1", "问题2", "问题3"]`;

export async function createQuestionGuide({
  messages,
  model
}: {
  messages: ChatMessageItemType[];
  model: string;
}) {
  const concatMessages: ChatMessageItemType[] = [
    ...messages,
    {
      role: 'user',
      content: Prompt_QuestionGuide
    }
  ];
  const ai = getAIApi({
    timeout: 480000
  });
  const data = await ai.chat.completions.create({
    model: model,
    temperature: 0.1,
    max_tokens: 200,
    messages: concatMessages,
    stream: false
  });

  const answer = data.choices?.[0]?.message?.content || '';

  const start = answer.indexOf('[');
  const end = answer.lastIndexOf(']');

  const tokens = countGptMessagesTokens(concatMessages);

  if (start === -1 || end === -1) {
    return {
      result: [],
      tokens: 0
    };
  }

  const jsonStr = answer
    .substring(start, end + 1)
    .replace(/(\\n|\\)/g, '')
    .replace(/  /g, '');

  try {
    return {
      result: JSON.parse(jsonStr),
      tokens
    };
  } catch (error) {
    return {
      result: [],
      tokens: 0
    };
  }
}
