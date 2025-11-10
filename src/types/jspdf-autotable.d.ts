declare module 'jspdf-autotable' {
  import jsPDF from 'jspdf';

  interface CellHookData {
    cell: {
      styles: any;
    };
  }

  interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    theme?: string;
    margin?: any;
    styles?: any;
    headStyles?: any;
    columnStyles?: any;
    didParseCell?: (data: CellHookData) => void;
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}
