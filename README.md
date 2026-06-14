# Wear The Originals

E-commerce platform for premium leather products. Built with Next.js and Supabase.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Deployment:** Vercel + Supabase Cloud

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in Supabase credentials
4. Run the development server: `npm run dev`

## Commit Conventions

| Prefix     | Usage                                    |
| ---------- | ---------------------------------------- |
| `feat`     | New feature                              |
| `fix`      | Bug fix                                  |
| `refactor` | Code restructure without behavior change |
| `chore`    | Config, deps, tooling                    |
| `style`    | UI/styling changes                       |
| `docs`     | Documentation updates                    |

**Format:** `feat(scope): short description`
**Example:** `feat(products): add product listing API`

## Branch Strategy

- `main` — stable, production-ready code
- `feat/<name>` — feature development
- `fix/<name>` — bug fixes

All changes merged to `main` via pull request.
