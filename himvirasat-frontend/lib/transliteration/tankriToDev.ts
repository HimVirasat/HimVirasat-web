import { tankriToDevMap } from "./mapping";

export function tankriToDev(text: string): string {
  let result = "";

  for (const char of text) {
    result += tankriToDevMap[char] || char;
  }

  return result;
}
