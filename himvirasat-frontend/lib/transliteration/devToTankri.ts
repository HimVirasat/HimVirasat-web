import { devToTankriMap } from "./mapping";

export function devToTankri(text: string): string {
  let result = "";

  for (const char of text) {
    result += devToTankriMap[char] || char;
  }

  return result;
}
