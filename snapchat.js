const { Markup } = require('telegraf');

function setupSnapHandler(bot, db, ADMIN_CHAT_ID, userState) {

    // 1. القائمة الرئيسية لقسم سناب شات
    bot.action('plat_snap', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'snap_service_type' };

        await ctx.reply(
            `👻 **اختر نوع خدمة سناب شات المطلوبة:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('👥 متابعون سناب شات (حسابات عربية) ', 'snap_followers')],
                    [Markup.button.callback('⬅️ رجوع للمنصات', 'type_rashq')]
                ])
            }
        );
    });

    // ==========================================
    // أ) قسم متابعون سناب شات (أقل طلب 1000 حسب طلبك)
    // ==========================================
    bot.action('snap_followers', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_snap_package' };

        await ctx.reply(
            `👥 **اختر خدمة متابعون سناب شات:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ متابعون سناب شات [حسابات عربية] (الـ 1000 بـ 1500 ج) - أدنى 1000', 'pkg_snap_f1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_snap')]
                ])
            }
        );
    });

    // ==========================================
    // معالجة اختيار الباقات والأسعار والكميات
    // ==========================================
    bot.action(/pkg_snap_(.+)/, async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const pkgKey = ctx.match[1];
        
        let pricePer1k = 1500;
        let minQty = 1000; // أقل طلب 1000 حسب طلبك
        let pkgName = '';

        switch (pkgKey) {
            case 'f1': 
                pricePer1k = 1500; 
                minQty = 1000; 
                pkgName = 'متابعون سناب شات [حسابات عربية]'; 
                break;
        }

        userState[ctx.from.id] = { 
            step: 'waiting_quantity', 
            platform: 'snap', 
            service: pkgName, 
            pricePer1k: pricePer1k, 
            minQty: minQty 
        };

        await ctx.reply(
            `📦 **لقد اخترت:** ${pkgName}\n💰 **السعر:** ${pricePer1k} جنيه لكل 1000\n📉 **أقل طلب مسموح:** ${minQty}\n\nأرسل الآن **الكمية المطلوبة** (أرقام فقط):`,
            { parse_mode: 'Markdown' }
        );
    });
}

module.exports = { setupSnapHandler };