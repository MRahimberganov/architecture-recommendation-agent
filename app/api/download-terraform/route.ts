import { NextResponse } from "next/server";
import JSZip from "jszip";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const terraform = body?.terraform;

    if (
      !terraform ||
      typeof terraform.providerTf !== "string" ||
      typeof terraform.variablesTf !== "string" ||
      typeof terraform.mainTf !== "string" ||
      typeof terraform.outputsTf !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid Terraform payload." },
        { status: 400 }
      );
    }

    const zip = new JSZip();

    zip.file("provider.tf", terraform.providerTf);
    zip.file("variables.tf", terraform.variablesTf);
    zip.file("main.tf", terraform.mainTf);
    zip.file("outputs.tf", terraform.outputsTf);

    const content = await zip.generateAsync({ type: "uint8array" });

    const safeContent = Uint8Array.from(content);
    const arrayBuffer = safeContent.buffer;

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="terraform.zip"',
      },
    });
  } catch (error) {
    console.error("Download Terraform API failed:", error);
    return NextResponse.json(
      { error: "Failed to generate Terraform zip." },
      { status: 500 }
    );
  }
}