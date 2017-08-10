class Field {
  short: boolean;
  title: string;
  value: string;

  constructor(title: string, value: string, short: boolean) {
    this.title = title;
    this.value = value;
    this.short = short;
  }

  toJSON(): Field.JSON {
    return {
      short: this.short,
      title: this.title,
      value: this.value
    };
  }
}

namespace Field {
  export function parse(data: Field.JSON): Field {
    return new Field(data.title, data.value, data.short);
  }

  export interface JSON {
    short: boolean;
    title: string;
    value: string;
  }
}

export { Field };
