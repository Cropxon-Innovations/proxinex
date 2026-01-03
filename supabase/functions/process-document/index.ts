const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessDocumentRequest {
  fileUrl: string;
  fileName: string;
  fileType: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileUrl, fileName, fileType } = await req.json() as ProcessDocumentRequest;

    if (!fileUrl) {
      return new Response(
        JSON.stringify({ success: false, error: "File URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing document: ${fileName} (${fileType})`);

    // Get API key for Proxinex AI (powered by Lovable AI gateway)
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      console.error("API key not configured");
      return new Response(
        JSON.stringify({ success: false, error: "AI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the file content
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error(`Failed to fetch file: ${fileResponse.status}`);
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const base64Content = btoa(
      new Uint8Array(fileBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );

    // Determine MIME type
    let mimeType = "application/octet-stream";
    const ext = fileName.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      gif: "image/gif",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",
      csv: "text/csv",
    };
    if (ext && mimeTypes[ext]) {
      mimeType = mimeTypes[ext];
    }

    // Use Proxinex AI (Gemini) for document understanding with OCR
    const geminiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Analyze this document thoroughly. Perform OCR if it's an image or scanned document.

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "A concise 2-3 sentence summary of the document content",
  "keyPoints": ["Main point 1", "Main point 2", ...up to 5 key points],
  "extractedText": "If this is an image with text, extract ALL visible text using OCR",
  "documentType": "Type of document (invoice, report, letter, form, contract, etc.)",
  "entities": {
    "names": ["Any names of people or organizations"],
    "dates": ["Any dates found"],
    "amounts": ["Any monetary amounts or quantities"],
    "locations": ["Any locations or addresses"],
    "contacts": ["Any email addresses, phone numbers, etc."]
  },
  "language": "Primary language of the document",
  "sentiment": "Overall tone (neutral, formal, informal, urgent, etc.)",
  "actionItems": ["Any action items or tasks mentioned"]
}

IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks.`
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${mimeType};base64,${base64Content}`
                  }
                }
              ]
            }
          ],
          max_tokens: 4096,
          temperature: 0.2,
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error("AI API error:", errorData);
      
      if (geminiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (geminiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(errorData.error?.message || "Failed to process document with AI");
    }

    const geminiData = await geminiResponse.json();
    const content = geminiData.choices?.[0]?.message?.content || "";

    // Try to parse as JSON, fallback to raw content
    let analysis;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : content;
      analysis = JSON.parse(jsonContent.trim());
    } catch {
      // If parsing fails, structure the raw content
      analysis = {
        summary: content.slice(0, 500),
        keyPoints: [],
        extractedText: content,
        documentType: "document",
        entities: {
          names: [],
          dates: [],
          amounts: [],
          locations: [],
          contacts: []
        },
        language: "unknown",
        sentiment: "neutral",
        actionItems: []
      };
    }

    console.log(`Document processed successfully: ${fileName}`);

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
        fileName,
        fileType: mimeType,
        processedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to process document",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
