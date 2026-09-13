/**
 * Helper utility for printing official A4 documents in KOBINA (Kontrol Baju Warga Binaan).
 * Supports:
 * 1. Synchronized Root #print-portal printing (cleans all overlays for native window.print()).
 * 2. Standalone New-Tab printing (bypasses iframe sandbox restrictions in AI Studio/preview).
 * 3. Direct HTML file download for offline archiving and printing.
 */

export interface PrintOptions {
  title?: string;
  documentNumber?: string;
  filename?: string;
  autoCloseTab?: boolean;
}

/**
 * Generate a standalone, fully self-contained HTML page
 * formatted specifically for official A4 government documents.
 */
export function generatePrintableHtml(title: string, innerHtml: string, options?: PrintOptions): string {
  const docTitle = options?.title || title || 'Dokumen Resmi KOBINA Lapas Batang';

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <!-- Tailwind CSS CDN for 1-to-1 styling matching the app -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 10mm 12mm 10mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 20px;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      background: #ffffff;
      color: #020617;
    }
    .print-control-bar {
      position: sticky;
      top: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      background: #071a30;
      color: #ffffff;
      padding: 12px 20px;
      margin: -20px -20px 24px -20px;
      border-bottom: 3px solid #f59e0b;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      font-family: system-ui, sans-serif;
    }
    .print-btn {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: #091a2e;
      border: 1px solid #fde68a;
      font-weight: 800;
      padding: 8px 18px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .print-btn:hover {
      background: #fbbf24;
      transform: translateY(-1px);
    }
    .close-btn {
      background: #1e293b;
      color: #f1f5f9;
      border: 1px solid #475569;
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
    }
    .close-btn:hover {
      background: #334155;
    }
    @media print {
      .print-control-bar, .no-print {
        display: none !important;
      }
      body {
        padding: 0 !important;
        margin: 0 !important;
      }
    }
    /* Fallback essential table & grid styling */
    table {
      width: 100% !important;
      border-collapse: collapse !important;
      margin-top: 6px;
      margin-bottom: 8px;
    }
    th, td {
      border: 1px solid #334155 !important;
      padding: 4px 6px !important;
      font-size: 10.5px !important;
    }
    th {
      background-color: #f1f5f9 !important;
      font-weight: 700 !important;
      text-transform: uppercase !important;
    }
    .grid { display: grid; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .text-right { text-align: right; }
    .font-bold { font-weight: 700; }
    .font-black { font-weight: 900; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }
    .uppercase { text-transform: uppercase; }
    .underline { text-decoration: underline; }
    .page-break-after {
      page-break-after: always;
      break-after: page;
    }
    tr, .avoid-break, .printable-card {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .border-b-2 { border-bottom: 2px solid #000; }
    .border-b { border-bottom: 1px solid #000; }
  </style>
</head>
<body>
  <div class="print-control-bar no-print">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 20px;">🏛️</span>
      <div>
        <strong style="color: #fde68a; font-size: 14px; letter-spacing: 0.5px;">KOBINA - LEMBAGA PEMASYARAKATAN KELAS IIB BATANG</strong>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Dokumen Cetak Resmi Siap Dicetak ke Kertas A4 / Simpan PDF</div>
      </div>
    </div>
    <div style="display: flex; align-items: center; gap: 10px;">
      <button class="print-btn" onclick="window.print()">
        <span>🖨️</span> CETAK SEKARANG (CTRL + P)
      </button>
      <button class="close-btn" onclick="window.close()">
        ✖ Tutup
      </button>
    </div>
  </div>

  <div class="printable-content">
    ${innerHtml}
  </div>

  <script>
    // Trigger print reliably once document is ready
    function initPrint() {
      setTimeout(function() {
        try {
          window.focus();
          window.print();
        } catch(e) {
          console.warn('Auto print error:', e);
        }
      }, 500);
    }

    if (document.readyState === 'complete') {
      initPrint();
    } else {
      window.addEventListener('load', initPrint);
    }
  </script>
</body>
</html>`;
}

/**
 * Open the document in a new tab with automatic print trigger.
 * This completely bypasses iframe sandbox restrictions (e.g. within AI Studio preview).
 */
export function openInNewPrintTab(title: string, innerHtml: string): boolean {
  try {
    const html = generatePrintableHtml(title, innerHtml);
    
    // 1. First attempt: synchronous window.open with document.write
    let printWin: Window | null = null;
    try {
      printWin = window.open('', '_blank');
    } catch {
      printWin = null;
    }

    if (printWin && !printWin.closed) {
      try {
        printWin.document.open();
        printWin.document.write(html);
        printWin.document.close();
        printWin.focus();
        return true;
      } catch (err) {
        console.warn('Document write to blank tab failed, trying Blob URL:', err);
      }
    }

    // 2. Second attempt: Blob URL
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const blobWin = window.open(blobUrl, '_blank');
      if (blobWin) {
        blobWin.focus();
        return true;
      }
    } catch (blobErr) {
      console.warn('Blob window open failed:', blobErr);
    }

    return false;
  } catch (err) {
    console.error('Failed to open print tab:', err);
    return false;
  }
}

/**
 * Download the document as a clean, standalone HTML file.
 * The user can open and print this anytime in any browser or save it as an archive.
 */
export function downloadPrintableDocument(title: string, innerHtml: string, filename?: string): void {
  try {
    const html = generatePrintableHtml(title, innerHtml);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const safeName = (filename || title || 'Dokumen_KOBINA_Lapas_Batang')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 60);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}.html`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  } catch (err) {
    console.error('Failed to download printable document:', err);
  }
}

/**
 * Master print execution method.
 * 1. Synchronizes the printable HTML into the root #print-portal container.
 * 2. Checks if the app is currently running inside an iframe (like AI Studio preview):
 *    - In an iframe, browser sandboxes block `window.print()` (giving a silent warning).
 *      Therefore, we automatically open the document in a clean New Tab where printing works 100%.
 *    - In standalone/top-level mode, we invoke `window.print()` directly on the #print-portal.
 * 3. Falls back smoothly to downloading HTML if popups or print dialogs are prevented.
 */
export function executePrint(
  elementIdOrEl: string | HTMLElement, 
  title = 'Dokumen KOBINA Lapas Batang'
): { success: boolean; fallbackUsed?: 'new-tab' | 'download' | 'direct' } {
  const el = typeof elementIdOrEl === 'string' 
    ? document.getElementById(elementIdOrEl) 
    : elementIdOrEl;

  const contentHtml = el ? el.innerHTML : document.body.innerHTML;

  // 1. Populate the #print-portal at document root
  let portal = document.getElementById('print-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'print-portal';
    document.body.appendChild(portal);
  }
  portal.innerHTML = contentHtml;

  // Mark body with printing class so CSS can suppress #root
  document.body.classList.add('printing-active');
  const cleanup = () => {
    document.body.classList.remove('printing-active');
  };
  window.addEventListener('afterprint', cleanup, { once: true });
  setTimeout(cleanup, 10000);

  // 2. Check if running inside a sandboxed iframe
  let inIframe = false;
  try {
    inIframe = window.self !== window.top;
  } catch {
    inIframe = true;
  }

  if (inIframe) {
    // In sandboxed iframes (e.g. AI Studio preview), window.print() is blocked by browser security.
    // Opening in a clean tab bypasses the iframe sandbox completely!
    const opened = openInNewPrintTab(title, contentHtml);
    if (opened) {
      return { success: true, fallbackUsed: 'new-tab' };
    }

    // If popup was blocked, attempt in-frame print
    try {
      window.print();
      return { success: true, fallbackUsed: 'direct' };
    } catch {
      downloadPrintableDocument(title, contentHtml, title);
      return { success: true, fallbackUsed: 'download' };
    }
  }

  // Standalone mode: invoke standard print
  try {
    window.print();
    return { success: true, fallbackUsed: 'direct' };
  } catch (err) {
    console.warn('Standard window.print() failed. Falling back to new tab:', err);
    const opened = openInNewPrintTab(title, contentHtml);
    if (opened) {
      return { success: true, fallbackUsed: 'new-tab' };
    }
    downloadPrintableDocument(title, contentHtml, title);
    return { success: true, fallbackUsed: 'download' };
  }
}
