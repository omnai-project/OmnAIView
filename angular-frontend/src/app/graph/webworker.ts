import {scaleLinear as d3ScaleLinear, scaleUtc as d3ScaleUtc} from "d3-scale";
import {getPaths} from "./graph-data-renderer.service";
 import {DataFormat} from '../omnai-datasource/omnai-scope-server/live-data.service';
import {DataBounds} from '../source-selection/data-source-selection.service';

interface Data {
  dimensions: {width: number, height: number},
  domain: {xDomain: [number, number], yDomain: [number, number]},
  series: {data: Map<string, DataFormat[]>, bounds: DataBounds},
}

onmessage = (e:MessageEvent<Data>) => {
  const start = performance.now();
  // Even-though the parameter is typed to be of type Data, it is not actually guaranteed at runtime.
  // Therefore, those assumptions should be checked.
  // noinspection SuspiciousTypeOfGuard
  if (
    !e.data.dimensions || !e.data.domain || !e.data.series || !e.data.series.data || !e.data.series.bounds ||
    !e.data.dimensions.width || !e.data.dimensions.height ||
    typeof e.data.dimensions.width !== "number" || typeof e.data.dimensions.height !== "number" ||

    !e.data.domain.xDomain || !e.data.domain.yDomain ||
    !Array.isArray(e.data.domain.xDomain) || !Array.isArray(e.data.domain.yDomain) ||
    e.data.domain.xDomain.length !== 2 || e.data.domain.yDomain.length !== 2 ||
    typeof e.data.domain.xDomain[0] !== "object" || typeof e.data.domain.xDomain[1] !== "object" ||
    typeof e.data.domain.yDomain[0] !== "number" || typeof e.data.domain.yDomain[1] !== "number"
  ) {
    throw JSON.stringify({error: "Data is not properly formatted", data:e.data})
    return;
  }

  const dimensions = e.data.dimensions;
  const domain = e.data.domain;
  const series = e.data.series;

  const margin = { top: 20, right: 30, bottom: 40, left: 40 };
  const width = dimensions.width - margin.left - margin.right;
  const height = dimensions.height - margin.top - margin.bottom;
  const scale = {
    xScale: d3ScaleUtc()
      .domain(domain.xDomain)
      .range([0, width]),
    yScale: d3ScaleLinear()
      .domain(domain.yDomain)
      .range([height, 0]),
  };

  const output = getPaths(scale.xScale, scale.yScale, series.data);
  // console.log("Updating Paths took: ", performance.now() - start, " for ", data_points, " data-points.");
  postMessage(output);
}
