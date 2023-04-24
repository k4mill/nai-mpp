import { Component } from '@angular/core';
import { FileService } from '../services/file-service.service';
import { KMeansService } from '../services/kmeans-service.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent {
  constructor(public fileService: FileService, public kMeansService: KMeansService) {}

  form = new FormGroup({
    'kParam': new FormControl('3', [Validators.required])
  });

  updateKParam() {
    this.kMeansService.setKParam(parseInt(this.form.get('kParam')?.value as string));
  }
}
