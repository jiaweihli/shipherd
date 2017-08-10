class User {
  avatarUrl: string;
  username: string;

  constructor(avatarUrl: string, username: string) {
    this.avatarUrl = avatarUrl;
    this.username = username;
  }

  toJSON(): User.JSON {
    return {
      avatar_url: this.avatarUrl,
      login: this.username
    };
  }
}

namespace User {
  export function parse(data: User.JSON): User {
    return new User(data.avatar_url, data.login);
  }

  export interface JSON {
    avatar_url: string;
    login: string;
  }
}

export { User };
