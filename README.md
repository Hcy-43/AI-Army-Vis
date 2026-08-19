# AI Army Vis

**Live demo:** [ai-army-vis.vercel.app](https://ai-army-vis.vercel.app)

A dashboard for comparing **real human survey responses** against **LLM-simulated ("AI army") responses** on the 2024 Taiwan presidential election survey — did Lai Ching-te, Hou Yu-ih, or Ko Wen-je get your vote?

Given a respondent's demographic background, several LLMs (GPT-4, GPT-4o, Claude Haiku) are prompted to simulate that respondent's voting intuition. This project visualizes how closely those simulated "AI voters" track the real survey distribution.

## Features

- **Dashboard** — vote-share distribution and demographic breakdown charts, plus a full response table, switchable between the real survey and each LLM's simulated responses.
- **Live survey** — answer the demographic questionnaire yourself and get a real-time prediction from all three models.
- **Batch upload** — upload a JSON file of survey respondents and run predictions across GPT-4, GPT-4o, and Claude Haiku in one pass.

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router) + React 19 + TypeScript
- Tailwind CSS + [shadcn/ui](https://ui.shadcn.com) (Radix primitives)
- [Recharts](https://recharts.org) for visualization
- OpenAI SDK + Anthropic SDK for LLM predictions

## Project structure

```
app/
  page.tsx            # Dashboard
  survey/             # Live survey → real-time LLM prediction
  upload/             # Batch JSON upload → LLM predictions
  api/                # Prediction API routes (OpenAI / Anthropic)
lib/
  llm.ts              # LLM prompting logic
  data-store.ts        # Fetches pre-generated survey/prediction datasets
components/           # Charts, tables, settings panel (shadcn/ui-based)
public/data/          # Real survey data + pre-generated LLM predictions
```
