import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class LoggerService {
    log(msg: any, args: any = null) {
        if(args) console.log(msg, args);
        else console.log(msg);
    }
}