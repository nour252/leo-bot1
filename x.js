const { Markup } = require('telegraf');

function setupXHandler(bot, db, ADMIN_CHAT_ID, userState) {

    // 1. القائمة الرئيسية لقسم إكس (تويتر)
    bot.action('plat_x', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'x_service_type' };

        await ctx.reply(
            `✖️ **اختر نوع خدمة إكس (تويتر) المطلوبة:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('👥 زيادة متابعين تويتر / إكس ', 'x_followers')],
                    [Markup.button.callback('❤️ لايكات تغريدات تويتر ', 'x_likes')],
                    [Markup.button.callback('👁️ مشاهدات تغريدات تويتر ', 'x_views')],
                    [Markup.button.callback('⬅️ رجوع للمنصات', 'type_rashq')]
                ])
            }
        );
    });

    // ==========================================
    // أ) قسم متابعين تويتر (أقل طلب 10)
    // ==========================================
    bot.action('x_followers', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_x_package' };

        await ctx.reply(
            `👥 **اختر خدمة متابعين تويتر / إكس:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ أرخص خدمة متابعين تويتر + ضمان (الـ 1000 بـ 900 ج) - أدنى 10', 'pkg_x_f1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_x')]
                ])
            }
        );
    });

    // ==========================================
    // ب) قسم لايكات تويتر (أقل طلب 100 افتراضياً)
    // ==========================================
    bot.action('x_likes', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_x_package' };

        await ctx.reply(
            `❤️ **اختر خدمة لايكات تويتر / إكس:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ لايكات تغريدات + ضمان + تعويض وإلغاء مفعل (الـ 1000 بـ 300 ج) - أدنى 100', 'pkg_x_l1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_x')]
                ])
            }
        );
    });

    // ==========================================
    // ج) قسم مشاهدات تويتر (أقل طلب 100)
    // ==========================================
    bot.action('x_views', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_x_package' };

        await ctx.reply(
            `👁️ **اختر خدمة مشاهدات تغريدات تويتر:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ مشاهدات تغريدات (الأرخص) + تنفيذ فوري (الـ 1000 بـ 5 ج) - أدنى 100', 'pkg_x_v1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_x')]
                ])
            }
        );
    });

    // ==========================================
    // معالجة اختيار الباقات والأسعار والكميات
    // ==========================================
    bot.action(/pkg_x_(.+)/, async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const pkgKey = ctx.match[1];
        
        let pricePer1k = 900;
        let minQty = 10;
        let pkgName = '';

        switch (pkgKey) {
            // المتابعين
            case 'f1': pricePer1k = 900; minQty = 10; pkgName = 'أرخص خدمة متابعين تويتر / إكس + ضمان'; break;

            // اللايكات
            case 'l1': pricePer1k = 300; minQty = 100; pkgName = 'لايكات تغريدات تويتر + ضمان + تعويض'; break;

            // المشاهدات
            case 'v1': pricePer1k = 5; minQty = 100; pkgName = 'مشاهدات تغريدات تويتر (الأرخص) + تنفيذ فوري'; break;
        }

        userState[ctx.from.id] = { 
            step: 'waiting_quantity', 
            platform: 'x', 
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

module.exports = { setupXHandler };