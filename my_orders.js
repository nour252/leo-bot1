const { Markup } = require('telegraf');

function setupMyOrdersHandler(bot, db, ADMIN_CHAT_ID, userState) {

    // 1. عرض قائمة طلبات اليوزر (أرقام الطلبات كأزرار)
    bot.action('my_orders', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const userId = ctx.from.id;

        try {
            // جلب آخر 10 طلبات مدفوعة أو مجانية لليوزر
            const [orders] = await db.execute(
                `SELECT order_id, service, created_at FROM orders WHERE user_id = ? 
                 UNION 
                 SELECT order_id, service_type AS service, created_at FROM free_orders WHERE user_id = ? 
                 ORDER BY created_at DESC LIMIT 10`,
                [userId, userId]
            );

            if (orders.length === 0) {
                return ctx.editMessageText(
                    `📦 **سجل طلباتي:**\n\nعذراً، ليس لديك أي طلبات مسجلة حتى الآن! 🛒`,
                    {
                        parse_mode: 'Markdown',
                        ...Markup.inlineKeyboard([
                            [Markup.button.callback('⬅️ رجوع للقائمة الرئيسية', 'main_menu')]
                        ])
                    }
                );
            }

            // بناء أزرار لكل طلب
            const orderButtons = orders.map(order => {
                return [Markup.button.callback(`🆔 ${order.order_id} - ${order.service.substring(0, 20)}...`, `view_order_${order.order_id}`)];
            });

            orderButtons.push([Markup.button.callback('⬅️ رجوع للقائمة الرئيسية', 'main_menu')]);

            await ctx.editMessageText(
                `📦 **سجل طلباتي:**\n\nاختر رقم الطلب أدناه لعرض كافة التفاصيل والمعلومات الخاصة به:`,
                {
                    parse_mode: 'Markdown',
                    ...Markup.inlineKeyboard(orderButtons)
                }
            );

        } catch (err) {
            console.error("My Orders Error:", err);
            await ctx.answerCbQuery('حدث خطأ أثناء جلب طلباتك.', { show_alert: true });
        }
    });

    // 2. عرض تفاصيل الطلب المختار عند الضغط عليه
    bot.action(/view_order_(.+)/, async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const orderId = ctx.match[1];
        const userId = ctx.from.id;

        try {
            // البحث في جدول الطلبات المدفوعة أو المجانية
            let [rows] = await db.execute('SELECT * FROM orders WHERE order_id = ? AND user_id = ?', [orderId, userId]);
            let isFree = false;

            if (rows.length === 0) {
                [rows] = await db.execute('SELECT * FROM free_orders WHERE order_id = ? AND user_id = ?', [orderId, userId]);
                isFree = true;
            }

            if (rows.length === 0) {
                return ctx.answerCbQuery('❌ عذراً، هذا الطلب غير موجود أو غير مخصص لك.', { show_alert: true });
            }

            const order = rows[0];

            // ترجمة حالات الطلب لشكل شيك
            let statusText = order.status;
            if (order.status === 'pending') statusText = '⏳ قيد الانتظار';
            else if (order.status === 'processing') statusText = '🚀 قيد التنفيذ';
            else if (order.status === 'completed') statusText = '✅ مكتمل';
            else if (order.status === 'rejected') statusText = '❌ ملغي';

            let detailsText = `📄 **تفاصيل الطلب:** \`${order.order_id}\`\n\n`;
            detailsText += `📦 **الخدمة:** ${order.service || order.service_type}\n`;
            if (!isFree) {
                detailsText += `📊 **الكمية:** ${order.quantity}\n`;
            }
            detailsText += `🔗 **الرابط / البيانات:** ${order.link}\n`;
            detailsText += `📌 **الحالة الحالية:** ${statusText}\n`;
            detailsText += `🕒 **وقت الطلب:** ${order.created_at}\n`;

            await ctx.editMessageText(detailsText, {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('⬅️ رجوع لقائمة طلباتي', 'my_orders')],
                    [Markup.button.callback('🏠 القائمة الرئيسية', 'main_menu')]
                ])
            });

        } catch (err) {
            console.error("View Order Details Error:", err);
            await ctx.answerCbQuery('حدث خطأ أثناء جلب تفاصيل الطلب.', { show_alert: true });
        }
    });
}

module.exports = { setupMyOrdersHandler };