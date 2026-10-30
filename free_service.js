const { Markup } = require('telegraf');

function setupFreeServiceHandler(bot, db, ADMIN_CHAT_ID, userState) {

    // القائمة الرئيسية للخدمات المجانية (تيك توك فقط)
    bot.action('free_service', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'selecting_free_service' };

        await ctx.editMessageText(
            `🎁 **اختر خدمة تيك توك المجانية المتاحة:**\n\n⏰ *متاح طلب مجاني (20 لايك أو 200 مشاهدة) مرة كل ساعة لكل يوزر.*`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('❤️ 20 لايك مجاني تيك توك', 'free_tiktok_likes')],
                    [Markup.button.callback('👁️ 200 مشاهدة مجاني تيك توك', 'free_tiktok_views')],
                    [Markup.button.callback('⬅️ رجوع للقائمة الرئيسية', 'main_menu')]
                ])
            }
        );
    });

    // 1. فحص طلب اللايكات المجانية (كل ساعة)
    bot.action('free_tiktok_likes', async (ctx) => {
        const userId = ctx.from.id;
        const serviceType = '20 لايك تيك توك مجاني';

        try {
            // التحقق من آخر طلب لنفس الخدمة خلال آخر ساعة
            const [rows] = await db.execute(
                `SELECT created_at FROM free_orders 
                 WHERE user_id = ? AND service_type = ? 
                 AND created_at >= (NOW() - INTERVAL 1 HOUR) 
                 ORDER BY created_at DESC LIMIT 1`,
                [userId, serviceType]
            );

            if (rows.length > 0) {
                // مفيش ساعة عدت
                return ctx.answerCbQuery('❌ عذراً، يمكنك طلب اللايكات المجانية مرة واحدة كل ساعة فقط! انتظر قليلاً.', { show_alert: true });
            }

            try { await ctx.answerCbQuery(); } catch (e) {}
            userState[userId] = { step: 'waiting_free_link', service: serviceType, quantity: 20 };

            await ctx.editMessageText(
                `❤️ **لقد اخترت:** 20 لايك مجاني تيك توك.\n\n🔗 أرسل الآن **رابط الفيديو** على تيك توك:`,
                { parse_mode: 'Markdown' }
            );

        } catch (err) {
            console.error("Rate Limit Error:", err);
            await ctx.answerCbQuery('حدث خطأ أثناء التحقق من الوقت.', { show_alert: true });
        }
    });

    // 2. فحص طلب المشاهدات المجانية (كل ساعة)
    bot.action('free_tiktok_views', async (ctx) => {
        const userId = ctx.from.id;
        const serviceType = '200 مشاهدة تيك توك مجاني';

        try {
            // التحقق من آخر طلب لنفس الخدمة خلال آخر ساعة
            const [rows] = await db.execute(
                `SELECT created_at FROM free_orders 
                 WHERE user_id = ? AND service_type = ? 
                 AND created_at >= (NOW() - INTERVAL 1 HOUR) 
                 ORDER BY created_at DESC LIMIT 1`,
                [userId, serviceType]
            );

            if (rows.length > 0) {
                // مفيش ساعة عدت
                return ctx.answerCbQuery('❌ عذراً، يمكنك طلب المشاهدات المجانية مرة واحدة كل ساعة فقط! انتظر قليلاً.', { show_alert: true });
            }

            try { await ctx.answerCbQuery(); } catch (e) {}
            userState[userId] = { step: 'waiting_free_link', service: serviceType, quantity: 200 };

            await ctx.editMessageText(
                `👁️ **لقد اخترت:** 200 مشاهدة مجاني تيك توك.\n\n🔗 أرسل الآن **رابط الفيديو** على تيك توك:`,
                { parse_mode: 'Markdown' }
            );

        } catch (err) {
            console.error("Rate Limit Error:", err);
            await ctx.answerCbQuery('حدث خطأ أثناء التحقق من الوقت.', { show_alert: true });
        }
    });
}

module.exports = { setupFreeServiceHandler };