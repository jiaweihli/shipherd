import { default as Rematch } from 'rematch';

class Status {
  static FAILED: Status = new Status('failed');
  static SUCCESS: Status = new Status('success');
  static FIXED: Status = new Status('fixed');

  text: string;

  private constructor(text: string) {
    this.text = text;
  }

  toJSON(): Status.JSON {
    return this.text;
  }
}

namespace Status {
  export function parse(data: Status.JSON): Status {
    return Rematch.match(data, [
      Rematch.Value('failed', () => Status.FAILED),
      Rematch.Value('fixed', () => Status.FIXED),
      Rematch.Value('success', () => Status.SUCCESS)
    ]);
  }

  export type JSON = string;
}

export { Status };
