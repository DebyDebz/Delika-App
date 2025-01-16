declare module 'react-native-html-to-pdf' {
  interface PDFOptions {
    html: string;
    fileName?: string;
    base64?: boolean;
  }

  interface PDFResult {
    filePath?: string;
    base64?: string;
    uri: string;
  }

  export default {
    convert(options: PDFOptions): Promise<PDFResult>;
  };
}