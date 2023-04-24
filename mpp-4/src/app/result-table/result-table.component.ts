import { Component, OnInit } from '@angular/core';
import { KMeansService } from '../services/kmeans-service.service';

@Component({
  selector: 'app-result-table',
  templateUrl: './result-table.component.html',
  styleUrls: ['./result-table.component.scss']
})
export class ResultTableComponent implements OnInit {
  constructor(public kMeansService: KMeansService) {}

  displayedColumns = ["No."];
  noOfDisplayedColumns = 0;

  ngOnInit(): void {
    this.kMeansService.noOfDisplayedColumns.subscribe((val: number) => {
      this.displayedColumns = ["No."];
      this.noOfDisplayedColumns = val;

      for(let i = 0; i < val; i++)
        this.displayedColumns.push(`#${i}`);
    })
  }

  createEmptyArray() {
    return new Array(this.noOfDisplayedColumns).fill(0);
  }
}
