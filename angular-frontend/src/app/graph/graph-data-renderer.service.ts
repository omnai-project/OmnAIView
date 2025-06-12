import {effect, inject, Injectable, signal} from '@angular/core';
import {DataSourceService} from './graph-data.service';
import {ScaleLinear, ScaleTime} from 'd3';
import {DataFormat} from '../omnai-datasource/omnai-scope-server/live-data.service';
import {line as d3Line} from 'd3-shape';


/**
 * This class exists to render the Data of a Graph to it's svg path representation.
 * It uses a WebWorker to keep the main javascript thread free, if possible.
 * If the WebWorker cannot be loaded (which should only happen during testing), it falls back to rendering it on the main javascript thread.
 */
export class GraphDataRendererService {
  //Try to start a WebWorker per new instance.
  constructor(graphData: DataSourceService) {
    this.graphData = graphData;
    try{
      this.worker = new Worker(new URL('./webworker', import.meta.url));

      this.worker.addEventListener("message", (e) =>{
        this.lastWorkerRequestDone = true;
        if (!Array.isArray(e.data)) {
          console.error("recieved invalid path data from webworker: ", e.data);
          return;
        }
        this.#paths.set(e.data);
      })

      this.worker.addEventListener("messageerror", (e) =>{
        this.lastWorkerRequestDone = true;
        console.error("recieved error from webworker: ", e);
      })

    } catch (e) {
      console.error('Could not start WebWorker for GraphRendering: ', e);
    }
  }

  /**
   * Data to render
   * @private
   */
  private readonly graphData;
  /**
   * Rendered SVG Paths
   * @private
   */
  readonly #paths = signal<{id:string, d:string}[]>([]);

  //Set, if the Worker can be constructed, or null.
  //During testing the Worker will always be null.
  private readonly worker:Worker|null = null;
  private lastWorkerRequestDone:boolean = true;


  /**
   * Rendered SVG Paths
   */
  readonly paths = this.#paths.asReadonly();
  private updatePaths = effect(()=>{
    //we might not have a webworker (e.g. when testing). Handle it properly
    if (!this.worker) {
      this.#paths.set(getPaths(this.graphData.xScale(), this.graphData.yScale(), this.graphData.dummySeries().data))
      return;
    }

    const dimensions = this.graphData.graphDimensions();
    const domain = this.graphData.domain();
    const series = this.graphData.dummySeries();


    //don't overwhelm the WebWorker.
    if (!this.lastWorkerRequestDone || !this.worker) return;
    this.lastWorkerRequestDone = false;
    this.worker.postMessage({
      dimensions,
      domain,
      series,
    })
  })

}

/**
 * Renders a graph using d3 to a svg path
 * @param xScale Scale of the xAxis
 * @param yScale Scale of the yAxis
 * @param series Data Points
 */
export function getPaths(xScale:ScaleTime<number, number>, yScale:ScaleLinear<number, number>, series:Map<string, DataFormat[]>) {
  const lineGen = d3Line<{ time: Date; value: number }>()
    .x(d => xScale(d.time))
    .y(d => yScale(d.value));

  const output = [];
  let data_points = 0;
  for (const [key,value] of series) {
    data_points += value.length;
    const parsedValues = value.map((v) => ({
      time: new Date(v.timestamp),
      value: v.value,
    }));
    const pathData = lineGen(parsedValues) ?? '';
    output.push({
      id: key,
      d: pathData,
    })
  }
  return output;
}
