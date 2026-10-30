const { Markup } = require('telegraf');

function setupInstagramHandler(bot, db, ADMIN_CHAT_ID, userState) {

    // 1. القائمة الرئيسية لقسم إنستجرام
    bot.action('plat_instagram', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'instagram_service_type' };

        await ctx.reply(
            `📸 **اختر نوع خدمة إنستجرام المطلوبة:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('👥 زيادة متابعين إنستجرام ', 'ig_followers')],
                    [Markup.button.callback('❤️ لايكات إنستجرام ', 'ig_likes')],
                    [Markup.button.callback('👁️ مشاهدات إنستجرام ', 'ig_views')],
                    [Markup.button.callback('🔄 خدمات أخرى (ريبوست، شير، حفظ) ', 'ig_others')],
                    [Markup.button.callback('⬅️ رجوع للمنصات', 'type_rashq')]
                ])
            }
        );
    });

    // ==========================================
    // أ) قسم متابعين إنستجرام
    // ==========================================
    bot.action('ig_followers', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_instagram_package' };

        await ctx.reply(
            `👥 **اختر نوع خدمة متابعين إنستجرام:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ أرخص خدمة متابعين (الـ 1000 بـ 160 ج) - أدنى 10', 'pkg_ig_f1')],
                    [Markup.button.callback('2️⃣ الأكثر طلباً + ضمان (الـ 1000 بـ 220 ج) - أدنى 10', 'pkg_ig_f2')],
                    [Markup.button.callback('3️⃣ متابعين عرب + متفاعلين + ضمان (الـ 1000 بـ 350 ج) - أدنى 1000', 'pkg_ig_f3')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_instagram')]
                ])
            }
        );
    });

    // ==========================================
    // ب) قسم لايكات إنستجرام (أقل طلب 50)
    // ==========================================
    bot.action('ig_likes', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_instagram_package' };

        await ctx.reply(
            `❤️ **اختر نوع خدمة لايكات إنستجرام:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ لايكات الأرخص + ضمان (الـ 1000 بـ 25 ج)', 'pkg_ig_l1')],
                    [Markup.button.callback('2️⃣ لايكات مستخدمين عرب + ضمان (الـ 1000 بـ 40 ج)', 'pkg_ig_l2')],
                    [Markup.button.callback('3️⃣ لايكات إنستجرام + ضمان (الـ 1000 بـ 15 ج)', 'pkg_ig_l3')],
                    [Markup.button.callback('4️⃣ لايكات إنستجرام عالية الجودة + ضمان (الـ 1000 بـ 100 ج)', 'pkg_ig_l4')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_instagram')]
                ])
            }
        );
    });

    // ==========================================
    // ج) قسم مشاهدات إنستجرام (أقل طلب 100)
    // ==========================================
    bot.action('ig_views', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_instagram_package' };

        await ctx.reply(
            `👁️ **اختر خدمة مشاهدات إنستجرام:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ مشاهدات فيديوهات الأرخص + ضمان (الـ 1000 بـ 5 ج)', 'pkg_ig_v1')],
                    [Markup.button.callback('2️⃣ مشاهدات فيديو ممتازة ننصح بها (الـ 1000 بـ 10 ج)', 'pkg_ig_v2')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_instagram')]
                ])
            }
        );
    });

    // ==========================================
    // د) الخدمات الأخرى (ريبوست، شير، حفظ) (أقل طلب 10)
    // ==========================================
    bot.action('ig_others', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_instagram_package' };

        await ctx.reply(
            `🔄 **اختر الخدمات الإضافية لإنستجرام:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ ريبوست إنستجرام + ضمان (الـ 1000 بـ 70 ج)', 'pkg_ig_o1')],
                    [Markup.button.callback('2️⃣ مشاركات (شير) للمنشورات (الـ 1000 بـ 15 ج)', 'pkg_ig_o2')],
                    [Markup.button.callback('3️⃣ حفظ فيديو / صورة / IGTV (الـ 1000 بـ 20 ج)', 'pkg_ig_o3')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_instagram')]
                ])
            }
        );
    });

    // ==========================================
    // معالجة اختيار الباقات وتحديد الأسعار وأقل كمية
    // ==========================================
    bot.action(/pkg_ig_(.+)/, async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const pkgKey = ctx.match[1];
        
        let pricePer1k = 160;
        let minQty = 10;
        let pkgName = '';

        switch (pkgKey) {
            // المتابعين
            case 'f1': pricePer1k = 160; minQty = 10; pkgName = 'أرخص خدمة زيادة متابعين انستجرام'; break;
            case 'f2': pricePer1k = 220; minQty = 10; pkgName = 'متابعين انستجرام (الأكثر طلباً + ضمان)'; break;
            case 'f3': pricePer1k = 350; minQty = 1000; pkgName = 'متابعين انستجرام من حسابات عربية (حقيقيين + ضمان)'; break;

            // اللايكات (أقل طلب 50)
            case 'l1': pricePer1k = 25; minQty = 50; pkgName = 'زيادة لايكات انستجرام (الأرخص + ضمان)'; break;
            case 'l2': pricePer1k = 40; minQty = 50; pkgName = 'لايكات انستجرام مستخدمين عرب + ضمان'; break;
            case 'l3': pricePer1k = 15; minQty = 50; pkgName = 'لايكات انستجرام + ضمان (فئة اقتصادية)'; break;
            case 'l4': pricePer1k = 100; minQty = 50; pkgName = 'لايكات انستجرام (جودة عالية + ضمان)'; break;

            // المشاهدات (أقل طلب 100)
            case 'v1': pricePer1k = 5; minQty = 100; pkgName = 'مشاهدات فيديوهات انستجرام (الأرخص + ضمان)'; break;
            case 'v2': pricePer1k = 10; minQty = 100; pkgName = 'مشاهدات فيديو انستجرام (الممتازة)'; break;

            // الخدمات الأخرى (أقل طلب 10)
            case 'o1': pricePer1k = 70; minQty = 10; pkgName = 'ريبوست انستجرام (الأكثر طلباً + ضمان)'; break;
            case 'o2': pricePer1k = 15; minQty = 10; pkgName = 'مشاركات (شير) منشورات انستجرام'; break;
            case 'o3': pricePer1k = 20; minQty = 10; pkgName = 'حفظ فيديو / صورة / IGTV انستجرام'; break;
        }

        userState[ctx.from.id] = { 
            step: 'waiting_quantity', 
            platform: 'instagram', 
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

module.exports = { setupInstagramHandler };