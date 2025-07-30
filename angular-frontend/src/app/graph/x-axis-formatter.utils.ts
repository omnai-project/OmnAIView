import { type NumberValue, timeFormat } from "d3";

export type xAxisMode = 'absolute' | 'relative';

/**
 * @brief Creates a tick-formatter for the X-Axis based on the mode 
 * @param mode see {@link xAxisMode}
 * @param startDate startdate relative time is calculated to  
 * @returns tickformat function usable for d3
 */
export function makeXAxisTickFormatter(
  mode: xAxisMode,
  startDate: NumberValue | Date
): (startValue: NumberValue | Date, index: number) => string {
  const formatAbsolute = timeFormat('%H:%M:%S');
  const formatRelative = timeFormat('%M:%S');

  return (d, _index) => {
    if (mode === 'absolute') {
      if (d instanceof Date) return formatAbsolute(d);
      return formatAbsolute(new Date(Number(d)));
    } else {
      const t = d instanceof Date ? d.getTime() : Number(d);
      const t0 = startDate instanceof Date ? startDate.getTime() : Number(startDate);
      const elapsed = Math.max(0, t - t0);
      return formatRelative(new Date(elapsed));
    }
  };
}
