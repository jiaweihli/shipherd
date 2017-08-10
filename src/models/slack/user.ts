class User {
  id: string;
  name: string;
  username: string;

  constructor(id: string, name: string, username: string) {
    this.id = id;
    this.name = name;
    this.username = username;
  }

  toJSON(): User.JSON {
    return {
      id: this.id,
      name: this.username,
      profile: {
        real_name: this.name
      }
    };
  }
}

namespace User {
  export function parse(data: User.JSON): User {
    return new User(data.id, data.profile.real_name, data.name);
  }

  export interface JSON {
    id: string;
    name: string;
    profile: {
      real_name: string;
    };
  }
}

export { User };
