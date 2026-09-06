import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export interface TemplateVariables {
  fields: string[];
  loops: string[];
}

/** Scans the raw document.xml text runs for {var}, {#loop}/{/loop} and {.} tokens. */
export function extractTemplateVariables(base64: string): TemplateVariables {
  const zip = new PizZip(base64ToArrayBuffer(base64));
  const xml = zip.file('word/document.xml')?.asText() ?? '';
  const text = Array.from(xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g))
    .map((m) => m[1])
    .join('');

  const tokens = text.match(/\{[^}]*\}/g) ?? [];
  const fields = new Set<string>();
  const loops = new Set<string>();

  for (const token of tokens) {
    const inner = token.slice(1, -1).trim();
    if (!inner || inner === '.') continue;
    if (inner.startsWith('#') || inner.startsWith('/')) {
      loops.add(inner.slice(1));
    } else if (inner.startsWith('^')) {
      loops.add(inner.slice(1));
    } else {
      fields.add(inner);
    }
  }

  return { fields: [...fields], loops: [...loops] };
}

export class TemplateRenderError extends Error {}

/** Fills the template with data and returns a downloadable .docx blob. */
export function renderContractDocx(base64: string, data: Record<string, unknown>): Blob {
  const zip = new PizZip(base64ToArrayBuffer(base64));
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '',
  });

  try {
    doc.render(data);
  } catch (error) {
    const err = error as { properties?: { errors?: Array<{ properties?: { explanation?: string } }> } };
    const details = err.properties?.errors?.map((e) => e.properties?.explanation).filter(Boolean).join('; ');
    throw new TemplateRenderError(details || 'Не удалось заполнить шаблон — проверьте формат файла');
  }

  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadBase64(base64: string, filename: string) {
  const buf = base64ToArrayBuffer(base64);
  downloadBlob(new Blob([buf]), filename);
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
