const { Markup } = require('telegraf');

function setupTelegramHandler(bot, db, ADMIN_CHAT_ID, userState) {

    // 1. القائمة الرئيسية لقسم تليجرام
    bot.action('plat_telegram', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'telegram_service_type' };

        await ctx.reply(
            `✈️ **اختر نوع خدمة تليجرام المطلوبة:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('👥 زيادة مشتركين تليجرام (قنوات وجروبات) ', 'tg_subscribers')],
                    [Markup.button.callback('👁️ مشاهدات منشورات تليجرام ', 'tg_views')],
                    [Markup.button.callback('⬅️ رجوع للمنصات', 'type_rashq')]
                ])
            }
        );
    });

    // ==========================================
    // أ) قسم مشتركين تليجرام (أقل طلب 100 افتراضياً)
    // ==========================================
    bot.action('tg_subscribers', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_telegram_package' };

        await ctx.reply(
            `👥 **اختر خدمة مشتركين تليجرام:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ زيادة مشتركين (قنوات وجروبات) + ضمان (الـ 1000 بـ 50 ج) - أدنى 100', 'pkg_tg_s1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_telegram')]
                ])
            }
        );
    });

    // ==========================================
    // ب) قسم مشاهدات تليجرام (أقل طلب 100)
    // ==========================================
    bot.action('tg_views', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_telegram_package' };

        await ctx.reply(
            `👁️ **اختر خدمة مشاهدات منشورات تليجرام:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ مشاهدات منشور + رخيصة وسريعة وممتازة (الـ 1000 بـ 3 ج) - أدنى 100', 'pkg_tg_v1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_telegram')]
                ])
            }
        );
    });

    // ==========================================
    // معالجة اختيار الباقات والأسعار والكميات
    // ==========================================
    bot.action(/pkg_tg_(.+)/, async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const pkgKey = ctx.match[1];
        
        let pricePer1k = 50;
        let minQty = 100; // أقل طلب 100 افتراضياً
        let pkgName = '';

        switch (pkgKey) {
            // المشتركين
            case 's1': pricePer1k = 50; minQty = 100; pkgName = 'زيادة مشتركين تليجرام (قنوات وجروبات) + ضمان'; break;

            // المشاهدات
            case 'v1': pricePer1k = 3; minQty = 100; pkgName = 'مشاهدات منشور تليجرام (رخيصة وسريعة وممتازة)'; break;
        }

        userState[ctx.from.id] = { 
            step: 'waiting_quantity', 
            platform: 'telegram', 
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

module.exports = { setupTelegramHandler };