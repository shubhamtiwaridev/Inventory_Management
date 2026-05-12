const getExportFileName = (baseName, extension) => {
  const date = new Date().toISOString().slice(0, 10);
  return `${baseName}-${date}.${extension}`;
};

const normalizeExportValue = (value) => {
  const text =
    value === undefined || value === null || value === "" ? "-" : String(value);

  if (/^[=+\-@]/.test(text)) {
    return `'${text}`;
  }

  return text;
};

const escapeCsvValue = (value) => {
  const text = normalizeExportValue(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const escapeHtmlValue = (value) =>
  normalizeExportValue(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

export const exportRowsToCsv = (rows, columns, baseName) => {
  const header = columns
    .map((column) => escapeCsvValue(column.label))
    .join(",");

  const body = rows
    .map((row) =>
      columns.map((column) => escapeCsvValue(row[column.key])).join(","),
    )
    .join("\n");

  downloadFile(
    `\ufeff${header}\n${body}`,
    getExportFileName(baseName, "csv"),
    "text/csv;charset=utf-8;",
  );
};

export const exportRowsToExcel = (rows, columns, baseName) => {
  const tableHeader = columns
    .map((column) => `<th>${escapeHtmlValue(column.label)}</th>`)
    .join("");

  const tableBody = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((column) => `<td>${escapeHtmlValue(row[column.key])}</td>`)
          .join("")}</tr>`,
    )
    .join("");

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>${tableHeader}</tr>
          </thead>
          <tbody>
            ${tableBody}
          </tbody>
        </table>
      </body>
    </html>
  `;

  downloadFile(
    html,
    getExportFileName(baseName, "xls"),
    "application/vnd.ms-excel;charset=utf-8;",
  );
};
