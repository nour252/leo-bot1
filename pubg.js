const { Markup } = require('telegraf');

function setupPubgHandler(bot, db, ADMIN_CHAT_ID, userState) {

    bot.action('plat_pubg', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_pubg_package' };

        await ctx.reply(
            `🎮 **اختر باقة شدات ببجي (UC) المطلوبة:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ 60 شدة (60 UC) 🎮', 'pkg_pubg_60')],
                    [Markup.button.callback('2️⃣ 325 شدة (325 UC) 🎮', 'pkg_pubg_325')],
                    [Markup.button.callback('3️⃣ 660 شدة (660 UC) 🎮', 'pkg_pubg_660')],
                    [Markup.button.callback('4️⃣ 1,800 شدة (1,800 UC) 🎮', 'pkg_pubg_1800')],
                    [Markup.button.callback('5️⃣ 3,850 شدة (3,850 UC) 🎮', 'pkg_pubg_3850')],
                    [Markup.button.callback('6️⃣ 8,100 شدة (8,100 UC) 🎮', 'pkg_pubg_8100')],
                    [Markup.button.callback('⬅️ رجوع لخدمات الشحن', 'type_shahn')]
                ])
            }
        );
    });

    bot.action(/pkg_pubg_(.+)/, async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const pkgKey = ctx.match[1];

        let totalPrice = 0;
        let pkgName = '';

        switch (pkgKey) {
            case '60': totalPrice = 55; pkgName = 'شحن 60 شدة ببجي (60 UC) 🎮'; break;
            case '325': totalPrice = 270; pkgName = 'شحن 325 شدة ببجي (325 UC) 🎮'; break;
            case '660': totalPrice = 530; pkgName = 'شحن 660 شدة ببجي (660 UC) 🎮'; break;
            case '1800': totalPrice = 1350; pkgName = 'شحن 1,800 شدة ببجي (1800 UC) 🎮'; break;
            case '3850': totalPrice = 2700; pkgName = 'شحن 3,850 شدة ببجي (3850 UC) 🎮'; break;
            case '8100': totalPrice = 5300; pkgName = 'شحن 8,100 شدة ببجي (8100 UC) 🎮'; break;
        }

        // نخلي الـ step تطلب الايدي واسم اللاعب
        userState[ctx.from.id] = { 
            step: 'waiting_pubg_details', 
            platform: 'pubg', 
            service: pkgName, 
            totalPrice: totalPrice,
            quantity: 1 
        };

        await ctx.reply(
            `📦 **لقد اخترت:** ${pkgName}\n💰 **السعر الإجمالي:** ${totalPrice} جنيه مصري.\n\n🎮 أرسل الآن **الايدي (Player ID) وبعدها اسم اللاعب** (في رسالة واحدة):`,
            { parse_mode: 'Markdown' }
        );
    });
}

module.exports = { setupPubgHandler };