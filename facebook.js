const { Markup } = require('telegraf');

function setupFacebookHandler(bot, db, ADMIN_CHAT_ID, userState) {

    // 1. القائمة الرئيسية لقسم فيسبوك
    bot.action('plat_facebook', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'facebook_service_type' };

        await ctx.reply(
            `📘 **اختر نوع خدمة فيسبوك المطلوبة:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('👥 متابعين فيسبوك (صفحات وحسابات) ', 'fb_followers')],
                    [Markup.button.callback('👍❤️ لايكات وتفاعلات منشورات ', 'fb_likes')],
                    [Markup.button.callback('👁️ مشاهدات فيديو فيسبوك ', 'fb_views')],
                    [Markup.button.callback('⬅️ رجوع للمنصات', 'type_rashq')]
                ])
            }
        );
    });

    // ==========================================
    // أ) قسم متابعين فيسبوك (أقل طلب 100 في كله)
    // ==========================================
    bot.action('fb_followers', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_facebook_package' };

        await ctx.reply(
            `👥 **اختر خدمة متابعين فيسبوك:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ متابعين + لايكات لصفحات الفيسبوك + ضمان (الـ 1000 بـ 100 ج)', 'pkg_fb_f1')],
                    [Markup.button.callback('2️⃣ أرخص خدمة متابعين صفحات فيسبوك + ضمان (الـ 1000 بـ 90 ج)', 'pkg_fb_f2')],
                    [Markup.button.callback('3️⃣ متابعين للحسابات الشخصية + ضمان (الـ 1000 بـ 70 ج)', 'pkg_fb_f3')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_facebook')]
                ])
            }
        );
    });

    // ==========================================
    // ب) قسم لايكات فيسبوك (أقل طلب 100 في كله)
    // ==========================================
    bot.action('fb_likes', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_facebook_package' };

        await ctx.reply(
            `👍❤️ **اختر خدمة لايكات فيسبوك:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ لايكات منشور (ضمان 30 يوم - جديدة) (الـ 1000 بـ 35 ج)', 'pkg_fb_l1')],
                    [Markup.button.callback('2️⃣ لايكات اعجبني 👍 + ضمان 30 يوم (الـ 1000 بـ 25 ج)', 'pkg_fb_l2')],
                    [Markup.button.callback('3️⃣ لايكات قلب ❤️ سريع جداً (الـ 1000 بـ 25 ج)', 'pkg_fb_l3')],
                    [Markup.button.callback('4️⃣ لايكات ايجابية (❤️👍🥰) حسابات عربية 🇸🇦 + ضمان (الـ 1000 بـ 200 ج)', 'pkg_fb_l4')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_facebook')]
                ])
            }
        );
    });

    // ==========================================
    // ج) قسم مشاهدات فيسبوك (أقل طلب 100)
    // ==========================================
    bot.action('fb_views', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_facebook_package' };

        await ctx.reply(
            `👁️ **اختر خدمة مشاهدات فيديو فيسبوك:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ مشاهدات لتحقيق الدخل + ممتازة بدون نقص (الـ 1000 بـ 5 ج)', 'pkg_fb_v1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_facebook')]
                ])
            }
        );
    });

    // ==========================================
    // معالجة اختيار الباقات والأسعار والكميات (أقل طلب 100 للكل)
    // ==========================================
    bot.action(/pkg_fb_(.+)/, async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const pkgKey = ctx.match[1];
        
        let pricePer1k = 100;
        let minQty = 100; // أقل طلب 100 في كل خدمات فيسبوك حسب طلبك
        let pkgName = '';

        switch (pkgKey) {
            // المتابعين
            case 'f1': pricePer1k = 100; pkgName = 'متابعين + لايكات لصفحات الفيسبوك + ضمان'; break;
            case 'f2': pricePer1k = 90; pkgName = 'أرخص خدمة زيادة متابعين فيسبوك للصفحات + ضمان'; break;
            case 'f3': pricePer1k = 70; pkgName = 'متابعين فيسبوك للحسابات الشخصية + ضمان'; break;

            // اللايكات
            case 'l1': pricePer1k = 35; pkgName = 'لايكات منشور فيسبوك (ضمان 30 يوم - جديدة)'; break;
            case 'l2': pricePer1k = 25; pkgName = 'لايكات اعجبني 👍 + ضمان 30 يوم'; break;
            case 'l3': pricePer1k = 25; pkgName = 'لايكات قلب ❤️ على منشور فيسبوك (سريع)'; break;
            case 'l4': pricePer1k = 200; pkgName = 'لايكات ايجابية (❤️👍🥰) حسابات عربية + ضمان'; break;

            // المشاهدات
            case 'v1': pricePer1k = 5; pkgName = 'مشاهدات فيديو فيسبوك لتحقيق الدخل + ممتازة'; break;
        }

        userState[ctx.from.id] = { 
            step: 'waiting_quantity', 
            platform: 'facebook', 
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

module.exports = { setupFacebookHandler };