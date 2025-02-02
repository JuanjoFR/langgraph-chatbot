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
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  trimMessages
} from '@langchain/core/messages';

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
    'You talk like a pirate. Answer all questions to the best of your ability.'
  ],
  ['placeholder', '{messages}']
]);
const promptTemplate2 = ChatPromptTemplate.fromMessages([
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

const messages = [
  new SystemMessage("you're a good assistant"),
  new HumanMessage("hi! I'm bob"),
  new AIMessage('hi!'),
  new HumanMessage('I like vanilla ice cream'),
  new AIMessage('nice'),
  new HumanMessage('whats 2 + 2'),
  new AIMessage('4'),
  new HumanMessage('thanks'),
  new AIMessage('no problem!'),
  new HumanMessage('having fun?'),
  new AIMessage('yes!')
];

// Define the State
const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  language: Annotation<string>()
});

// Define the function that calls the model
const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await llm.invoke(state.messages);
  return { messages: response };
};
const callModel2 = async (state: typeof MessagesAnnotation.State) => {
  const prompt = await promptTemplate.invoke(state);
  const response = await llm.invoke(prompt);
  // Update message history with response:
  return { messages: [response] };
};
const callModel3 = async (state: typeof GraphAnnotation.State) => {
  const prompt = await promptTemplate2.invoke(state);
  const response = await llm.invoke(prompt);
  return { messages: [response] };
};
const callModel4 = async (state: typeof GraphAnnotation.State) => {
  const trimmedMessage = await trimmer.invoke(state.messages);
  const prompt = await promptTemplate2.invoke({
    messages: trimmedMessage,
    language: state.language
  });
  const response = await llm.invoke(prompt);
  return { messages: [response] };
};

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  // Define the node and edge
  .addNode('model', callModel)
  .addEdge(START, 'model')
  .addEdge('model', END);
const workflow2 = new StateGraph(MessagesAnnotation)
  // Define the (single) node in the graph
  .addNode('model', callModel2)
  .addEdge(START, 'model')
  .addEdge('model', END);
const workflow3 = new StateGraph(GraphAnnotation)
  .addNode('model', callModel3)
  .addEdge(START, 'model')
  .addEdge('model', END);
const workflow4 = new StateGraph(GraphAnnotation)
  .addNode('model', callModel4)
  .addEdge(START, 'model')
  .addEdge('model', END);

// Add memory
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });
const app2 = workflow2.compile({ checkpointer: new MemorySaver() });
const app3 = workflow3.compile({ checkpointer: new MemorySaver() });
const app4 = workflow4.compile({ checkpointer: new MemorySaver() });

export async function sayUserNameInvocation(config: Config) {
  const options = { configurable: config };
  // const input = {
  //   messages: [
  //     {
  //       role: 'user',
  //       content: 'Hi im bob'
  //     }
  //   ],
  //   language: 'Spanish'
  // };
  const input = {
    messages: [...messages, new HumanMessage('What is my name?')],
    language: 'English'
  };
  const output = await app4.invoke(input, options);
  // The output contains all messages in the state.
  // This will long the last message in the conversation.
  console.log(output.messages[output.messages.length - 1]);

  return 'First invocation completed';
}

export async function askUserNameInvocation(config: Config) {
  const options = { configurable: config };
  // const input2 = {
  //   messages: [
  //     {
  //       role: 'user',
  //       content: "What's my name?"
  //     }
  //   ]
  //   // language: 'Spanish'
  // };
  const input2 = {
    messages: [...messages, new HumanMessage('What math problem did I ask?')],
    language: 'English'
  };
  const output2 = await app4.invoke(input2, options);

  console.log(output2.messages[output2.messages.length - 1]);

  return 'Second invocation completed';
}
