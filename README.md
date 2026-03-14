# SwipeUp AI Academy

AI Literacy learning platform for business students at University of Law.

## Features

- **5 Courses**: From AI fundamentals to career development
- **Simulation-Based Learning**: Real business case with Velara fashion retailer
- **Progress Tracking**: Notion database integration
- **Sequential Unlocking**: Complete courses to unlock the next
- **Badge System**: Earn badges for completing modules

## Tech Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS 4
- Bun package manager
- Static Export for GitHub Pages

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build for production
bun run build
```

## Project Structure

```
SwipeUp-AI-Academy/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Welcome/Entry page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Academy dashboard
│   │   └── course2/
│   │       ├── page.tsx          # Course 2 entry
│   │       └── module1/
│   │           └── page.tsx      # Module 1 (Prepare, Engage, Complete)
│   ├── hooks/
│   │   └── useAcademyProgress.ts # State management
│   ├── lib/
│   │   ├── notion.ts             # Notion API
│   │   └── utils.ts              # Utilities
│   └── types/
│       └── academy.ts            # TypeScript types
├── public/
│   └── swipeup-logo.jpeg         # Logo (add manually)
└── .github/
    └── workflows/
        └── deploy.yml            # GitHub Actions deployment
```

## Deployment

This project is configured for GitHub Pages deployment via GitHub Actions.

### Required GitHub Secrets

Add these secrets in your repository settings (Settings → Secrets and variables → Actions):

- `NOTION_TOKEN` - Your Notion integration token
- `NOTION_DATABASE_ID` - Your Notion database ID

### Deployment Steps

1. Push code to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Enable GitHub Pages in repository settings (Settings → Pages → Source: GitHub Actions)

## Notion Database Properties

Your Notion database should have these properties:

- **Name** (title) - Student name
- **Student ID** (text) - University student ID
- **Event** (text) - Event type (e.g., "Academy Joined", "Module 1 Complete")
- **Details** (text) - Additional details
- **Total XP** (number) - Total XP earned
- **Date** (date) - Timestamp

## Branding

- Primary colour: #1B3A6B (dark navy blue)
- Accent colour: #E8A020 (gold)
- Font: System font stack

## License

© 2025 SwipeUp AI Society
