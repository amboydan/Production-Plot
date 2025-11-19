export interface Trace {
  x: string[];
  y: (number | null)[];
  mode: string;
  type: string;
  name: string;
}

export function extractDatesByVariable(data: Trace[]) {
  const result: Record<string, string[]> = {};

  data.forEach(trace => {
    result[trace.name] = trace.x.map(d => d);
  });

  return result;
}

export function extractAllUniqueDates(data: Trace[]) {
  const dateSet = new Set<string>();

  data.forEach(trace => {
    trace.x.forEach(date => dateSet.add(date));
  });

  return Array.from(dateSet).sort();
}

export function extractAllUniqueValues(data: Trace[]) {
  const valueSet = new Set<any>();

  data.forEach(trace => {
    trace.y.forEach(val => valueSet.add(val));
  });

  return Array.from(valueSet).sort();
}
