import Discord from '../Discord';

import type { Change, MdCategory } from '../types';

interface RemoteOperationOptions {
  discord: Discord;
}

export interface CrawlOptions {
  basePath: string;
}

export interface ReconcileOptions extends RemoteOperationOptions {
  docs: MdCategory[];
}

export interface DeployOptions extends RemoteOperationOptions {
  changes: Change[];
  guildId: string;
}
