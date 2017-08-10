class Channel {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  toJSON(): Channel.JSON {
    return {
      id: this.id,
      name: this.name
    };
  }
}

namespace Channel {
  export function parse(data: Channel.JSON): Channel {
    return new Channel(data.id, data.name);
  }

  export interface JSON {
    id: string;
    name: string;
  }
}

export { Channel };
