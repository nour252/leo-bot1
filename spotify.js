const { Markup } = require('telegraf');
function setupSpotifyHandler(bot, db, ADMIN_CHAT_ID, userState) {
    bot.action('plat_spotify', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        await ctx.reply('🟢 قسم خدمات سبوتيفاي قريباً سيكون متاحاً!', { parse_mode: 'Markdown' });
    });
}
module.exports = { setupSpotifyHandler };