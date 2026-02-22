import { requestJson } from './http-client';

interface BackendStoryResponse {
  id: number | string;
  slug: string;
  title: string;
  synopsis: string;
  body: string;
  fullBodyAvailable: boolean;
  readingTimeMinutes: number;
  priceInCents: number;
  currencyCode: string;
  authorUsername: string;
  createdAt: string;
}

export interface StoryRecord {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  body: string;
  fullBodyAvailable: boolean;
  readingTimeMinutes: number;
  priceInCents: number;
  currencyCode: string;
  authorUsername: string;
  createdAt: string;
}

export interface CreateStoryInput {
  title: string;
  synopsis: string;
  body: string;
}

function normalizeStory(input: BackendStoryResponse): StoryRecord {
  return {
    id: String(input.id),
    slug: input.slug,
    title: input.title,
    synopsis: input.synopsis,
    body: input.body,
    fullBodyAvailable: input.fullBodyAvailable,
    readingTimeMinutes: input.readingTimeMinutes,
    priceInCents: input.priceInCents,
    currencyCode: input.currencyCode,
    authorUsername: input.authorUsername,
    createdAt: input.createdAt,
  };
}

export const storiesApi = {
  async listStories(accessToken?: string | null): Promise<StoryRecord[]> {
    const response = await requestJson<BackendStoryResponse[]>('/stories', {
      method: 'GET',
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    });
    return response.map(normalizeStory);
  },

  async listLibraryStories(accessToken: string): Promise<StoryRecord[]> {
    const response = await requestJson<BackendStoryResponse[]>('/stories/library', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.map(normalizeStory);
  },

  async createStory(accessToken: string, input: CreateStoryInput): Promise<StoryRecord> {
    const response = await requestJson<BackendStoryResponse>('/stories', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
    });

    return normalizeStory(response);
  },
};
