import { default as Rematch } from 'rematch';

class Outcome {
  static SUCCESS: Outcome = new Outcome('success');
  static FAILED: Outcome = new Outcome('failed');
  static CANCELLED: Outcome = new Outcome('canceled');

  text: string;

  private constructor(text: string) {
    this.text = text;
  }

  toJSON(): Outcome.JSON {
    return this.text;
  }
}

namespace Outcome {
  export function parse(data: Outcome.JSON): Outcome {
    return Rematch.match(data, [
      Rematch.Value('success', () => Outcome.SUCCESS),
      Rematch.Value('failed', () => Outcome.FAILED),
      Rematch.Value('canceled', () => Outcome.CANCELLED)
    ]);
  }

  export type JSON = string;
}

export { Outcome };
