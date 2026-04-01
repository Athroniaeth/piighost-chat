# OnyxChat - Modern AI Chat Interface

A fully responsive, modern AI Chat web application template built with React, Vite, Tailwind CSS, and TailGrids. This project provides a robust UI for conversational AI platforms, featuring a sleek sidebar, chat history, settings management, and interactive modals.

## 🚀 Features

- **Interactive Chat Interface**: Dynamic message streams mimicking AI interactions with "thinking" indicators.
- **Conversation Management**: Create, rename, edit, and delete chats and individual messages.
- **Projects Organization**: Group related conversations under specific projects.
- **Search Capabilities**: Built-in search modal to quickly find past conversations.
- **Settings Dashboard**: Comprehensive settings modal covering Account, Preferences, Plans, and Resources.
- **Responsive Design**: Fully mobile-optimized with intuitive drawer menus and dynamic layouts.
- **Modern UI Components**: Utilizing TailGrids and React Aria Components for accessible, polished interfaces.
- **Smooth Animations**: Transitions powered by Framer Motion.

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Toolkit**: [TailGrids](https://tailgrids.com/) & [@tailwindcss/forms](https://github.com/tailwindlabs/tailwindcss-forms)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [@tailgrids/icons](https://tailgrids.com/icons)
- **Accessibility**: [React Aria Components](https://react-spectrum.adobe.com/react-aria/)

## 📦 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) and `npm` installed.

### Installation

1. Navigate to the project directory:
   ```bash
   cd AIChat
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗 Project Structure

- `src/components/`: Reusable UI elements including specific Modals (Search, Rename, Delete, Settings) and Screens (PromptBox, Conversation).
- `src/layouts/`: Global layout components such as the responsive Sidebar.
- `src/pages/`: Main views. `Home.tsx` contains the core orchestration of the chat experience.
- `src/utils/`: Utility functions and context providers (e.g., ThemeProvider).

## 📜 Scripts

- `npm run dev` - Starts the development server.
- `npm run build` - Compiles TypeScript and builds the app for production.
- `npm run preview` - Locally preview the production build.
- `npm run lint` - Runs ESLint to identify code formatting and style issues.

## 📝 License

This project is licensed under the MIT License.
