import {line as d3Line} from "d3-shape";
import {scaleLinear as d3ScaleLinear, scaleUtc as d3ScaleUtc} from "d3-scale";

onmessage = (e) => {
  const start = performance.now();
  if (
    !e.data.dimensions || !e.data.domain || !e.data.series || !e.data.series.data ||
    !e.data.dimensions.width || !e.data.dimensions.height ||
    typeof e.data.dimensions.width !== "number" || typeof e.data.dimensions.height !== "number" ||
    !e.data.domain.xDomain || !e.data.domain.yDomain ||
    !Array.isArray(e.data.domain.xDomain) || !Array.isArray(e.data.domain.yDomain) ||
    e.data.domain.xDomain.length !== 2 || e.data.domain.yDomain.length !== 2
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
  const lineGen = d3Line<{ time: Date; value: number }>()
    .x(d => scale.xScale(d.time))
    .y(d => scale.yScale(d.value));

  const output = [];
  let data_points = 0;
  for (const [key,value] of series.data) {
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
  // console.log("Updating Paths took: ", performance.now() - start, " for ", data_points, " data-points.");
  postMessage(output);
}
