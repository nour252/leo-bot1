const { Markup } = require('telegraf');
function setupDiscordHandler(bot, db, ADMIN_CHAT_ID, userState) {
    bot.action('plat_discord', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        await ctx.reply('🎮 قسم خدمات ديسكورد قريباً سيكون متاحاً!', { parse_mode: 'Markdown' });
    });
}
module.exports = { setupDiscordHandler };