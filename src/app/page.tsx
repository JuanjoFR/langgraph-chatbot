'use client';

import { v4 as uuidv4 } from 'uuid';
import { sayUserNameInvocation, askUserNameInvocation } from '@/lib/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as React from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  data?: {
    user: string;
  };
}

// Include a thread_id to support multiple conversation threads with a single application, a common requirement when your application has multiple users.
const user1Config = { thread_id: uuidv4() };
const user2Config = { thread_id: uuidv4() };

const formSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  user: z.string().min(1, 'Please select a user')
});

type FormValues = z.infer<typeof formSchema>;

const simulateResponse = (message: string) => {
  return `Response to: "${message}"`;
};

export default function Home() {
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      user: 'User 1'
    }
  });

  const handleFirstClick = async () => {
    const result = await sayUserNameInvocation({
      ...user1Config,
      userName: 'User1'
    });
    console.log(result);
  };

  const handleSecondClick = async () => {
    const result = await askUserNameInvocation(user1Config);
    console.log(result);
  };

  const handleThirdClick = async () => {
    const result = await askUserNameInvocation(user2Config);
    console.log(result);
  };

  function clearMessages() {
    setChatMessages([]);
  }

  function handleUserChange(value: string) {
    form.setValue('user', value);
    clearMessages();
  }

  function addMessage(
    content: string,
    role: 'user' | 'assistant',
    userData?: { user: string }
  ) {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      role,
      ...(userData && { data: userData })
    };
    setChatMessages((prev) => [...prev, newMessage]);
  }

  async function simulateAssistantResponse(userMessage: string) {
    setIsTyping(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const response = simulateResponse(userMessage);
    addMessage(response, 'assistant');
    setIsTyping(false);
  }

  async function onSubmit(data: FormValues) {
    if (data.message.trim()) {
      // Add user message
      addMessage(data.message, 'user', { user: data.user });

      // Simulate assistant response
      simulateAssistantResponse(data.message);

      // Reset form
      form.reset({ user: data.user, message: '' });
    }
  }

  return (
    // <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 p-6 space-x-4">
    //   <button
    //     onClick={handleFirstClick}
    //     className="px-6 py-3 bg-blue-500 text-white rounded shadow-lg hover:bg-blue-600 transition duration-300"
    //   >
    //     Set User 1 Name
    //   </button>
    //   <button
    //     onClick={handleSecondClick}
    //     className="px-6 py-3 bg-blue-500 text-white rounded shadow-lg hover:bg-blue-600 transition duration-300"
    //   >
    //     Get User 1 Name
    //   </button>
    //   <button
    //     onClick={handleThirdClick}
    //     className="px-6 py-3 bg-green-500 text-white rounded shadow-lg hover:bg-green-600 transition duration-300"
    //   >
    //     Get User 2 Name
    //   </button>
    // </div>
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">LangChain Chatbot</h1>

      <Select onValueChange={handleUserChange} value={form.watch('user')}>
        <SelectTrigger className="w-[180px] mb-4">
          <SelectValue placeholder="Select user" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="User 1">User 1</SelectItem>
          <SelectItem value="User 2">User 2</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1 overflow-y-auto mb-4 border rounded-md p-4">
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 p-2 rounded ${
              message.role === 'user'
                ? 'bg-primary/10 ml-auto max-w-[80%]'
                : 'bg-muted mr-auto max-w-[80%]'
            }`}
          >
            {message.role === 'user' && (
              <div className="text-sm text-muted-foreground mb-1">
                {message.data?.user}
              </div>
            )}
            <div>{message.content}</div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Type your message..." {...field} />
                </FormControl>
                <FormMessage className="absolute mt-1" />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isTyping}>
            Send
          </Button>
        </form>
      </Form>
    </div>
  );
}
