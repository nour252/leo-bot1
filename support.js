const { Markup } = require('telegraf');

function setupSupportHandler(bot, db, ADMIN_CHAT_ID, userState) {

    // عرض معلومات الدعم وقناة الفريق
    bot.action('support', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}

        const supportText = `📞 **خدمة الدعم الفني وتواصل فريق Leo Team:**\n\n` +
            `إذا واجهتك أي مشكلة في شحن الرصيد، تأخير الطلبات، أو استفسار عن الخدمات، نحن هنا لمساعدتك على مدار الساعة!\n\n` +
            `📢 **قناة الفريق الرسمية:**\nhttps://t.me/leosmmm\n\n` +
            `💬 **معرف الدعم الفني للتواصل:**\n@leoteam11`;

        await ctx.editMessageText(supportText, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            ...Markup.inlineKeyboard([
                [Markup.button.url('📢 قناة الفريق', 'https://t.me/leosmmm')],
                [Markup.button.url('💬 مراقبة الدعم الفني', 'https://t.me/leoteam11')],
                [Markup.button.callback('⬅️ رجوع للقائمة الرئيسية', 'main_menu')]
            ])
        });
    });
}

module.exports = { setupSupportHandler };