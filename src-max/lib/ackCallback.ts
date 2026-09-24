import { Context } from '@maxhub/max-bot-api';

// Max API still accepts `notification`, but 0.3 typings dropped it
export const ackCallback = (ctx: Context) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx.answerOnCallback({ notification: '' } as any);
