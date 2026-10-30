const { Markup } = require('telegraf');

function setupYoutubeHandler(bot, db, ADMIN_CHAT_ID, userState) {

    // 1. القائمة الرئيسية لقسم يوتيوب
    bot.action('plat_youtube', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'youtube_service_type' };

        await ctx.reply(
            `▶️ **اختر نوع خدمة يوتيوب المطلوبة:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('👥 زيادة مشتركين يوتيوب (تحقيق الشروط) ', 'yt_subscribers')],
                    [Markup.button.callback('❤️ لايكات يوتيوب (مع التعويض) ', 'yt_likes')],
                    [Markup.button.callback('👁️ مشاهدات يوتيوب (ضمان مدى الحياة) ', 'yt_views')],
                    [Markup.button.callback('📡 مشاهدات بث مباشر (فوري) ', 'yt_live')],
                    [Markup.button.callback('⬅️ رجوع للمنصات', 'type_rashq')]
                ])
            }
        );
    });

    // ==========================================
    // أ) قسم مشتركين يوتيوب (أقل طلب 10)
    // ==========================================
    bot.action('yt_subscribers', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_youtube_package' };

        await ctx.reply(
            `👥 **اختر خدمة مشتركين يوتيوب:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ مشتركين لتحقيق الشروط + ضمان + تعويض (الـ 1000 بـ 700 ج) - أدنى 10', 'pkg_yt_s1')],
                    [Markup.button.callback('2️⃣ مشتركين عرب 100% متفاعلين + لتحقيق الدخل + ضمان (الـ 1000 بـ 800 ج) - أدنى 10', 'pkg_yt_s2')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_youtube')]
                ])
            }
        );
    });

    // ==========================================
    // ب) قسم لايكات يوتيوب (أقل طلب 100)
    // ==========================================
    bot.action('yt_likes', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_youtube_package' };

        await ctx.reply(
            `❤️ **اختر خدمة لايكات يوتيوب:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ لايكات سريعة جداً + تعويض مفعل + ضمان (الـ 1000 بـ 70 ج) - أدنى 100', 'pkg_yt_l1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_youtube')]
                ])
            }
        );
    });

    // ==========================================
    // ج) قسم مشاهدات يوتيوب (أقل طلب 100)
    // ==========================================
    bot.action('yt_views', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_youtube_package' };

        await ctx.reply(
            `👁️ **اختر خدمة مشاهدات يوتيوب:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ مشاهدات يوتيوب + ضمان مدى الحياة (الـ 1000 بـ 100 ج) - أدنى 100', 'pkg_yt_v1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_youtube')]
                ])
            }
        );
    });

    // ==========================================
    // د) قسم البث المباشر (أقل طلب 100)
    // ==========================================
    bot.action('yt_live', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_youtube_package' };

        await ctx.reply(
            `📡 **اختر خدمة البث المباشر يوتيوب:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ مشاهدات بث مباشر (الأرخص على الاطلاق) - فوري (الـ 1000 بـ 60 ج) - أدنى 100', 'pkg_yt_liv1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_youtube')]
                ])
            }
        );
    });

    // ==========================================
    // معالجة اختيار الباقات والأسعار والكميات
    // ==========================================
    bot.action(/pkg_yt_(.+)/, async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const pkgKey = ctx.match[1];
        
        let pricePer1k = 700;
        let minQty = 10;
        let pkgName = '';

        switch (pkgKey) {
            // المشتركين (أقل طلب 10)
            case 's1': pricePer1k = 700; minQty = 10; pkgName = 'مشتركين يوتيوب لتحقيق الشروط + ضمان + تعويض'; break;
            case 's2': pricePer1k = 800; minQty = 10; pkgName = 'مشتركين يوتيوب عرب متفاعلين + لتحقيق الدخل + ضمان'; break;

            // اللايكات (أقل طلب 100)
            case 'l1': pricePer1k = 70; minQty = 100; pkgName = 'لايكات يوتيوب سريعة جداً + تعويض + ضمان'; break;

            // المشاهدات (أقل طلب 100)
            case 'v1': pricePer1k = 100; minQty = 100; pkgName = 'مشاهدات يوتيوب + ضمان مدى الحياة'; break;

            // البث المباشر (أقل طلب 100)
            case 'liv1': pricePer1k = 60; minQty = 100; pkgName = 'مشاهدات بث مباشر يوتيوب (الأرخص) - فوري'; break;
        }

        userState[ctx.from.id] = { 
            step: 'waiting_quantity', 
            platform: 'youtube', 
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

module.exports = { setupYoutubeHandler };