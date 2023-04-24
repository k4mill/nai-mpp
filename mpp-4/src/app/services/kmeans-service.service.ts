import { Injectable } from "@angular/core";
import { FileService } from "./file-service.service";
import { LoggerService } from "./logger.service";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class KMeansService {
    constructor(public fileService: FileService, private logger: LoggerService) {}
    
    centroids: string[][] = [];

    previousGroups: number[][] = [];
    groups: {
        trainingIndex: number,
        attributes: string[]
    }[][] = [];
    kParam: number = 3;
    counter = 0;

    noOfDisplayedColumns = new Subject<number>();
    
    initGroups() : void {
        this.counter = 0;
        this.previousGroups = [];
        this.centroids = [];
        this.groups = [];

        const repeats: number[] = [];

        for(let i = 0; i < this.kParam; i++) {
            this.groups[i] = [];
            let randomIndex = Math.floor(Math.random() * this.fileService.getTrainingData().length);

            while(repeats.includes(randomIndex)) randomIndex = Math.floor(Math.random() * this.fileService.getTrainingData().length);

            this.groups[i].push({
                trainingIndex: randomIndex,
                attributes: this.fileService.getTrainingData()[randomIndex]
            })

            this.centroids.push(this.fileService.getTrainingData()[randomIndex].slice(0, -1));

            repeats.push(randomIndex);
        }

        this.logger.log("%c=========================================", 'background: #222; color: #fdcb6e');
        this.logger.log("%cGROUPS INITIALIZED", 'background: #222; color: #fdcb6e; font-weight: 700');
        this.logger.log("%c=========================================", 'background: #222; color: #fdcb6e');

        this.noOfDisplayedColumns.next(this.groups[0][0].attributes.length);

        while(!this.compareGroups(this.previousGroups, this.getGroupNumbers(this.groups))) {
            this.assignToGroups();
            this.calculateCentroids();

            let globalError = this.calculateGlobalError();
            this.logger.log("%c=========================================", 'background: #222; color: #ff7675');
            this.logger.log(`%cGLOBAL ERROR: ${globalError}`, 'background: #222; color: #ff7675');
            this.logger.log("%c=========================================", 'background: #222; color: #ff7675');

            for(let i = 0; i < this.kParam; i++) {
                let localError = this.calculateLocalError(i);
                this.logger.log("%c=========================================", 'background: #222; color: #fab1a0');
                this.logger.log(`%cLOCAL ERROR FOR GROUP ${i}: ${localError}`, 'background: #222; color: #fab1a0');
                this.logger.log("%c=========================================", 'background: #222; color: #fab1a0');
            }
        }

        this.logger.log("%c=========================================", 'background: #222; color: #00b894');
        this.logger.log("%cFINAL GROUPS:", 'background: #222; color: #00b894; font-weight: 700');
        console.log(this.groups)
        this.logger.log("%c=========================================", 'background: #222; color: #00b894');

        for(let group of this.groups) this.calculateGroupDistribution(this.groups.indexOf(group));
    }

    assignToGroups() {
        this.previousGroups = this.getGroupNumbers(this.groups);

        this.groups.forEach((group, index) => {
            this.groups[index] = [];
        })

        const distances: { trainingIndex: number, distances: number[] }[] = [];

        for(let trainingCase of this.fileService.getTrainingData()) {
            const dstArr: number[] = [];
            const trainingCaseIndex = this.fileService.getTrainingData().indexOf(trainingCase);

            for(let i = 0; i < this.kParam; i++) {
                let dst = 0;

                for(let j = 0; j < trainingCase.length - 1; j++)
                    dst += Math.pow(parseFloat(trainingCase[j]) - parseFloat(this.centroids[i][j]), 2);

                dstArr.push(dst);
            }

            distances.push({ trainingIndex: trainingCaseIndex, distances: dstArr })

            const assignedGroup = distances[trainingCaseIndex].distances.indexOf(Math.min(...dstArr));

            if(!this.groups[assignedGroup].find((el) => el.trainingIndex === trainingCaseIndex))
                this.groups[assignedGroup].push({ trainingIndex: trainingCaseIndex, attributes: trainingCase });
        }
    }

    calculateCentroids() {
        this.centroids = [];

        for(let i = 0; i < this.kParam; i++) {
            const values: number[][][] = [];
            let centroid: string[] = [];

            values[i] = [];

            for(let j = 0; j < this.groups[i][0].attributes.length - 1; j++)
                values[i][j] = [];

            this.groups[i].forEach((trainingCase) => {
                for(let j = 0; j < trainingCase.attributes.length - 1; j++)
                    values[i][j].push(parseFloat(trainingCase.attributes[j]));
            });

            for(let j = 0; j < this.groups[i][0].attributes.length - 1; j++) {
                centroid.push(values[i][j].reduce((a, b) => a + b, 0) / values[i][j].length + '');
            }

            this.centroids.push(centroid);
        }
    }

    compareGroups(previous: number[][], current: number[][]) {
        if(previous.length !== current.length) return false;
        
        for(let i = 0; i < current.length; i++) {
            if(previous[i].length !== current[i].length) return false;

            for(let j = 0; j < current.length; j++) {
                if(!previous[i].includes(current[i][j])) return false;
            }
        }
        
        return true;
    }

    getGroupNumbers(groups: { trainingIndex: number, attributes: string[] }[][] ) {
        const result: number[][] = [];

        groups.forEach((group, index) => {
            result[index] = [];

            for(let trainingCase of group) {
                if(!result[index].includes(trainingCase.trainingIndex)) result[index].push(trainingCase.trainingIndex);
            }
        })

        return result;
    }

    calculateGlobalError() {
        let res = 0;

        for(let i = 0; i < this.kParam; i++) {
            for(let j = 0; j < this.groups[i].length; j++) {
                for(let k = 0; k < this.groups[i][j].attributes.length - 1; k++) {
                    res += Math.pow(parseFloat(this.groups[i][j].attributes[k]) - parseFloat(this.centroids[i][k]), 2);
                }
            }
        }

        return res;
    }

    calculateLocalError(index: number) {
        let res = 0;

        for(let j = 0; j < this.groups[index].length; j++) {
            for(let k = 0; k < this.groups[index][j].attributes.length - 1; k++) {
                res += Math.pow(parseFloat(this.groups[index][j].attributes[k]) - parseFloat(this.centroids[index][k]), 2);
            }
        }

        return Math.round(res * 10000) / 10000;
    }

    calculateGroupDistribution(index: number) {
        const res = new Map();

        this.groups[index].forEach((trainingCase) => {
            const species = trainingCase.attributes[trainingCase.attributes.length - 1];

            res.set(species, 0);
        });

        this.groups[index].forEach((trainingCase) => {
            const species = trainingCase.attributes[trainingCase.attributes.length - 1];

            res.set(species, (res.get(species) + 1));
        });

        return res;
    }

    findMean(distribution: Map<string, number>) {
        let count = Math.max(...distribution.values());
        
        for(let key of distribution.keys()) {
            if(distribution.get(key) === count) return key;
        }

        return;
    }

    calculateEntropy(index: number) {
        const probability = this.calculateGroupDistribution(index).get(this.findMean(this.calculateGroupDistribution(index))) / this.groups[index].length;

        return Math.round(-probability * Math.log2(probability) * 10000) / 10000;
    }

    setKParam(k: number) {
        this.kParam = k;
    }
}