import { Keyboard } from '@maxhub/max-bot-api';
import { bot } from '../config';
import { ackCallback, editMessageText } from '../lib';

const notificationsMenu = () =>
  Keyboard.inlineKeyboard([
    [Keyboard.button.callback('🔕 Отключить до следующего ТО', 'action-pause')],
    [Keyboard.button.callback('🚫 Сбросить гарантию', 'action-disable')],
    [Keyboard.button.callback('↩️ Назад', 'service')],
  ]);

bot.action('warranty_toggle', async (ctx) => {
  await ackCallback(ctx);
  await editMessageText(ctx, '🔔 Отключить/включить напоминания', notificationsMenu());
});
