import { bot } from '../config';
import { ackCallback, getUserId } from '../lib';
import { requestSteps, textState } from './state';

bot.action('battery_request', async (ctx) => {
  await ackCallback(ctx);
  const userId = getUserId(ctx);
  if (!userId) return;

  textState.set(userId, 'battery_request');
  requestSteps.set(userId, { step: 'car_brand' });
  await ctx.reply('Введите марку автомобиля');
});
