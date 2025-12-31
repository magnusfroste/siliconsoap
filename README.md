# 🎭 SiliconSoap

**Where AI Debates Get Dramatic**

A multi-agent AI conversation platform where 2-4 AI models debate, collaborate, and discuss any topic with dramatic flair. Think of it as "tech meets soap opera" – different AI personalities clash and explore ideas together.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB.svg)](https://reactjs.org/)
[![Powered by Supabase](https://img.shields.io/badge/Powered%20by-Supabase-3ECF8E.svg)](https://supabase.com/)

🌐 **Live Demo:** [siliconsoap.com](https://siliconsoap.com)

---

## ✨ Features

- **Multi-Agent Debates** – 2-4 AI agents discuss any topic simultaneously
- **20+ AI Models** – Choose from Llama, DeepSeek, Qwen, Mistral, Gemini, and more
- **Custom Personas** – Assign personalities like "Devil's Advocate", "Philosopher", "Scientist"
- **Open-Weight Focus** – Highlighting transparent, open-weight AI models
- **Conversation Analysis** – AI-powered analysis of debate quality
- **Share Conversations** – Public sharing with unique URLs
- **Hall of Shame** – Curated collection of AI's most dramatic moments

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or bun
- Supabase account (for backend)
- OpenRouter API key (for AI models)

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/siliconsoap.git
cd siliconsoap

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

For the edge functions, you'll need to configure:
- `OPENROUTER_API_KEY` – For AI model access

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Tailwind CSS |
| UI Components | shadcn/ui, Radix UI |
| Backend | Supabase (PostgreSQL, Edge Functions) |
| AI Models | OpenRouter API |
| Hosting | Vercel / Lovable |

---

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # shadcn/ui components
│   └── labs/         # Agent configuration components
├── pages/
│   └── agents-meetup/ # Main app views and logic
├── hooks/            # Custom React hooks
├── services/         # Business logic & API calls
├── repositories/     # Data access layer
└── utils/            # Helper functions

supabase/
└── functions/        # Edge functions for AI calls
```

---

## 💰 Pricing Model

| Usage | Cost |
|-------|------|
| **Self-hosted** | Free (bring your own API keys) |
| **Cloud (siliconsoap.com)** | Free credits to start, then pay-per-use for AI model calls |

The code is **100% free and open source** under MIT license. You can run your own instance with your own OpenRouter API key at no cost (except API usage).

The hosted version at [siliconsoap.com](https://siliconsoap.com) provides convenience with managed infrastructure, but charges for AI model usage to cover API costs.

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

- 🐛 **Report bugs** – Open an issue describing the problem
- 💡 **Suggest features** – Share your ideas in discussions
- 🔧 **Submit PRs** – Fix bugs or add features
- 📖 **Improve docs** – Help make the README better
- 🌍 **Translate** – Help localize the app

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit with clear messages: `git commit -m "Add amazing feature"`
7. Push to your fork: `git push origin feature/amazing-feature`
8. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use semantic commit messages
- Keep components small and focused

---

## 🧪 Testing

SiliconSoap uses [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/) for testing.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

Current test coverage focuses on the most critical business logic:

- **Credit System** (23 tests) – Guest and logged-in user billing, race condition prevention
- **Agent Name Generator** (18 tests) – Deterministic soap opera name generation
- **Logger Utility** (3 tests) – Development-only logging

**Total: 44 tests passing** ✅

### Writing Tests

Tests are located in `__tests__` directories next to the code they test:

```
src/
├── services/
│   ├── creditsService.ts
│   └── __tests__/
│       └── creditsService.test.ts
└── utils/
    ├── logger.ts
    └── __tests__/
        └── logger.test.ts
```

Example test:

```typescript
import { describe, it, expect } from 'vitest';
import { creditsService } from '../creditsService';

describe('creditsService', () => {
  it('should allow conversation when credits > 0', () => {
    expect(creditsService.canStartConversation(5)).toBe(true);
  });
});
```

---

## 🎯 Philosophy

SiliconSoap is built around transparency and open-weight AI models. We believe:

- **Open models deserve a showcase** – Let people experience Llama, Mistral, Qwen side-by-side
- **AI should be accessible** – Free to explore, learn, and experiment
- **Transparency matters** – Open source code, open-weight models, open conversations

---

## 📜 License

This project is licensed under the **MIT License** – see below for details.

```
MIT License

Copyright (c) 2024 SiliconSoap

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) – AI model access
- [Supabase](https://supabase.com/) – Backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) – Beautiful UI components
- [Lovable](https://lovable.dev/) – Development platform
- All the open-weight AI model creators (Meta, Mistral, Alibaba, DeepSeek, Google)

---

## 📬 Contact

- **Website:** [siliconsoap.com](https://siliconsoap.com)
- **Twitter:** [@SiliconSoap](https://twitter.com/SiliconSoap)

---

<p align="center">
  <strong>Made with ❤️ for the open AI community</strong>
</p>
