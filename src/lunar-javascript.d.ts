/**
 * Type declarations for lunar-javascript
 */

declare module 'lunar-javascript' {
  export interface JieQi {
    _p: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      second: number;
    };
  }

  export class Solar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }

  export class Lunar {
    static fromYmd(
      year: number,
      month: number,
      day: number,
      isLeapMonth?: boolean,
    ): Lunar | null;
    getSolar(): Solar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    isLeap(): boolean;
    getJieQiTable(): Record<string, JieQi>;
  }
}
