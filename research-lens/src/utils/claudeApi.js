const SYSTEM_PREFIX = `You are analyzing a single research document. Do not reference or assume anything about other documents the user may have uploaded. Treat this document as fully standalone.`;

async function callClaude(apiKey, systemPrompt, userPrompt, model = 'claude-sonnet-4-20250514') {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

function parseConfidence(text) {
  const jsonMatch = text.match(/\{[\s\S]*"confidence_score"[\s\S]*\}/);
  if (!jsonMatch) return { score: null, reason: 'Confidence not reported' };
  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      score: parsed.confidence_score ?? null,
      reason: parsed.confidence_reason ?? 'No reason given',
    };
  } catch {
    return { score: null, reason: 'Could not parse confidence' };
  }
}

function stripJsonBlock(text) {
  return text.replace(/\{[\s\S]*"confidence_score"[\s\S]*\}/, '').trim();
}

export async function generateQuickSummary(apiKey, docText, docName) {
  const system = `${SYSTEM_PREFIX}\n\nYour task is to generate a one-sentence summary (max 20 words) of a research document, and auto-detect its document type. End your response with exactly this JSON block: {"confidence_score": <0-100>, "confidence_reason": "<one line>"}`;
  const user = `Document: "${docName}"\n\nContent (first 3000 chars):\n${docText.slice(0, 3000)}\n\nReturn:\n1. ONE_LINE_SUMMARY: (one sentence, max 20 words)\n2. DOC_TYPE: one of: RCT | Survey | Policy Brief | Case Study | Mixed Methods | Unknown\n\nThen the confidence JSON block.`;

  const raw = await callClaude(apiKey, system, user);
  const confidence = parseConfidence(raw);
  const clean = stripJsonBlock(raw);

  const summaryMatch = clean.match(/ONE_LINE_SUMMARY:\s*(.+)/i);
  const typeMatch = clean.match(/DOC_TYPE:\s*(.+)/i);

  return {
    summary: summaryMatch ? summaryMatch[1].trim() : 'Summary not available',
    docType: typeMatch ? typeMatch[1].trim() : 'Unknown',
    confidence,
  };
}

export async function generateSummaryTab(apiKey, docText, docName) {
  const system = `${SYSTEM_PREFIX}\n\nYou are an M&E research analyst. Generate a structured summary of the document. Be factual, concise, and cite what is present in the document. End your response with exactly this JSON block: {"confidence_score": <0-100>, "confidence_reason": "<one line>"}`;
  const user = `Document: "${docName}"\n\nFull content:\n${docText}\n\nProvide the following in plain English:\n\nEXECUTIVE_SUMMARY:\n- [5-7 bullet points, plain language]\n\nKEY_FINDINGS:\n- [ranked by evidence strength, label strength: High/Medium/Low]\n\nMETADATA:\n- Study type:\n- Sample size (if mentioned):\n- Geography (if mentioned):\n- Time period (if mentioned):\n\nThen the confidence JSON block.`;

  const raw = await callClaude(apiKey, system, user);
  const confidence = parseConfidence(raw);
  return { raw: stripJsonBlock(raw), confidence };
}

export async function generateDeepDive(apiKey, docText, docName) {
  const system = `${SYSTEM_PREFIX}\n\nYou are an M&E research analyst. Perform a deep methodological analysis. For each extracted data point, note your confidence. End your response with exactly this JSON block: {"confidence_score": <0-100>, "confidence_reason": "<one line>"}`;
  const user = `Document: "${docName}"\n\nFull content:\n${docText}\n\nProvide:\n\nMETHODOLOGY:\n[Describe the research methodology used]\n\nLIMITATIONS:\n- [List limitations acknowledged or inferred]\n\nDATA_QUALITY:\n[Assess data quality indicators: sample size, controls, bias risk, etc.]\n\nKEY_METRICS:\n- [metric name]: [value] — Confidence: High/Medium/Low\n- [repeat for each key metric found]\n\nThen the confidence JSON block.`;

  const raw = await callClaude(apiKey, system, user);
  const confidence = parseConfidence(raw);
  return { raw: stripJsonBlock(raw), confidence };
}

export async function generateMELens(apiKey, docText, docName) {
  const system = `${SYSTEM_PREFIX}\n\nYou are an M&E specialist with expertise in results frameworks, theories of change, and indicator classification. Analyze this document through an M&E lens only. End your response with exactly this JSON block: {"confidence_score": <0-100>, "confidence_reason": "<one line>"}`;
  const user = `Document: "${docName}"\n\nFull content:\n${docText}\n\nProvide:\n\nTHEORY_OF_CHANGE:\n[Describe the ToC if present, or infer it from the document. Note if inferred.]\n\nINDICATORS:\n- Input: [list if found, or "None identified"]\n- Output: [list if found, or "None identified"]\n- Outcome: [list if found, or "None identified"]\n- Impact: [list if found, or "None identified"]\n\nEVIDENCE_GAPS:\n- [List gaps in evidence or areas not addressed]\n\nME_RELEVANCE:\nRating: High | Medium | Low\nReason: [one sentence]\n\nThen the confidence JSON block.`;

  const raw = await callClaude(apiKey, system, user);
  const confidence = parseConfidence(raw);
  return { raw: stripJsonBlock(raw), confidence };
}

export async function askThisPaper(apiKey, docText, docName, question, chatHistory) {
  const system = `${SYSTEM_PREFIX}\n\nYou are answering questions about a single research document. Answer ONLY based on what is in this document. If the answer is not in the document, say clearly: "This information is not found in the document." Do not speculate or use outside knowledge. Always cite the relevant section when you answer. End your response with exactly this JSON block: {"confidence_score": <0-100>, "confidence_reason": "<one line>"}`;

  const historyMessages = chatHistory.flatMap(turn => [
    { role: 'user', content: turn.question },
    { role: 'assistant', content: turn.answer },
  ]);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: `${system}\n\nDocument: "${docName}"\n\nFull document content:\n${docText}`,
      messages: [
        ...historyMessages,
        { role: 'user', content: question },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const raw = data.content[0].text;
  const confidence = parseConfidence(raw);
  return { answer: stripJsonBlock(raw), confidence };
}
