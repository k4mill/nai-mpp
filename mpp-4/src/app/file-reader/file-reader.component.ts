import { Component } from '@angular/core';
import { FileService } from '../services/file-service.service';
import { KMeansService } from '../services/kmeans-service.service';

@Component({
  selector: 'app-file-reader',
  templateUrl: './file-reader.component.html',
  styleUrls: ['./file-reader.component.scss']
})
export class FileReaderComponent {
  data: string[][] = [];

  constructor(public fileService: FileService, public kmeansService: KMeansService) {}
  
  async onFileInputChange(event: Event) {
    this.data = this.fileService.convertToArray(await this.fileService.getFileContent(event) as string);
  }

  
}
