import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root' 
})export class MeasurementService{
private measurementRunning$ = new BehaviorSubject<boolean>(false);

setMeasurementRunning(isRunning: boolean): void {
  this.measurementRunning$.next(isRunning);
}

getMeasurementRunning(): boolean {
    return this.measurementRunning$.getValue(); 
}

getMeasurementRunning$(): Observable<boolean> {
return this.measurementRunning$.asObservable();
}

}
