declare module 'potrace' {
  export function trace(
    file: string | Buffer,
    options: PosterizeOptions,
    cb: (err: Error, res: string) => void
  ): void;

  export function posterize(
    file: string | Buffer,
    otions: PosterizeOptions,
    // res should be written to file as .svg
    cb: (err: Error, res: string) => void
  ): void;

  export interface PosterizeOptions {
    background?: string;
    color?: string;
    threshold?: number;
    steps?: number | number[];
    fillStrategy?: FillStrategy;
  }

  export const enum FillStrategy {
    FILL_SPREAD = 'spread',
    FILL_DOMINANT = 'dominant',
    FILL_MEDIAN = 'median',
    FILL_MEAN = 'mean',
  }
}
