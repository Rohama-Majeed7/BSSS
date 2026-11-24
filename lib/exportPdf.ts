/**
 * High-fidelity Document Print & PDF Export Utility
 *
 * Utilizes the browser's native PDF rendering engine to generate crisp,
 * vector-grade PDF files and printouts with exact page margins and typography.
 */

export function printOrSavePdf(contentHtml: string, fileName: string) {
  if (typeof window === "undefined") return;

  const prevTitle = document.title;
  const cleanTitle = fileName.replace(/\.pdf$/i, "").trim();
  document.title = cleanTitle;

  const stage = document.getElementById("print-stage");
  if (stage) {
    stage.innerHTML = contentHtml;
    // Brief timeout so images / styles are guaranteed rendered in DOM before print
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        document.title = prevTitle;
      }, 1500);
    }, 150);
  } else {
    // Fallback: window print
    window.print();
    setTimeout(() => {
      document.title = prevTitle;
    }, 1500);
  }
}
