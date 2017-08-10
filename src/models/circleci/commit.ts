class Commit {
  authorName: string;
  subject: string;
  url: string;

  constructor(authorName: string, subject: string, url: string) {
    this.authorName = authorName;
    this.subject = subject;
    this.url = url;
  }

  toJSON(): Commit.JSON {
    return {
      author_name: this.authorName,
      commit_url: this.url,
      subject: this.subject
    };
  }
}

namespace Commit {
  export function parse(data: Commit.JSON): Commit {
    return new Commit(data.author_name, data.subject, data.commit_url);
  }

  export interface JSON {
    author_name: string;
    commit_url: string;
    subject: string;
  }
}

export { Commit };
