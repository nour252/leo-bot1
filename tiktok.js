const { Markup } = require('telegraf');

function setupTikTokHandler(bot, db, ADMIN_CHAT_ID, userState) {

    // 1. القائمة الرئيسية لقسم تيك توك (كل الأقسام)
    bot.action('plat_tiktok', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'tiktok_service_type' };

        await ctx.reply(
            `🎵 **اختر نوع خدمة تيك توك المطلوبة:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('👥 زيادة متابعين ', 'tk_followers')],
                    [Markup.button.callback('🌐 زيادة الاكسبلور (مشاركات) ', 'tk_explore')],
                    [Markup.button.callback('❤️ لايكات وتفاعلات ', 'tk_likes_menu')],
                    [Markup.button.callback('👁️ مشاهدات الفيديو ', 'tk_views_menu')],
                    [Markup.button.callback('💾 حفظ الفيديو (المفضلة) ', 'tk_saves_menu')],
                    [Markup.button.callback('📡 خدمات البث المباشر ', 'tk_live_menu')],
                    [Markup.button.callback('⬅️ رجوع للمنصات', 'type_rashq')]
                ])
            }
        );
    });

    // ==========================================
    // أ) قسم متابعين تيك توك (الخدمات السابقة)
    // ==========================================
    bot.action('tk_followers', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_tiktok_package' };

        await ctx.reply(
            `👥 **اختر نوع خدمة المتابعين المناسبة لك:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ أرخص خدمة متابعين (الـ 1000 بـ 250 ج)', 'pkg_tk_f1')],
                    [Markup.button.callback('2️⃣ الأكثر طلباً + ضمان (الـ 1000 بـ 350 ج)', 'pkg_tk_f2')],
                    [Markup.button.callback('3️⃣ عرب حقيقيين ومتفاعلين + ضمان (الـ 1000 بـ 500 ج)', 'pkg_tk_f3')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_tiktok')]
                ])
            }
        );
    });

    // ==========================================
    // ب) قسم الاكسبلور (مشاركات الفيديو)
    // ==========================================
    bot.action('tk_explore', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_tiktok_package' };

        await ctx.reply(
            `🌐 **اختر خدمة الاكسبلور (المشاركات):**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ أسرع خدمة زيادة مشاركات (الـ 1000 بـ 20 ج) - أدنى 10', 'pkg_tk_exp1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_tiktok')]
                ])
            }
        );
    });

    // ==========================================
    // ج) قسم لايكات تيك توك
    // ==========================================
    bot.action('tk_likes_menu', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_tiktok_package' };

        await ctx.reply(
            `❤️ **اختر نوع خدمة اللايكات:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ الأرخص + حركة اكسبلور (الـ 1000 بـ 100 ج)', 'pkg_tk_l1')],
                    [Markup.button.callback('2️⃣ الأكثر طلباً + ضمان + اكسبلور (الـ 1000 بـ 200 ج)', 'pkg_tk_l2')],
                    [Markup.button.callback('3️⃣ لايكات مخفية (الـ 1000 بـ 30 ج)', 'pkg_tk_l3')],
                    [Markup.button.callback('4️⃣ لايكات مخفية + ضمان (الـ 1000 بـ 50 ج)', 'pkg_tk_l4')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_tiktok')]
                ])
            }
        );
    });

    // ==========================================
    // د) قسم مشاهدات الفيديو
    // ==========================================
    bot.action('tk_views_menu', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_tiktok_package' };

        await ctx.reply(
            `👁️ **اختر خدمة مشاهدات الفيديو:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ مشاهدات تيك توك (الـ 1000 بـ 0.5 ج)', 'pkg_tk_v1')],
                    [Markup.button.callback('2️⃣ مشاهدات تيك توك (الـ 1000 بـ 2 ج)', 'pkg_tk_v2')],
                    [Markup.button.callback('3️⃣ مشاهدات + ضمان (الـ 1000 بـ 6 ج)', 'pkg_tk_v3')],
                    [Markup.button.callback('4️⃣ مشاهدات + ضمان (الـ 1000 بـ 10 ج)', 'pkg_tk_v4')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_tiktok')]
                ])
            }
        );
    });

    // ==========================================
    // هـ) قسم حفظ الفيديو (المفضلة)
    // ==========================================
    bot.action('tk_saves_menu', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_tiktok_package' };

        await ctx.reply(
            `💾 **اختر خدمة حفظ الفيديو (المفضلة):**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ إضافة للمفضلة + سريعة جداً (الـ 1000 بـ 5 ج)', 'pkg_tk_s1')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_tiktok')]
                ])
            }
        );
    });

    // ==========================================
    // و) قسم خدمات البث المباشر
    // ==========================================
    bot.action('tk_live_menu', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_tiktok_package' };

        await ctx.reply(
            `📡 **اختر خدمة البث المباشر:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('1️⃣ نقاط معركة / جولات + ضمان (الـ 1000 بـ 15 ج)', 'pkg_tk_liv1')],
                    [Markup.button.callback('2️⃣ مشاهدات بث مباشر (الـ 1000 بـ 70 ج)', 'pkg_tk_liv2')],
                    [Markup.button.callback('3️⃣ تكبيس بث مباشر (الـ 1000 بـ 7.5 ج)', 'pkg_tk_liv3')],
                    [Markup.button.callback('⬅️ رجوع', 'plat_tiktok')]
                ])
            }
        );
    });

    // ==========================================
    // معالجة اختيار الباقات وتحديد الشروط والأسعار
    // ==========================================
    bot.action(/pkg_tk_(.+)/, async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const pkgKey = ctx.match[1];
        
        let pricePer1k = 250;
        let minQty = 50; // الافتراضي للايكات والمشاهدات والحفظ والبث
        let pkgName = '';

        switch (pkgKey) {
            // المتابعين
            case 'f1': pricePer1k = 250; minQty = 10; pkgName = 'أرخص خدمة متابعين تيك توك'; break;
            case 'f2': pricePer1k = 350; minQty = 10; pkgName = 'خدمة متابعين تيك توك (الأكثر طلباً + ضمان)'; break;
            case 'f3': pricePer1k = 500; minQty = 1000; pkgName = 'أفضل خدمة متابعين (عرب حقيقيين + ضمان)'; break;
            
            // الاكسبلور
            case 'exp1': pricePer1k = 20; minQty = 10; pkgName = 'أسرع خدمة زيادة مشاركات تيك توك (اكسبلور)'; break;

            // اللايكات (أقل طلب 50)
            case 'l1': pricePer1k = 100; minQty = 50; pkgName = 'زيادة لايكات تيك توك (الأرخص + اكسبلور)'; break;
            case 'l2': pricePer1k = 200; minQty = 50; pkgName = 'أفضل خدمة لايكات تيك توك (طلب + ضمان + اكسبلور)'; break;
            case 'l3': pricePer1k = 30; minQty = 50; pkgName = 'لايكات تيك توك (لايكات مخفية)'; break;
            case 'l4': pricePer1k = 50; minQty = 50; pkgName = 'لايكات تيك توك (لايكات مخفية + ضمان)'; break;

            // المشاهدات (أقل طلب 100)
            case 'v1': pricePer1k = 0.5; minQty = 100; pkgName = 'مشاهدات تيك توك (عادية)'; break;
            case 'v2': pricePer1k = 2; minQty = 100; pkgName = 'مشاهدات تيك توك (فئة 2)'; break;
            case 'v3': pricePer1k = 6; minQty = 100; pkgName = 'مشاهدات تيك توك + ضمان'; break;
            case 'v4': pricePer1k = 10; minQty = 100; pkgName = 'مشاهدات تيك توك + ضمان (فئة 4)'; break;

            // الحفظ (أقل طلب 100)
            case 's1': pricePer1k = 5; minQty = 100; pkgName = 'إضافة الفيديو للمفضلة تيك توك (سريعة جداً)'; break;

            // البث المباشر (أقل طلب 100)
            case 'liv1': pricePer1k = 15; minQty = 100; pkgName = 'نقاط معركة - جولات تيك توك + ضمان'; break;
            case 'liv2': pricePer1k = 70; minQty = 100; pkgName = 'مشاهدات تيك توك (بث مباشر)'; break;
            case 'liv3': pricePer1k = 7.5; minQty = 100; pkgName = 'لايكات تيك توك (تكبيس بث مباشر)'; break;
        }

        userState[ctx.from.id] = { 
            step: 'waiting_quantity', 
            platform: 'tiktok', 
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

module.exports = { setupTikTokHandler };