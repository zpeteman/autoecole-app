declare class JSZip {
  file(name: string, content: string): JSZip;
  generateAsync(options: { type: string }): Promise<Blob>;
} 