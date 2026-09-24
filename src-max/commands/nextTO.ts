import { bot } from '../config';
import { ackCallback, editMessageText, formatDate, goBackMenu, getUserId } from '../lib';
import { WarrantyService } from '../services';

bot.action('warranty_next_to', async (ctx) => {
  await ackCallback(ctx);
  const userId = getUserId(ctx);
  if (!userId) return;

  const warranties = await WarrantyService.getByUser(userId);

  if (warranties.length === 0)
    return await editMessageText(ctx, 'У вас нет активных гарантий.', goBackMenu('service'));

  const nextTODates = WarrantyService.getNextTODates(warranties);

  let message = 'Ближайшее ТО по каждому аккумулятору:\n\n';

  for (const { batteryName, nextTO } of nextTODates) {
    message += `🔋 ${batteryName} — ${formatDate(nextTO, false)}\n`;
  }

  message += '\nБот уведомит вас заранее, чтобы не забыть отметиться.';
  await editMessageText(ctx, message, goBackMenu('service'));
});
