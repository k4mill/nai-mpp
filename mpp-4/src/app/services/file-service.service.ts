import { FileOrArrayFile } from "@angular-material-components/file-input";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class FileService {
    #file: File | null = null;
    #fileReader = new FileReader();
    #fileContent: string | ArrayBuffer | null = '';
    #trainingData: string[][] = [];

    async getFileContent(event: Event) {
        return new Promise((res, rej) => {
          this.#file = (event.target as HTMLInputElement).files![0];
        
          this.#fileReader.readAsText(this.#file);
          this.#fileReader.addEventListener('load', () => {
            this.#fileContent = this.#fileReader.result;
            res(this.#fileContent);
          })
    
          this.#fileReader.onerror = (e) => rej(e);
        })
      }
    
    convertToArray(content: string) {
        this.#trainingData = [];

        content.split("\n").forEach((line, lineIndex) => {
            const attrArray: string[] = [];

            line.split("\t").forEach((attribute) => {
            attrArray.push(attribute.replace(",", ".").trim());
            })

            this.#trainingData.push(attrArray);
        })

        return this.#trainingData;
    }

    getTrainingData() : string[][] {
        return this.#trainingData;
    }

    getFileName() : string {
      return this.#file ? this.#file.name : "";
    }
}