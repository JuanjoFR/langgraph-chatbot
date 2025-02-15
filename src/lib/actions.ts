'use server';

import { ChatOpenAI } from '@langchain/openai';
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
  Annotation
} from '@langchain/langgraph';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { HumanMessage, trimMessages } from '@langchain/core/messages';

interface Config {
  thread_id: string;
  userName?: string;
}

const llm = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    'system',
    'You are a helpful assistant. Answer all questions to the best of your ability in {language}.'
  ],
  ['placeholder', '{messages}']
]);

const trimmer = trimMessages({
  maxTokens: 10,
  strategy: 'last',
  tokenCounter: (msgs) => msgs.length,
  includeSystem: true,
  allowPartial: false,
  startOn: 'human'
});

// const messages = [
//   new SystemMessage("you're a good assistant")
// ];

// Define the State
const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  language: Annotation<string>()
});

// Define the function that calls the model
const callModel = async (state: typeof GraphAnnotation.State) => {
  const trimmedMessage = await trimmer.invoke(state.messages);
  const prompt = await promptTemplate.invoke({
    messages: trimmedMessage,
    language: state.language
  });
  const response = await llm.invoke(prompt);
  return { messages: [response] };
};

// Define a new graph
const workflow = new StateGraph(GraphAnnotation)
  .addNode('model', callModel)
  .addEdge(START, 'model')
  .addEdge('model', END);

// Add memory
const app = workflow.compile({ checkpointer: new MemorySaver() });

export async function invoke(config: Config, fields: string) {
  const options = { configurable: config };
  const input = {
    // messages: [...messages, new HumanMessage(fields)],
    messages: new HumanMessage(fields),
    language: 'English'
  };
  const output = await app.invoke(input, options);

  // The output contains all messages in the state.
  // This will long the last message in the conversation.
  return { message: output.messages[output.messages.length - 1].content };
}
