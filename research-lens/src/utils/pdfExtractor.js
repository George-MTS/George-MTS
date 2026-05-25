let pdfjsLib = null;

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
  pdfjsLib = pdfjs;
  return pdfjsLib;
}

export async function extractTextFromPDF(file) {
  const pdfjs = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText.trim();
}

export async function extractTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'pdf') {
    return extractTextFromPDF(file);
  }
  if (ext === 'txt') {
    return file.text();
  }
  if (ext === 'docx') {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } catch {
      return file.text();
    }
  }
  return file.text();
}

export function truncateForAPI(text, maxChars = 80000) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + '\n\n[Document truncated for analysis — first 80,000 characters shown]';
}
