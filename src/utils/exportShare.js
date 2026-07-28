import { jsPDF } from 'jspdf';
import LZString from 'lz-string';

/**
 * Export Flashcards deck to CSV file
 */
export function exportToCSV(studySet) {
  if (!studySet || !studySet.blocks) return;

  const flashcardBlock = studySet.blocks.find(b => b.type === 'flashcard_deck');
  if (!flashcardBlock || !flashcardBlock.items || flashcardBlock.items.length === 0) {
    alert("No flashcards found in this study set to export as CSV.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,Front,Back\n";
  flashcardBlock.items.forEach(card => {
    const cleanFront = `"${(card.front || '').replace(/"/g, '""')}"`;
    const cleanBack = `"${(card.back || '').replace(/"/g, '""')}"`;
    csvContent += `${cleanFront},${cleanBack}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const safeTitle = (studySet.topic || 'study-set').toLowerCase().replace(/[^\w]/g, '_');
  link.setAttribute("download", `${safeTitle}_flashcards.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export full study set to printable PDF using jsPDF
 */
export function exportToPDF(studySet) {
  if (!studySet) return;

  const doc = new jsPDF();
  let yPos = 20;

  // Title Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(40, 50, 90);
  doc.text(studySet.topic || "AI Study Material", 20, yPos);
  yPos += 10;

  // Concepts Subheader
  if (studySet.concepts && studySet.concepts.length > 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 110);
    doc.text(`Key Concepts: ${studySet.concepts.join(', ')}`, 20, yPos);
    yPos += 12;
  }

  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 220);
  doc.line(20, yPos, 190, yPos);
  yPos += 15;

  (studySet.blocks || []).forEach(block => {
    // Check if new page is needed
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 40, 70);
    doc.text(`• ${block.title || block.type.toUpperCase()}`, 20, yPos);
    yPos += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);

    if (block.type === 'flashcard_deck') {
      block.items.forEach((card, idx) => {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        doc.setFont("helvetica", "bold");
        doc.text(`Card ${idx + 1}: ${card.front}`, 25, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        const backLines = doc.splitTextToSize(`Ans: ${card.back}`, 160);
        doc.text(backLines, 28, yPos);
        yPos += backLines.length * 5 + 6;
      });
    } else if (block.type === 'mcq') {
      block.items.forEach((item, idx) => {
        if (yPos > 250) { doc.addPage(); yPos = 20; }
        doc.setFont("helvetica", "bold");
        doc.text(`Q${idx + 1}: ${item.question}`, 25, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        (item.options || []).forEach(opt => {
          doc.text(`- ${opt}`, 30, yPos);
          yPos += 5;
        });
        doc.setTextColor(20, 120, 60);
        doc.text(`Correct: ${item.answer}`, 30, yPos);
        yPos += 5;
        doc.setTextColor(100, 100, 100);
        doc.text(`Explanation: ${item.explanation}`, 30, yPos);
        doc.setTextColor(50, 50, 50);
        yPos += 8;
      });
    } else if (block.type === 'true_false') {
      block.items.forEach((item, idx) => {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        doc.setFont("helvetica", "bold");
        doc.text(`Q${idx + 1}: ${item.question}`, 25, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(20, 120, 60);
        doc.text(`Answer: ${item.answer ? 'True' : 'False'}`, 30, yPos);
        yPos += 5;
        doc.setTextColor(100, 100, 100);
        doc.text(`Explanation: ${item.explanation}`, 30, yPos);
        doc.setTextColor(50, 50, 50);
        yPos += 8;
      });
    } else if (block.type === 'fill_blank') {
      block.items.forEach((item, idx) => {
        if (yPos > 260) { doc.addPage(); yPos = 20; }
        doc.setFont("helvetica", "bold");
        doc.text(`Q${idx + 1}: ${item.question}`, 25, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(20, 120, 60);
        doc.text(`Answer: ${item.answer}`, 30, yPos);
        yPos += 5;
        doc.setTextColor(100, 100, 100);
        doc.text(`Explanation: ${item.explanation}`, 30, yPos);
        doc.setTextColor(50, 50, 50);
        yPos += 8;
      });
    }

    yPos += 6;
  });

  const safeTitle = (studySet.topic || 'study-set').toLowerCase().replace(/[^\w]/g, '_');
  doc.save(`${safeTitle}_study_guide.pdf`);
}

/**
 * Generate shareable URL with LZ-String compression
 */
export function getShareableURL(studySet) {
  try {
    const jsonStr = JSON.stringify(studySet);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?set=${compressed}`;
  } catch (err) {
    console.error("Failed to generate share URL:", err);
    return null;
  }
}

/**
 * Decode shared URL set param
 */
export function decodeShareableURL() {
  try {
    const params = new URLSearchParams(window.location.search);
    const setParam = params.get('set');
    if (!setParam) return null;

    const decompressed = LZString.decompressFromEncodedURIComponent(setParam);
    if (!decompressed) return null;

    return JSON.parse(decompressed);
  } catch (err) {
    console.error("Failed to decode share URL set:", err);
    return null;
  }
}

/**
 * Export Study Set as downloadable .json file
 */
export function downloadJSONFile(studySet) {
  const jsonStr = JSON.stringify(studySet, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTitle = (studySet.topic || 'study-set').toLowerCase().replace(/[^\w]/g, '_');
  a.download = `${safeTitle}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
