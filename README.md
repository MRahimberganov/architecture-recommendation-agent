# 🚀 Architecture Recommendation Agent

An AI-powered application that generates cloud architecture recommendations, visual diagrams, and Terraform infrastructure based on user requirements.

🔗 Live Demo: https://architecture-recommendation-agent.vercel.app/

---

## 🧠 Overview

This tool acts as an **AI Cloud Architect**, helping engineers quickly design scalable AWS solutions.

Users provide high-level requirements, and the agent:
- Analyzes the input
- Recommends an architecture
- Generates a system diagram
- Produces Terraform starter code
- Allows exporting infrastructure as a downloadable ZIP

---

## ✨ Features

- 🤖 AI-powered architecture recommendations (with fallback logic)
- 🏗️ AWS architecture generation (ECS, ALB, RDS, etc.)
- 📊 Mermaid diagram visualization
- 📦 Terraform code generation:
  - `provider.tf`
  - `main.tf`
  - `variables.tf`
  - `outputs.tf`
- ⬇️ Downloadable Terraform package (.zip)
- ⚡ Fast UI with real-time results

---

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), TypeScript, TailwindCSS  
- **Backend**: Next.js API Routes  
- **AI Integration**: Anthropic API (Claude)  
- **Deployment**: Vercel  

---

## ⚙️ Getting Started

1. Clone the repository
```bash
git clone https://github.com/MRahimberganov/architecture-recommendation-agent.git
cd architecture-recommendation-agent

2. Install dependencies
npm install

3. Add environment variables
Create a .env.local file:
ANTHROPIC_API_KEY=your_api_key_here

4. Run locally
npm run dev

App will be available at:
http://localhost:3000

