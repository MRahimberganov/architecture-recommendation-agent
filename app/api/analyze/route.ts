import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type ArchitectureResponse = {
  summary: string;
  pattern: string;
  services: string[];
  costEstimate: string;
  reasoning: string;
  nextSteps: string[];
  tradeoffs: string[];
  diagram: string;
  terraform: {
    providerTf: string;
    variablesTf: string;
    mainTf: string;
    outputsTf: string;
  };
};

function cleanJsonResponse(text: string) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function buildFallbackResponse(body: {
  projectName?: string;
  industry?: string;
  compliance?: string;
  description?: string;
}): ArchitectureResponse {
  return {
    summary: `Architecture recommendation for ${body.projectName || "your project"} in the ${body.industry || "selected"} industry.`,
    pattern: "Containerized Web App (ECS + ALB + RDS)",
    services: [
      "CloudFront",
      "AWS WAF",
      "Application Load Balancer",
      "ECS Fargate",
      "RDS PostgreSQL",
      "S3",
      "KMS",
      "Secrets Manager",
      "CloudWatch",
      "GuardDuty",
      "AWS Backup",
    ],
    costEstimate: "$300-$500/month",
    reasoning: `This architecture is a strong fit for workloads that need security, scalability, and operational simplicity. It also aligns well with compliance needs such as ${body.compliance || "standard security controls"}.`,
    nextSteps: [
      "Define Terraform modules for core infrastructure",
      "Design VPC, subnets, and security group layout",
      "Deploy application services and database layer",
      "Implement monitoring, alerting, backup, and security controls",
    ],
    tradeoffs: [
      "Higher baseline cost than a serverless-only design",
      "More operational overhead than static hosting",
      "Better control for long-running services and custom runtimes",
    ],
    diagram: `graph TD
      U[Users] --> CF[CloudFront]
      CF --> ALB[Application Load Balancer]
      ALB --> ECS[ECS Fargate Service]
      ECS --> RDS[RDS PostgreSQL]
    
      WAF[AWS WAF] -. protects .-> CF
      ECS -. reads/writes .-> S3[S3 Bucket]
      ECS -. retrieves .-> SM[Secrets Manager]
      ECS -. logs/metrics .-> CW[CloudWatch]
      RDS --> BK[AWS Backup]
    `,
    terraform: {
      providerTf: `terraform {
      required_version = ">= 1.5.0"

      required_providers {
        aws = {
          source  = "hashicorp/aws"
          version = "~> 5.0"
        }
      }
    }

    provider "aws" {
      region = var.aws_region
    }
    `,
      variablesTf: `variable "aws_region" {
      description = "AWS region"
      type        = string
      default     = "us-east-1"
    }

    variable "project_name" {
      description = "Project name"
      type        = string
      default     = "architecture-agent-demo"
    }

    variable "db_name" {
      description = "Database name"
      type        = string
      default     = "appdb"
    }
    `,
      mainTf: `resource "aws_s3_bucket" "app_bucket" {
      bucket = "\${var.project_name}-app-bucket-demo"
    }

    resource "aws_db_instance" "postgres" {
      allocated_storage    = 20
      engine               = "postgres"
      engine_version       = "15"
      instance_class       = "db.t3.micro"
      db_name              = var.db_name
      username             = "postgresadmin"
      password             = "ReplaceMe123!"
      skip_final_snapshot  = true
    }

    resource "aws_ecs_cluster" "main" {
      name = "\${var.project_name}-cluster"
    }
    `,
      outputsTf: `output "ecs_cluster_name" {
      value = aws_ecs_cluster.main.name
    }

    output "s3_bucket_name" {
      value = aws_s3_bucket.app_bucket.bucket
    }

    output "db_instance_endpoint" {
      value = aws_db_instance.postgres.address
    }
    `,
    },
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { projectName, industry, compliance, description } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        source: "fallback",
        ...buildFallbackResponse(body),
      });
    }

    const prompt = `
    You are a senior AWS solutions architect helping Fortellar recommend cloud architectures.
    
    Analyze the project below and return ONLY valid JSON.
    
    Project Name: ${projectName || "Not provided"}
    Industry: ${industry || "Not provided"}
    Compliance Requirements: ${compliance || "Not provided"}
    Workload Description: ${description || "Not provided"}
    
    Return JSON in exactly this shape:
    {
      "summary": "string",
      "pattern": "string",
      "services": ["string", "string"],
      "costEstimate": "string",
      "reasoning": "string",
      "nextSteps": ["string", "string"],
      "tradeoffs": ["string", "string"],
      "diagram": "string",
      "terraform": {
        "providerTf": "string",
        "variablesTf": "string",
        "mainTf": "string",
        "outputsTf": "string"
      }
    }
    
    Rules:
    - Recommend practical AWS services only.
    - Prioritize security, scalability, reliability, and operational simplicity.
    - If compliance is mentioned, reflect that in the recommendation.
    - Keep nextSteps short and actionable.
    - "costEstimate" should be a simple rough monthly estimate like "$300-$500/month".
    - "diagram" must be valid Mermaid flowchart syntax using "graph TD".
    - Do not include markdown.
    - Do not include explanations outside the JSON.
    - "terraform" must contain valid starter Terraform.
    - Keep Terraform simple, readable, and modular.
    - Do not include markdown fences.
    
    Architecture selection rules:
    - First determine the most appropriate AWS architecture pattern based on the workload.
    - Use ECS Fargate + ALB for containerized web applications, customer portals, internal web platforms, and long-running services.
    - Use API Gateway + Lambda for lightweight APIs, serverless backends, webhook handlers, and event-driven applications.
    - Use S3 + CloudFront for static frontend sites.
    - Use RDS for relational workloads requiring structured queries, transactions, or strong relational consistency.
    - Use DynamoDB for key-value, high-scale, low-latency NoSQL workloads.
    - Use SQS and/or EventBridge when asynchronous decoupling or event-driven flows are appropriate.
    - Only include services that actually match the recommended pattern.
    - "tradeoffs" must contain 2-4 short, practical considerations about cost, complexity, scalability, or operations.
    
    Diagram rules:
    - The diagram must match the recommended architecture pattern.
    - Do NOT always use the same request flow.
    - If the workload is a web application, the main request path may be: Users -> CloudFront -> ALB -> ECS.
    - If the workload is serverless/API-driven, the main request path may be: Users -> API Gateway -> Lambda.
    - If the workload is a static frontend, the main request path may be: Users -> CloudFront -> S3.
    - In the Mermaid diagram, do NOT place AWS WAF as a direct traffic hop between CloudFront and ALB.
    - Represent AWS WAF as attached to CloudFront or ALB using a dotted connection when relevant.
    - Supporting services like S3, Secrets Manager, CloudWatch, SQS, EventBridge, and databases must be shown as side dependencies, not in the main request path unless they are truly part of the primary flow.
    - Use dotted arrows for supporting/service relationships.
    
    Terraform rules:
    - The Terraform starter must match the selected architecture pattern.
    - Do not generate ECS resources if the recommendation is serverless-only.
    - Do not generate Lambda resources if the recommendation is ECS-based unless clearly justified.
    - Keep Terraform realistic but starter-level, not production-complete.
    `;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1000,
      temperature: 0.2,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");

    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({
        source: "fallback",
        ...buildFallbackResponse(body),
      });
    }

    const rawText = textBlock.text;
    const cleanedText = cleanJsonResponse(rawText);

    let parsed: ArchitectureResponse;

    try {
      parsed = JSON.parse(cleanedText) as ArchitectureResponse;
    } catch {
      console.error("Raw Anthropic response:", rawText);
      return NextResponse.json({
        source: "fallback",
        ...buildFallbackResponse(body),
      });
    }

    if (
      typeof parsed.summary !== "string" ||
      typeof parsed.pattern !== "string" ||
      !Array.isArray(parsed.services) ||
      typeof parsed.costEstimate !== "string" ||
      typeof parsed.reasoning !== "string" ||
      !Array.isArray(parsed.nextSteps) ||
      !Array.isArray(parsed.tradeoffs) ||
      typeof parsed.diagram !== "string" ||
      typeof parsed.terraform !== "object" ||
      typeof parsed.terraform.providerTf !== "string" ||
      typeof parsed.terraform.variablesTf !== "string" ||
      typeof parsed.terraform.mainTf !== "string" ||
      typeof parsed.terraform.outputsTf !== "string"
    ) {
      return NextResponse.json({
        source: "fallback",
        ...buildFallbackResponse(body),
      });
    }

    return NextResponse.json({
      source: "ai",
      ...parsed,
    });
  } catch (error) {
    console.error("Analyze API failed:", error);
    return NextResponse.json({
      source: "fallback",
      ...buildFallbackResponse({
        projectName: "Fallback project",
        industry: "Healthcare",
        compliance: "HIPAA, SOC 2",
        description: "Fallback workload description",
      }),
    });
  }
}