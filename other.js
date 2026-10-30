const { Markup } = require('telegraf');

function setupOtherHandler(bot, db, ADMIN_CHAT_ID, userState) {

    // 1. القائمة الرئيسية لقسم الخدمات الأخرى (كواي وخرائط جوجل)
    bot.action('plat_other', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'other_service_type' };

        await ctx.reply(
            `⚙️ **اختر نوع الخدمات الأخرى المطلوبة:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('🟡 خدمات كواي (Kwai) ', 'other_kwai')],
                    [Markup.button.callback('⭐ تقييمات خرائط جوجل ', 'other_google_maps')],
                    [Markup.button.callback('⬅️ رجوع للمنصات', 'type_rashq')]
                ])
            }
        );
    });

    // ==========================================
    // أ) قسم خدمات كواي (Kwai)
    // ==========================================
    bot.action('other_kwai', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_other_package' };

        await ctx.reply(
            `🟡 **اختر خدمة كواي (Kwai):**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ متابعين كواي حقيقيين + ضمان (الـ 1000 بـ 100 ج) - أدنى 1', 'pkg_oth_kw1')],
                    [Markup.button.callback('2️⃣ مشاهدات كواي حقيقيين 100% (الـ 1000 بـ 150 ج) - أدنى 20000', 'pkg_oth_kw2')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_other')]
                ])
            }
        );
    });

    // ==========================================
    // ب) قسم تقييمات خرائط جوجل
    // ==========================================
    bot.action('other_google_maps', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_other_package' };

        await ctx.reply(
            `⭐ **اختر خدمة تقييمات خرائط جوجل:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ تقييم خرائط جوجل (5 نجوم ✨) من حسابات متنوعة + ضمان (التقييم بـ 60 ج) - أدنى 1', 'pkg_oth_gm1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_other')]
                ])
            }
        );
    });

    // ==========================================
    // معالجة اختيار الباقات والأسعار والكميات
    // ==========================================
    bot.action(/pkg_oth_(.+)/, async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const pkgKey = ctx.match[1];
        
        let pricePer1k = 100;
        let minQty = 1;
        let pkgName = '';

        switch (pkgKey) {
            // متابعين كواي (أقل طلب 1، السعر 100 للالف)
            case 'kw1': 
                pricePer1k = 100; 
                minQty = 1; 
                pkgName = 'متابعين كواي حقيقيين + ضمان'; 
                break;

            // مشاهدات كواي (أقل طلب 20000، السعر 150 للالف)
            case 'kw2': 
                pricePer1k = 150; 
                minQty = 20000; 
                pkgName = 'مشاهدات كواي حقيقيين 100%'; 
                break;

            // تقييمات خرائط جوجل (السعر 60 للتقييم الواحد، يعني الـ 1000 بـ 60000 ج أو نحسبها بالوحدة، بس بما إن السيستم بيحسب بناءً على (الكمية / 1000) * السعر، فهنظبط سعر الـ 1000 بـ 60,000 عشان لو طلب تقييم واحد يطلع بـ 60 جنيه بالظبط!)
            case 'gm1': 
                pricePer1k = 60000; // 60 جنيه لكل تقييم واحد يعني 60 ألف للألف
                minQty = 1; 
                pkgName = 'تقييم خرائط جوجل (5 نجوم ✨) من حسابات متنوعة + ضمان'; 
                break;
        }

        userState[ctx.from.id] = { 
            step: 'waiting_quantity', 
            platform: 'other', 
            service: pkgName, 
            pricePer1k: pricePer1k, 
            minQty: minQty 
        };

        // لو الخدمة تقييمات جوجل، نوضح للعميل إن السعر بالتقييم الواحد عشان ما يتفاجئش
        let priceText = `${pricePer1k} جنيه لكل 1000`;
        if (pkgKey === 'gm1') {
            priceText = `60 جنيه للتقييم الواحد`;
        }

        await ctx.reply(
            `📦 **لقد اخترت:** ${pkgName}\n💰 **السعر:** ${priceText}\n📉 **أقل طلب مسموح:** ${minQty}\n\nأرسل الآن **الكمية المطلوبة** (أرقام فقط):`,
            { parse_mode: 'Markdown' }
        );
    });
}

module.exports = { setupOtherHandler };