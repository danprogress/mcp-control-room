/// <reference types="vite/client" />

interface FileSystemWritableFileStream {
  write(data: Blob | BufferSource | string): Promise<void>;
}

interface Window {
  showSaveFilePicker?(options?: {
    suggestedName?: string;
    types?: { description?: string; accept: Record<string, string[]> }[];
  }): Promise<FileSystemFileHandle>;
}
