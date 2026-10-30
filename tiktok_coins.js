const { Markup } = require('telegraf');

function setupTikTokCoinsHandler(bot, db, ADMIN_CHAT_ID, userState) {

    bot.action('plat_tiktok_coins', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_tiktok_coins_package' };

        await ctx.reply(
            `🪙 **اختر باقة عملات تيك توك المطلوبة:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ باقة 70 عملة تيك توك 🪙', 'pkg_tkc_70')],
                    [Markup.button.callback('2️⃣ باقة 350 عملة تيك توك 🪙', 'pkg_tkc_350')],
                    [Markup.button.callback('3️⃣ باقة 700 عملة تيك توك 🪙', 'pkg_tkc_700')],
                    [Markup.button.callback('4️⃣ باقة 1,400 عملة تيك توك 🪙', 'pkg_tkc_1400')],
                    [Markup.button.callback('5️⃣ باقة 3,500 عملة تيك توك 🪙', 'pkg_tkc_3500')],
                    [Markup.button.callback('6️⃣ باقة 7,000 عملة تيك توك 🪙', 'pkg_tkc_7000')],
                    [Markup.button.callback('⬅️ رجوع لخدمات الشحن', 'type_shahn')]
                ])
            }
        );
    });

    bot.action(/pkg_tkc_(.+)/, async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const pkgKey = ctx.match[1];

        let totalPrice = 0;
        let pkgName = '';

        switch (pkgKey) {
            case '70': totalPrice = 65; pkgName = 'شحن 70 عملة تيك توك 🪙'; break;
            case '350': totalPrice = 320; pkgName = 'شحن 350 عملة تيك توك 🪙'; break;
            case '700': totalPrice = 640; pkgName = 'شحن 700 عملة تيك توك 🪙'; break;
            case '1400': totalPrice = 1280; pkgName = 'شحن 1,400 عملة تيك توك 🪙'; break;
            case '3500': totalPrice = 3200; pkgName = 'شحن 3,500 عملة تيك توك 🪙'; break;
            case '7000': totalPrice = 6400; pkgName = 'شحن 7,000 عملة تيك توك 🪙'; break;
        }

        // نخلي الـ step بدل ما تطلب رابط، تطلب طريقة التواصل
        userState[ctx.from.id] = { 
            step: 'waiting_tiktok_coins_contact', 
            platform: 'tiktok_coins', 
            service: pkgName, 
            totalPrice: totalPrice,
            quantity: 1 
        };

        await ctx.reply(
            `📦 **لقد اخترت:** ${pkgName}\n💰 **السعر الإجمالي:** ${totalPrice} جنيه مصري.\n\n💬 أرسل الآن **طريقة التواصل معك** (مثل يوزر تليجرام @username أو رقمك) لكي يتواصل معك الدعم لإتمام الشحن:`,
            { parse_mode: 'Markdown' }
        );
    });
}

module.exports = { setupTikTokCoinsHandler };