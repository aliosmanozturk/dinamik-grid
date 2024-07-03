import { Component, Input, OnInit } from '@angular/core';
import { Column } from '../Column.model';
import { ConfigModel } from '../ConfigModel.model';
import { ColumnFilter } from '../ColumnFilter.model';

@Component({
  selector: 'app-dinamik-grid',
  templateUrl: './dinamik-grid.component.html',
  styleUrls: ['./dinamik-grid.component.scss']
})
export class DinamikGridComponent implements OnInit {

  @Input() columns: Column[] = [];
  @Input() title: string = "";
  @Input() data: any[] = []
  @Input() configs: ConfigModel[] = [];
  @Input() isSumHeader: boolean = false;
  @Input() freezeColumnCount: number = 4;
  @Input() pageSize: number = 35;
  @Input() tableName: string = "";
  stickySize: number = 0;
  lineConfigs: ConfigModel[] = [];
  headerConfigs: ConfigModel[] = [];
  filters: ColumnFilter[] = [];
  columnName: string = "";
  currentUserId: number = Number(localStorage.getItem("userId") ?? "0");
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  public selection = new SelectionModel<any>(true, []);
  constructor(private excell: ExcellExportService,private userColumnFilterService:DnmkUserColumnFilterService) { }
  ngOnInit(): void {
    this.columns.forEach(p => {
      this.filters.push({ column: p.name, filterValue: "", operator: "" })
    })
    this.dataSource = new MatTableDataSource<any>(this.data);

    setTimeout(() => this.dataSource.paginator = this.paginator);
    setTimeout(() => this.dataSource.sort = this.sort);
    this.lineConfigs = this.configs.filter(p => !p.header);
    this.headerConfigs = this.configs.filter(p => p.header)
  }
  GetColumnKeys() {
    return this.columns.filter(p => p.show).map(p => p.name);
  }
  get column() {
    return this.filters.find(p => p.column == this.columnName);
  }
 
  Filter(clear: boolean) {
    if (this.column === undefined) {
      return;
    }
    if (clear) {
      this.dataSource.data = this.data;
      if (this.column) {
        this.column.filterValue = "";
        this.column.operator = "";
      }
      return;
    }
    const filter: ColumnFilter = {
      column: this.column.column,
      filterValue: this.column.filterValue,
      operator: this.column.operator
    }
    const find = this.filters.find(p => p.column == this.column?.column);
    if (!find) {
      this.filters.push(filter)
    }
    if (this.dataSource.data.length == 0) {
      switch (filter.operator) {
        case "EQUAL": this.dataSource.data = this.data.filter((p: any) => p[filter.column] != null && p[filter.column] == filter.filterValue); break
        case "NOT EQUAL": this.dataSource.data = this.data.filter((p: any) => p[filter.column] != null && p[filter.column] != filter.filterValue); break
        case "LIKE": this.dataSource.data = this.data.filter((p: any) => p[filter.column] != null && p[filter.column].includes(filter.filterValue)); break
        case "NOT LIKE": this.dataSource.data = this.data.filter((p: any) => p[filter.column] != null && !p[filter.column].includes(filter.filterValue)); break
        case "LEFT LIKE": this.dataSource.data = this.data.filter((p: any) => p[filter.column] != null && p[filter.column].startsWith(filter.filterValue)); break
        case "RIGHT LIKE": this.dataSource.data = this.data.filter((p: any) => p[filter.column] != null && p[filter.column].endsWith(filter.filterValue)); break
        case "IS_GREATER_THEN": this.dataSource.data = this.data.filter((p: any) => p[filter.column] != null && p[filter.column]>filter.filterValue); break
        case "IS_SMALL": this.dataSource.data = this.data.filter((p: any) => p[filter.column] != null && p[filter.column]<filter.filterValue); break
      }
    } else {
      switch (filter.operator) {
        case "EQUAL": this.dataSource.data = this.dataSource.data.filter((p: any) => p[filter.column] != null && p[filter.column] == filter.filterValue); break
        case "NOT EQUAL": this.dataSource.data = this.dataSource.data.filter((p: any) => p[filter.column] != null && p[filter.column] != filter.filterValue); break
        case "LIKE": this.dataSource.data = this.dataSource.data.filter((p: any) => p[filter.column] != null && p[filter.column].includes(filter.filterValue)); break
        case "NOT LIKE": this.dataSource.data = this.dataSource.data.filter((p: any) => p[filter.column] != null && !p[filter.column].includes(filter.filterValue)); break
        case "LEFT LIKE": this.dataSource.data = this.dataSource.data.filter((p: any) => p[filter.column] != null && p[filter.column].startsWith(filter.filterValue)); break
        case "RIGHT LIKE": this.dataSource.data = this.dataSource.data.filter((p: any) => p[filter.column] != null && p[filter.column].endsWith(filter.filterValue)); break
        case "IS_GREATER_THEN": this.dataSource.data = this.dataSource.data.filter((p: any) => p[filter.column] != null && p[filter.column]>filter.filterValue); break
        case "IS_SMALL": this.dataSource.data = this.dataSource.data.filter((p: any) => p[filter.column] != null && p[filter.column]<filter.filterValue); break
      }
    }
  }

  Sum(column: string) {
    if (this.dataSource.data.length == 0) {
      return 0;
    }
    let total = 0;
    this.dataSource.data.forEach(p => {
      if (p[column] != null) {
        total += p[column]
      }
    })
    return total;
  }
  FilterInput() {
    const filterValue = (event!.target as HTMLInputElement).value.toLowerCase();
    const columnName = (event!.target as HTMLInputElement).name;

    if (filterValue === "") {
      this.dataSource.data = this.data;
      return;
    }

    if (this.dataSource.data.length === 0) {
      this.dataSource.data = this.data.filter((p: any) => p[columnName] != null && p[columnName].toString().toLowerCase().includes(filterValue));
    } else {
      this.dataSource.data = this.dataSource.data.filter((p: any) => p[columnName] != null && p[columnName].toString().toLowerCase().includes(filterValue));
    }
  }


  action(item: ConfigModel, param: any) {
    if (item.header) {
      item.outputHandler(item.component, this.selection.selected);
    } else {
      if(param.data){
        item.outputHandler(param.data, item.component);
      }else{
        item.outputHandler(param, item.component);
      }
      
    }

  }
  ExcellExport() {

    this.excell.exportToExcel(this.dataSource.data, this.columns.filter(p => p.show && p.name != "action"), this.title);
  }
  getType(value: any) {
    return typeof (value)
  }
  addColumn(column: any, checked: boolean) {
    console.log("Geldi")
    const index = this.columns.indexOf(column);
    this.columns[index].show = checked;
    if(this.tableName){
      const columnFilter:Dnmk_UserColumnFilter={
        columnName:this.columns[index].name,
        tableName:this.tableName,
        createDate:new Date(),
        createUserId:this.currentUserId,
        id:0,
        show:this.columns[index].show,
        updateDate:null,
        updateUserId:null
      }
      this.userColumnFilterService.Add(columnFilter).subscribe((res)=>{});
    }
   
  }

  isUrlValid(url: string) {
    let _return = false;
    if (url && typeof (url) == "string" && url.startsWith("http")) {
      _return = true;
    } else {
      _return = false;
    }
    return _return;
  }
  public isAllSelected() {
    const numSelected = this.selection.selected.length; const numRows = this.dataSource.data.length; return numSelected === numRows;
  }
  public masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach((row) => this.selection.select(row));
  }
  public checkboxLabel(row?: any): string {
    return !row ? `${this.isAllSelected() ? "select" : "deselect"} all` : `${this.selection.isSelected(row) ? "deselect" : "select"} row ${row.position + 1}`;
  }

  getCurrencyType(row: any) {
  
    return row["currencyPrefix"] === undefined;
  }
}
