# Contributing to Silicon Soap

Thank you for your interest in contributing to Silicon Soap! 🎭 We welcome contributions from everyone. This document provides guidelines and information about contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Submitting Changes](#submitting-changes)
- [Reporting Issues](#reporting-issues)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

This project follows a code of conduct to ensure a welcoming environment for all contributors. By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A Supabase account (for local development)
- An OpenRouter API key (for AI features)

### Quick Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/siliconsoap.git
cd siliconsoap

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- 🐛 **Bug fixes** - Fix existing issues
- ✨ **New features** - Add new functionality
- 📚 **Documentation** - Improve docs, README, etc.
- 🎨 **UI/UX improvements** - Enhance user experience
- 🧪 **Testing** - Add or improve tests
- 🌍 **Internationalization** - Add translations
- 🔧 **Tooling** - Improve development workflow

### Finding Issues to Work On

1. Check the [Issues](https://github.com/yourusername/siliconsoap/issues) tab
2. Look for issues labeled `good first issue` or `help wanted`
3. Comment on an issue to express interest before starting work
4. Create your own issue if you have a suggestion

## Development Setup

### Environment Configuration

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

For the Supabase edge functions, you'll need to set:
- `OPENROUTER_API_KEY` in your Supabase project secrets

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

### Development Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run linting: `npm run lint`
4. Test your changes thoroughly
5. Commit with clear messages: `git commit -m "Add feature: description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── labs/           # Agent configuration components
├── pages/
│   └── agents-meetup/  # Main application views
├── hooks/              # Custom React hooks
├── services/           # Business logic & API calls
├── repositories/       # Data access layer
├── utils/              # Helper functions
└── models/             # TypeScript type definitions

supabase/
└── functions/          # Edge functions for AI calls
```

### Key Concepts

- **Agents**: AI models with different personalities
- **Conversations**: Multi-agent debates between 2-4 agents
- **Judge Bot**: AI-powered conversation analyzer
- **Credit System**: Token-based billing for logged-in users

## Submitting Changes

### Pull Request Process

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding standards** outlined below
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request** with a clear description

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] No breaking changes

## Screenshots (if applicable)
Add screenshots to show visual changes

## Additional Notes
Any additional context or considerations
```

### Commit Message Guidelines

Use clear, descriptive commit messages:

```
feat: add new agent personality system
fix: resolve conversation loading issue
docs: update installation instructions
refactor: simplify credit calculation logic
```

## Reporting Issues

### Bug Reports

When reporting bugs, please include:

- **Clear title** describing the issue
- **Steps to reproduce** the problem
- **Expected behavior** vs actual behavior
- **Browser/OS information**
- **Screenshots** if applicable
- **Error messages** from console

### Feature Requests

For new features, please include:

- **Clear description** of the proposed feature
- **Use case** - why is this needed?
- **Implementation ideas** if you have any
- **Mockups or examples** if applicable

## Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper interfaces
- Keep functions small and focused
- Use meaningful variable and function names

### React

- Use functional components with hooks
- Follow the existing component patterns
- Use proper TypeScript interfaces for props
- Keep components small and reusable

### CSS/Styling

- Use Tailwind CSS classes
- Follow the existing design system
- Maintain consistent spacing and colors
- Test responsive design

### Code Quality

- Run `npm run lint` before committing
- Fix all ESLint warnings and errors
- Write clear, readable code
- Add comments for complex logic

## Recognition

Contributors will be recognized in:
- The repository's contributor list
- Release notes for significant contributions
- Special mentions in documentation

## Questions?

If you have questions about contributing:
- Check existing issues and discussions
- Open a discussion in the repository
- Reach out to maintainers

Thank you for contributing to Silicon Soap! 🚀
