import { APIChannel, APIMessage, Routes } from 'discord-api-types/v9';
import { REST, RequestData } from '@discordjs/rest';

interface CreateChannelParams {
  name: string;
  description?: string;
  parent?: string;
  type: number;
}

interface UpdateChannelParams {
  id: string;
  description?: string;
  parent?: string;
}

interface CreateMessageParams {
  content: string;
}

interface UpdateMessageParams {
  id: string;
  content: string;
}

export default class Discord {
  private guildId!: string;
  private rest!: REST;

  private _channels!: Promise<APIChannel[]>;

  constructor(apiToken: string, guildId: string) {
    this.guildId = guildId;
    this.rest = new REST({ version: '9' }).setToken(apiToken);

    this.refetchChannels();
  }

  async createChannel(params: CreateChannelParams) {
    return this.post<APIChannel>(Routes.guildChannels(this.guildId), {
      body: {
        name: params.name,
        parent_id: params.parent,
        topic: params.description,
        type: params.type,
      },
    }).then((channel) => {
      this.refetchChannels();
      return channel;
    });
  }

  async updateChannel(params: UpdateChannelParams) {
    return this.patch<APIChannel>(Routes.channel(params.id), {
      body: { parent_id: params.parent, topic: params.description },
    }).then((channel) => {
      this.refetchChannels();
      return channel;
    });
  }

  async findChannelById(id: string) {
    const channels = await this._channels;
    return channels.find((channel) => channel.id === id);
  }

  async findChannelByName(name: string) {
    const channels = await this._channels;
    return channels.find((channel) => channel.name === name);
  }

  async createMessage(channelId: string, params: CreateMessageParams) {
    return this.post<APIChannel>(Routes.channelMessages(channelId), {
      body: params,
    });
  }

  async deleteMessage(channelId: string, messageId: string) {
    await this.delete<unknown>(Routes.channelMessage(channelId, messageId));
  }

  async updateMessage(channelId: string, messageId: string, params: UpdateMessageParams) {
    return this.patch<APIMessage>(Routes.channelMessages(channelId), {
      body: params,
    });
  }

  /**
   * Auto paginates the given channel's messages and returns them
   * in order from oldest to newest.
   */
  async listMessages(channelId: string) {
    const messages: APIMessage[] = [];

    const queryParams = new URLSearchParams({ limit: '100' });
    while (true) {
      const batch = await this.get<APIMessage[]>(Routes.channelMessages(channelId), {
        query: queryParams,
      });

      if (batch.length === 0) {
        break;
      } else {
        queryParams.set('before', batch[batch.length - 1].id);
        messages.push(...batch);
      }
    }

    messages.reverse();
    return messages;
  }

  private refetchChannels() {
    this._channels = this.get<APIChannel[]>(Routes.guildChannels(this.guildId));
  }

  // Thin wrappers around `@discordjs/rest`. The default Discord client
  // _only_ returns `Promise<unknown` which is awkward to work with. These
  // wrappers allow passing in a generic type parameter, and return `Promise<T>`.

  private async delete<T>(route: `/${string}`, options?: RequestData) {
    return this.rest.delete(route, options) as Promise<T>;
  }

  private async get<T>(route: `/${string}`, options?: RequestData) {
    return this.rest.get(route, options) as Promise<T>;
  }

  private async patch<T>(route: `/${string}`, options?: RequestData) {
    return this.rest.patch(route, options) as Promise<T>;
  }

  private async post<T>(route: `/${string}`, options?: RequestData) {
    return this.rest.post(route, options) as Promise<T>;
  }
}
