import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Column } from './Column.model';

@Injectable({
  providedIn: 'root'
})
export class ExcellExportService {

  constructor(private http: HttpClient) { }

  async exportToExcel(data: any[], columns:Column[], fileName: string) {
    const formattedData = data.map((item) => {
      const formattedItem :any= {};
      columns.forEach((column) => {
        formattedItem[column.title] = item[column.name];
      });
      return formattedItem;
    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const excelBlob: Blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(excelBlob, `${fileName}.xlsx`);
  }
  
}
