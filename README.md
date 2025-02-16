## Description

This project uses Next.js with shadcn/ui for creating a chatbot application with Langchain. It was created following the tutorial in this article: [Langchain Chatbot Tutorial](https://js.langchain.com/docs/tutorials/chatbot). The project uses OpenAI as the chat model.

## Video Demonstration

Watch the video below to see an example usage of the app:

## Technologies Used

This project leverages the following technologies:

- **Next.js**: A React framework for server-side rendering and generating static websites.
- **shadcn/ui**: A component library for building user interfaces.
- **Langchain**: A framework for developing applications powered by language models.
- **OpenAI**: Used as the chat model for generating responses.
- **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **Vercel**: Hosting platform for deploying the application.

## Getting Started

First, create a `.env.local` file with your API keys by using `.env.local.template` as a template:

```bash
cp .env.local.template .env.local
```

Then, install the dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Contact

For any questions or feedback, please contact Juanjo Fernández at [juanjo.fernandez@haa.st](mailto:juanjo.fernandez@haa.st).
