🚀 Architecture Recommendation Agent

An AI-powered application that generates AWS architecture recommendations, interactive diagrams, and Terraform infrastructure based on high-level user requirements.

🔗 Live Demo: https://architecture-recommendation-agent.vercel.app/

🧠 Overview

This tool acts as an AI Cloud Architect, helping engineers quickly move from idea → architecture.

Users provide:

project details
industry
compliance requirements
workload description

The agent then:

analyzes the input
selects the most appropriate architecture pattern
generates a visual diagram
produces Terraform starter code

✨ Features
🤖 Fortellar AI-powered recommendations (Azure OpenAI integration)
🏗️ Dynamic AWS architecture selection
ECS + ALB (web apps)
API Gateway + Lambda (serverless)
S3 + CloudFront (static sites)
📊 Interactive Mermaid diagrams
Simple (executive view)
Detailed (engineering view)
⚖️ Tradeoffs & reasoning included
💰 Cost estimation
📦 Terraform code generation
provider.tf
main.tf
variables.tf
outputs.tf
⬇️ Downloadable Terraform package (.zip)
🛡️ Fallback mode (mock/demo when AI unavailable)
⚡ Fast, responsive UI with real-time results

🧠 How It Works
User submits architecture requirements
Backend sends structured prompt to Azure OpenAI
AI returns strict JSON response
Response is:
validated
parsed
rendered in UI
If AI fails → fallback architecture is returned

🛠️ Tech Stack
Frontend: Next.js (App Router), TypeScript, TailwindCSS
Backend: Next.js API Routes
AI Integration: Azure OpenAI (gpt-4o-mini deployment)
Diagrams: Mermaid.js
Deployment: Vercel

⚙️ Getting Started
1. Clone the repository
git clone https://github.com/MRahimberganov/architecture-recommendation-agent.git
cd architecture-recommendation-agent
2. Install dependencies
npm install
3. Add environment variables

Create a .env.local file:

OPENAI_API_KEY=your_azure_openai_key_here
MOCK_ARCHITECTURE_AGENT=false

Note: This project uses Azure OpenAI endpoints while keeping OPENAI_API_KEY as the environment variable name for consistency with other internal agents.
4. Run locally
npm run dev
App will be available at:
http://localhost:3000

🧪 Testing Scenarios

Try different inputs to see dynamic behavior:

🏥 Enterprise healthcare platform (HIPAA)
💡 Low-cost startup MVP
🌐 Static marketing website
⚡ Event-driven API system

Expected behavior:

Different architecture patterns
Different AWS services
Different diagrams and tradeoffs

🚀 Future Enhancements
Multi-environment output (dev / stage / prod)
Cost breakdown by service
Diagram export (PNG / SVG)
Terraform module structure improvements
Integration with CI/CD pipelines

🏁 Summary

This project demonstrates how AI can be used to:

accelerate solution design
standardize architecture decisions
provide engineers with a strong starting point

👉 Built as an internal-style platform tool: Fortellar AI

## 👤 Author

**Mahmud Rahimberganov**  
Senior Cloud Engineer  

🔗 GitHub: https://github.com/MRahimberganov

