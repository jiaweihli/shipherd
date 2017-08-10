import * as fs from 'fs';

import * as config from 'config';
import { None, Option } from 'monapt';
import { default as Rematch } from 'rematch';

class StorageService {
  static INSTANCE: StorageService = new StorageService(config.get<string>('storage.path'));

  storagePath: string;

  protected constructor(storagePath: string) {
    this.storagePath = storagePath;
  }

  load(): Option<string> {
    return Rematch.match(fs.existsSync(this.storagePath), [
      Rematch.Value(true, (): Option<string> => Option(fs.readFileSync(this.storagePath, { encoding: 'utf8' }))),
      Rematch.Value(false, () => None)
    ]);
  }

  save(value: string): void {
    fs.writeFileSync(this.storagePath, value);
  }
}

export { StorageService };
