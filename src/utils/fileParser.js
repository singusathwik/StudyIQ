import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure pdf.js worker URL for Vite environment
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
} catch (e) {
  console.warn("Could not load external worker CDN for PDF.js, using standard fallback", e);
}

/**
 * Extract text from user-uploaded PDF or DOCX file client-side.
 * Never throws uncaught error; always returns { success: true, text: string } or { success: false, error: string }.
 */
export async function parseFileContent(file) {
  if (!file) {
    return { success: false, error: "No file provided." };
  }

  const fileName = file.name.toLowerCase();

  try {
    if (fileName.endsWith('.pdf')) {
      return await parsePDF(file);
    } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
      return await parseDOCX(file);
    } else if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
      const text = await file.text();
      if (!text.trim()) {
        return { success: false, error: "The uploaded text file is empty." };
      }
      return { success: true, text };
    } else {
      return {
        success: false,
        error: `Unsupported file format "${file.name}". Please upload a PDF (.pdf) or Word document (.docx).`
      };
    }
  } catch (err) {
    console.error("File parsing error:", err);
    return {
      success: false,
      error: `Failed to read "${file.name}": ${err.message || 'Corrupted or unreadable file format.'}`
    };
  }
}

/**
 * Parse PDF file text using pdfjs-dist
 */
async function parsePDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageStrings = content.items.map(item => item.str);
      fullText += pageStrings.join(' ') + '\n';
    }

    const trimmedText = fullText.trim();
    if (!trimmedText || trimmedText.length < 10) {
      return {
        success: false,
        error: "This PDF contains no extractable text. It may be scanned images or password-protected."
      };
    }

    return { success: true, text: trimmedText, numPages };
  } catch (pdfErr) {
    console.error("PDF Parsing Exception:", pdfErr);
    return {
      success: false,
      error: "Unable to parse PDF file. The document may be corrupted, encrypted, or invalid."
    };
  }
}

/**
 * Parse DOCX file text using mammoth
 */
async function parseDOCX(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value ? result.value.trim() : '';

    if (!text || text.length < 5) {
      return {
        success: false,
        error: "This Word document (.docx) contains no extractable text content."
      };
    }

    return { success: true, text };
  } catch (docxErr) {
    console.error("DOCX Parsing Exception:", docxErr);
    return {
      success: false,
      error: "Unable to read DOCX file. Please make sure it is a valid Microsoft Word (.docx) document."
    };
  }
}
