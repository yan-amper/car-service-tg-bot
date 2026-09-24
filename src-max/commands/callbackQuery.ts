import { Keyboard } from '@maxhub/max-bot-api';
import { ProductsApi, RequestData } from '../api';
import { warrantiesMenu, WarrantyAction } from '../buttons';
import { bot } from '../config';
import {
  ackCallback,
  createImagePath,
  editMessageText,
  goBackMenu,
  getUserId,
  logError,
  notifyAdmins,
  selectBatteryLastStep,
} from '../lib';
import { batterySelectSteps, newBroadcastSteps, requestSteps, textState } from './state';
import { BatteryRequestService, BroadcastService, WarrantyService } from '../services';

bot.on('message_callback', async (ctx) => {
  const data = ctx.callback?.payload;
  if (!data) return;

  const userId = getUserId(ctx);
  if (!userId) return;

  // — warranty action- ——————————————————————————————————————————
  if (data.startsWith('action-')) {
    const action = data.split('-')[1] as WarrantyAction;

    await ackCallback(ctx);
    await editMessageText(ctx, '⏳ Загружаем гарантии...');

    try {
      const warranties = await WarrantyService.getByUser(userId);

      if (warranties.length === 0) {
        return await editMessageText(
          ctx,
          '📅 У вас нет зарегистрированных гарантийных сроков',
          goBackMenu('warranty_toggle'),
        );
      }

      const text = action === 'pause' ? '🔕 Отключить до следующего ТО' : '🚫 Сбросить гарантию';
      return await editMessageText(ctx, text, warrantiesMenu(warranties, action));
    } catch (e) {
      logError(e, 'Failed to fetch warranties');
      return await editMessageText(
        ctx,
        '❌ Произошла ошибка при загрузке гарантий',
        goBackMenu('warranty_toggle'),
      );
    }
  }

  // — warranty- ——————————————————————————————————————————————
  if (data.startsWith('warranty-')) {
    const args = data.split('-');
    const action = args[1] as WarrantyAction;
    const warrantyId = +args[2];

    await ackCallback(ctx);

    if (action === 'pause') {
      try {
        const result = await WarrantyService.pause(warrantyId, userId);

        if (!result)
          return await editMessageText(
            ctx,
            '❌ Гарантия не найдена',
            goBackMenu('warranty_toggle'),
          );

        return await editMessageText(
          ctx,
          `🔕 <b>Уведомления отключены до следующего ТО</b>\nНапоминания приостановлены, для выбранного АКБ\nСледующие уведомления придут за 20 дней и 10 дней до следующего планового осмотра.`,
          goBackMenu('warranty_toggle'),
        );
      } catch (e) {
        logError(e, 'Failed to pause warranty', { warrantyId, userId });
        return await editMessageText(
          ctx,
          '❌ Произошла ошибка при отключении уведомления',
          goBackMenu('warranty_toggle'),
        );
      }
    }

    if (action === 'disable') {
      try {
        await WarrantyService.disable(warrantyId);
        return await editMessageText(
          ctx,
          `🚫 <b>Уведомления отключены навсегда</b>\nНапоминания по этому аккумулятору отключены.\nМы остаёмся на связи — если что, пишите! ⚡️`,
          goBackMenu('warranty_toggle'),
        );
      } catch (e) {
        logError(e, 'Failed to remove warranty', { warrantyId, userId });
        return await editMessageText(
          ctx,
          '❌ Произошла ошибка при отключении уведомления',
          goBackMenu('warranty_toggle'),
        );
      }
    }
  }

  // — skip engine volume ——————————————————————————————————————
  if (data === 'skip_engine_volume') {
    await ackCallback(ctx);
    const requestData = requestSteps.get(userId);
    requestSteps.set(userId, { ...requestData, step: 'production_year' });
    await ctx.reply('Введите год выпуска');
    return;
  }

  // — step: engine type ——————————————————————————————————————
  if (data === 'step:engine:petrol' || data === 'step:engine:diesel') {
    await ackCallback(ctx);
    const engineType = data === 'step:engine:petrol' ? 'petrol' : 'diesel';
    const requestData = requestSteps.get(userId);

    if (requestSteps.get(userId)?.step !== 'engine_type') return;

    requestSteps.set(userId, { ...requestData, step: 'engine_volume', engine_type: engineType });

    await ctx.reply('Введите объём двигателя (например, 1.6)', {
      attachments: [
        Keyboard.inlineKeyboard([[Keyboard.button.callback('Пропустить', 'skip_engine_volume')]]),
      ],
    });
    return;
  }

  // — step: delivery method ———————————————————————————————————
  if (data === 'step:delivery:delivery' || data === 'step:delivery:pickup') {
    await ackCallback(ctx);
    const deliveryMethod = data === 'step:delivery:delivery' ? 'delivery' : 'pickup';
    const requestData = requestSteps.get(userId);

    if (requestSteps.get(userId)?.step !== 'delivery_method') return;

    requestSteps.set(userId, {
      ...requestData,
      step: 'delivery_method',
      delivery_method: deliveryMethod,
      max_user_id: userId.toString(),
    });

    const result = requestSteps.get(userId);
    if (!result) return;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { step, ...reqData } = result;
    const request = await BatteryRequestService.create(reqData as RequestData);

    if (typeof request === 'string') {
      await ctx.reply('❌ Произошла ошибка при создании заявки');
      return;
    }

    await ctx.reply(
      `Готово! 🎉\nМенеджер свяжется с вами в ближайшее время, для вас подберём подходящие аккумуляторы.\n\nЕсли вопрос с поиском ещё актуален, ждём — скоро свяжется менеджер.🤝`,
    );

    notifyAdmins(BatteryRequestService.buildNotificationText(request));

    textState.delete(userId);
    requestSteps.delete(userId);
    return;
  }

  // — step: broadcast time ————————————————————————————————————
  if (data === 'step:time:0900' || data === 'step:time:1700') {
    await ackCallback(ctx);
    const timeStr = data === 'step:time:0900' ? '09:00' : '17:00';
    const userStep = newBroadcastSteps.get(userId);

    if (userStep?.step !== 'time') return;

    const date = userStep.date;
    if (!date || !userStep.messageText) return;

    try {
      await BroadcastService.create(userStep.messageText, date, timeStr as '09:00' | '17:00');
    } catch (e) {
      logError(e, 'Failed to add new broadcast');
      return await ctx.reply('❌ Произошла ошибка при создании рассылки');
    }

    await ctx.reply(`Рассылка запланирована на ${timeStr} по МСК`);
    textState.delete(userId);
    newBroadcastSteps.delete(userId);
    return;
  }

  // — step: battery confirm ———————————————————————————————————
  if (data === 'step:confirm:no') {
    await ackCallback(ctx);
    textState.delete(userId);
    batterySelectSteps.delete(userId);
    return;
  }

  if (data === 'step:confirm:yes') {
    await ackCallback(ctx);
    const batterySelectData = batterySelectSteps.get(userId);
    batterySelectSteps.set(userId, { ...batterySelectData, step: 'phone' });

    await ctx.reply('Поделитесь номером телефона для связи или введите вручную в формате +7', {
      attachments: [
        Keyboard.inlineKeyboard([
          [Keyboard.button.requestContact('📱 Поделиться номером телефона')],
        ]),
      ],
    });
    return;
  }

  // — select battery ——————————————————————————————————————————
  if (data.startsWith('select-battery-')) {
    await ackCallback(ctx);
    const requestId = +data.split('-')[2];
    const batteryId = +data.split('-')[3];

    const { data: request, error } = await BatteryRequestService.getById(requestId);
    const product = await ProductsApi.getProductById(batteryId);

    if (error || !request) return await ctx.reply('Произошла ошибка, попробуйте ещё раз');
    if (request.status === 'completed' || request.status === 'cancelled')
      return await ctx.reply('Заявка была завершена или отменена');
    if (request.address) return await ctx.reply('Вы уже выбрали аккумулятор для этой заявки');

    const batteryText = `${product.title}

Ёмкость: ${product.capacity}
Пусковой ток: ${product.current}
Полярность: ${product.polarity}
Габариты: ${product.longitude}x${product.width}x${product.height}
Изготовитель: ${product.manufacturer}
Обычная цена: ${product.standardPrice} ₽
Цена со сдачей: ${product.priceWithChange} ₽`;

    const batterySelectData = batterySelectSteps.get(userId);
    textState.set(userId, 'select_battery');
    batterySelectSteps.set(userId, {
      ...batterySelectData,
      step: 'confirm',
      battery: batteryText,
      id: requestId,
      delivery_method: request.delivery_method,
    });

    const confirmKeyboard = Keyboard.inlineKeyboard([
      [
        Keyboard.button.callback('Да', 'step:confirm:yes'),
        Keyboard.button.callback('Нет', 'step:confirm:no'),
      ],
    ]);

    try {
      const image = await ctx.api.uploadImage({ url: createImagePath(product.image) });
      return await ctx.reply(`Вы выбрали\n\n${batteryText}\n\nПодтверждаете свой выбор?`, {
        attachments: [image.toJson(), confirmKeyboard],
      });
    } catch {
      return await ctx.reply(`Вы выбрали\n\n${batteryText}\n\nПодтверждаете свой выбор?`, {
        attachments: [confirmKeyboard],
      });
    }
  }

  await ackCallback(ctx);
  await editMessageText(ctx, '❌ Неверная команда', goBackMenu('menu_main'));
});
