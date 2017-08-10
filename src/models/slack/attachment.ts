import * as _ from 'lodash';

import { Field } from './field';

class Attachment {
  authorIcon: string;
  authorLink: string;
  authorName: string;
  color: string;
  fields: Array<Field>;
  mrkdwnIn: Array<string>;
  pretext: string;

  constructor(authorIcon: string, authorLink: string, authorName: string, color: string,
              fields: Array<Field>, mrkdwnIn: Array<string>, pretext: string) {
    this.authorIcon = authorIcon;
    this.authorLink = authorLink;
    this.authorName = authorName;
    this.color = color;
    this.fields = fields;
    this.mrkdwnIn = mrkdwnIn;
    this.pretext = pretext;
  }

  toJSON(): Attachment.JSON {
    return {
      author_icon: this.authorIcon,
      author_link: this.authorLink,
      author_name: this.authorName,
      color: this.color,
      fields: _(this.fields).map((field: Field) => field.toJSON()).value(),
      mrkdwn_in: this.mrkdwnIn,
      pretext: this.pretext
    };
  }
}

namespace Attachment {
  export function parse(data: Attachment.JSON): Attachment {
    return new Attachment(
      data.author_icon,
      data.author_link,
      data.author_name,
      data.color,
      _(data.fields)
        .map((fieldJSON: Field.JSON) => Field.parse(fieldJSON))
        .value(),
      data.mrkdwn_in,
      data.pretext
    );
  }

  export interface JSON {
    author_icon: string;
    author_link: string;
    author_name: string;
    color: string;
    fields: Array<Field.JSON>;
    mrkdwn_in: Array<string>;
    pretext: string;
  }
}

export { Attachment };
