import { Keyboard } from '@maxhub/max-bot-api';
import { bot } from '../config';
import { akbReplies, contactReplies } from '../text';
import { ackCallback, editMessageText, goBackMenu, pinMessage } from '../lib';
import { mainMenu } from '../buttons';

bot.command('menu', async (ctx) => {
  const msg = await ctx.reply('📋 Главное меню:', { attachments: [mainMenu()] });
  await pinMessage(ctx, msg.body.mid);
});

bot.action('menu_main', async (ctx) => {
  await ackCallback(ctx);
  await editMessageText(ctx, '📋 Главное меню:', mainMenu());
});

bot.action('menu_akb', async (ctx) => {
  await ackCallback(ctx);
  await editMessageText(
    ctx,
    '🔋 Всё про АКБ:',
    Keyboard.inlineKeyboard([
      [
        Keyboard.button.callback('🔧 Неисправности', 'faults'),
        Keyboard.button.callback('📋 Правила эксплуатации', 'rules'),
      ],
      [
        Keyboard.button.callback('🔍 Проверка состояния', 'check'),
        Keyboard.button.callback('⚡️ Зарядка', 'charging'),
      ],
      [
        Keyboard.button.callback('🔄 Замена', 'replacement'),
        Keyboard.button.callback('❄️☀️ Температура', 'temperature'),
      ],
      [
        Keyboard.button.callback('🔌 Нагрузки', 'load'),
        Keyboard.button.callback('✅ Качество', 'quality'),
      ],
      [
        Keyboard.button.callback('⚙️ Совместимость', 'compatibility'),
        Keyboard.button.callback('🌡️ Подготовка', 'season'),
      ],
      [
        Keyboard.button.callback('📦 Хранение', 'storage'),
        Keyboard.button.callback('⚖️ Сравнение', 'compare'),
      ],
      [Keyboard.button.callback('↩️ Назад', 'menu_main')],
    ]),
  );
});

bot.action('menu_contact', async (ctx) => {
  await ackCallback(ctx);
  await editMessageText(
    ctx,
    '📞 Связаться с нами:',
    Keyboard.inlineKeyboard([
      [Keyboard.button.callback('📍 Адрес магазина', 'contact_address')],
      [Keyboard.button.callback('📞 Позвонить', 'contact_call')],
      [
        Keyboard.button.link(
          '💬 Написать менеджеру',
          'https://max.ru/u/f9LHodD0cOKLHCZk18AOZM_hjxRDNYrC1znqcZaQSSMzyual6x-Nmw6t86g',
        ),
      ],
      [Keyboard.button.callback('↩️ Назад', 'menu_main')],
    ]),
  );
});

for (const [key, message] of Object.entries(akbReplies)) {
  bot.action(key, async (ctx) => {
    await ackCallback(ctx);
    await editMessageText(
      ctx,
      message,
      Keyboard.inlineKeyboard([
        [Keyboard.button.callback('↩️ Назад', 'menu_akb')],
        [Keyboard.button.callback('🏠 Главное меню', 'menu_main')],
      ]),
    );
  });
}

for (const [key, message] of Object.entries(contactReplies)) {
  bot.action(key, async (ctx) => {
    await ackCallback(ctx);
    await editMessageText(
      ctx,
      message,
      Keyboard.inlineKeyboard([
        [Keyboard.button.callback('↩️ Назад', 'menu_contact')],
        [Keyboard.button.callback('🏠 Главное меню', 'menu_main')],
      ]),
    );
  });
}

bot.action('promotions', async (ctx) => {
  await ackCallback(ctx);
  await editMessageText(
    ctx,
    `<b>🎁 Акции и скидки</b>

<b>1) 🪫 Сдай старый АКБ — получи скидку на новый!</b>
Сдайте старые аккумуляторы и получите скидку на новые!
Принимаем отработанные АКБ по честным ценам.
За аккумулятором — в Аккумуляторный центр <b>АМПЕР</b>!

<b>2) 🔌 Бесплатная забота о твоём АКБ</b>
Купил аккумулятор у нас?
Значит, обслуживание — за наш счёт:
— Проверим АКБ бесплатно  
— При необходимости подзарядим  
— Предоставим подменный АКБ при необходимости  
📍 Таганрог, Мариупольское шоссе, 1

<b>3) ♻️ Повышенный тариф утилизации</b>
Обновлённый тариф на сдачу старых АКБ:
— При покупке нового АКБ BATHOFF или ВЛАДАР  
— Вы получаете повышенный тариф на сдачу старого  
♻️ Это:
— Выгодно  
— Экологично  
— Удобно  

📌 Подробнее — <a href="https://max.ru/u/f9LHodD0cOKLHCZk18AOZM_hjxRDNYrC1znqcZaQSSMzyual6x-Nmw6t86g">связаться с админом</a>`,
    goBackMenu('menu_main'),
  );
});

bot.action('service', async (ctx) => {
  await ackCallback(ctx);
  await editMessageText(
    ctx,
    `📅 <b>ТО и Гарантия</b>\nПокупал АКБ с расширенной гарантией? Тогда не забывай приезжать на ТО! Всё просто — напоминания приходят заранее.`,
    Keyboard.inlineKeyboard([
      [Keyboard.button.callback('📆 Когда следующее ТО?', 'warranty_next_to')],
      [Keyboard.button.callback('🔔 Отключить/включить напоминания', 'warranty_toggle')],
      [Keyboard.button.callback('🛡️ Как работает расширенная гарантия', 'warranty_how')],
      [Keyboard.button.callback('📌 Что будет, если пропустить', 'warranty_skip')],
      [Keyboard.button.callback('↩️ Назад', 'menu_main')],
    ]),
  );
});

bot.action('warranty_how', async (ctx) => {
  await ackCallback(ctx);
  await editMessageText(
    ctx,
    `🔧 <b>Расширенная гарантия — что это такое?</b>

Дополнительная гарантия — это как усиленная броня для вашего аккумулятора. Она может продлить срок гарантии до 3-4 лет, но действует на особых условиях.

🛠 <b>Чтобы сохранить расширенную гарантию, нужно:</b>
✔️ Приезжать к нам на бесплатное ТО каждые 3 месяца с момента покупки.
✔️ Мы проверим аккумулятор, генератор, состояние клемм и сделаем отметку в гарантийном талоне.

📌 <b>Важно знать:</b>
Если вы пропускаете ТО, расширенная гарантия прекращает своё действие.
❗️ Но базовая гарантия (1 год) остаётся в любом случае — она не зависит от ТО.

💬 <b>Не хотите потерять расширенную гарантию?
Амперыч напомнит заранее, когда пора на ТО!</b>📅`,
    goBackMenu('service'),
  );
});

bot.action('warranty_skip', async (ctx) => {
  await ackCallback(ctx);
  await editMessageText(
    ctx,
    `🔧 <b>Что будет если пропустить ТО</b>? 
Если вы не приедете на ТО в указанный срок (например, спустя 3 месяца после покупки), расширенная гарантия аннулируется. В этом случае останется только базовая гарантия —  1 год.

📉 <b>Риск выхода из строя без замены по гарантии спустя год.</b>
Даже если аккумулятор выйдет из строя по вине завода-изготовителя, при пропущенном ТО вам могут отказать в замене.

⚠️ <b>Не выявленные проблемы</b>
ТО позволяет выявить мелкие неисправности и предотвратить серьёзные. Без диагностики можно упустить начало сульфатации, проблемы с клеммами или нестабильную работу генератора.

🧠 <b>Вывод</b>
Проще заехать на 5 минут, чем потом спорить по гарантии или покупать новый аккумулятор.

📍 ТО бесплатно, и без записи.
<b>Адрес: г. Таганрог, Мариупольское шоссе, 1
📞 8-989-722-80-95 — позвоните и мы ответим на любой вопрос.</b>`,
    goBackMenu('service'),
  );
});

bot.action('faq', async (ctx) => {
  await ackCallback(ctx);
  await editMessageText(
    ctx,
    `📌 <b>Часто задаваемые вопросы</b>

❓ <b>1. Сколько должен служить аккумулятор?</b>
Средний срок службы АКБ — от 4 до 5 лет или около 60–80 тыс. км пробега.
Но всё зависит от условий эксплуатации и качества аккумулятора.

❓ <b>2. На что обратить внимание при покупке?</b>
Дата производства — не должен быть старше 12 месяцев.
Целостность корпуса и клемм.
Уточните: подойдёт ли аккумулятор к вашему авто. (размеры, полярность)

❓ <b>3. Нужно ли заряжать новый АКБ?</b>
Если аккумулятор свежий (менее 6–12 месяцев), подзарядка не обязательна.
Но небольшая дозарядка всегда будет полезной.

❓ <b>4. Выдаёте чек и гарантийный талон?</b>
Обязательно! Мы всегда даём:
🧾 Чек
🛡️ Гарантийный талон
Сохраняйте их на весь срок гарантии.

❓ <b>5. Что входит в гарантию?</b>
📌 Заводской брак:
— короткое замыкание банки
— обрыв цепи

⛔️ Не входит:
— глубокий разряд
— механические повреждения
— осыпание активной массы (неправильная эксплуатация)`,
    goBackMenu('menu_main'),
  );
});
