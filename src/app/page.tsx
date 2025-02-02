'use client';

import { v4 as uuidv4 } from 'uuid';
import { sayUserNameInvocation, askUserNameInvocation } from '@/lib/actions';

// Include a thread_id to support multiple conversation threads with a single application, a common requirement when your application has multiple users.
const user1Config = { thread_id: uuidv4() };
const user2Config = { thread_id: uuidv4() };

export default function Home() {
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-300 p-6 space-x-4">
      <button
        onClick={handleFirstClick}
        className="px-6 py-3 bg-blue-500 text-white rounded shadow-lg hover:bg-blue-600 transition duration-300"
      >
        Set User 1 Name
      </button>
      <button
        onClick={handleSecondClick}
        className="px-6 py-3 bg-blue-500 text-white rounded shadow-lg hover:bg-blue-600 transition duration-300"
      >
        Get User 1 Name
      </button>
      <button
        onClick={handleThirdClick}
        className="px-6 py-3 bg-green-500 text-white rounded shadow-lg hover:bg-green-600 transition duration-300"
      >
        Get User 2 Name
      </button>
    </div>
  );
}
