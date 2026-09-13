const UTF8_BOM = "﻿";

const FORMULA_PREFIX = /^[=+\-@\t\r]/;
const NUMERIC = /^-?\d+(\.\d+)?$/;

const quoteIfNeeded = (text) =>
  /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;

const escapeCell = (value, asText = false) => {
  if (value === null || value === undefined || value === "") return "";
  const text = String(value);

  if (asText) return quoteIfNeeded(`="${text.replace(/"/g, '""')}"`);
  if (FORMULA_PREFIX.test(text) && !NUMERIC.test(text)) {
    return quoteIfNeeded(`'${text}`);
  }
  return quoteIfNeeded(text);
};

export const toCsv = (columns, rows) => {
  const lines = [columns.map((column) => escapeCell(column.header)).join(",")];

  for (const row of rows) {
    lines.push(
      columns.map((column) => escapeCell(row[column.key], column.asText)).join(","),
    );
  }

  return UTF8_BOM + lines.join("\r\n");
};
