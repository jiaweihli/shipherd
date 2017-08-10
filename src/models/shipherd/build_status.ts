import { default as Rematch } from 'rematch';

class BuildStatus {
  static BROKEN: BuildStatus = new BuildStatus('broken');
  static FIXED: BuildStatus = new BuildStatus('fixed');
  static NO_UPDATE: BuildStatus = new BuildStatus('no_update');
  static STILL_PASSING: BuildStatus = new BuildStatus('still_passing');

  text: string;

  private constructor(text: string) {
    this.text = text;
  }

  toJSON(): BuildStatus.JSON {
    return this.text;
  }
}

namespace BuildStatus {
  export function parse(data: BuildStatus.JSON): BuildStatus {
    return Rematch(data, [
      Rematch.Value('broken', () => BuildStatus.BROKEN),
      Rematch.Value('fixed', () =>  BuildStatus.FIXED)
    ]);
  }

  export type JSON = string;
}

export { BuildStatus };
