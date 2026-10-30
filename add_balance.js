const { Markup } = require('telegraf');

function setupAddBalanceHandler(bot, db, ADMIN_CHAT_ID, userState) {

    // 1. عرض طرق الدفع لما اليوزر يدوس "إضافة رصيد"
    bot.action('add_balance', async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        userState[ctx.from.id] = { step: 'choosing_payment_method' };

        await ctx.editMessageText(
            `💳 **اختر طريقة الدفع المناسبة لشحن رصيدك:**`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('📱 فودافون / اتصالات كاش (محفظة)', 'pay_wallet')],
                    [Markup.button.callback('🔗 إنستا باي (InstaPay)', 'pay_instapay')],
                    [Markup.button.callback('💳 تطبيق تيلدا (Telda)', 'pay_telda')],
                    [Markup.button.callback('⬅️ رجوع للقائمة الرئيسية', 'main_menu')]
                ])
            }
        );
    });

    // 2. تحديد طريقة الدفع وطلب المبلغ (من 5 إلى 20,000 ج)
    bot.action(['pay_wallet', 'pay_instapay', 'pay_telda'], async (ctx) => {
        try { await ctx.answerCbQuery(); } catch (e) {}
        const userId = ctx.from.id;
        
        let method = 'محفظة إلكترونية';
        if (ctx.callbackQuery.data === 'pay_instapay') method = 'إنستا باي';
        else if (ctx.callbackQuery.data === 'pay_telda') method = 'تيلدا';

        userState[userId] = { 
            step: 'waiting_balance_amount', 
            paymentMethod: method 
        };

        await ctx.editMessageText(
            `💰 **طريقة الدفع المختارة:** ${method}\n\nأرسل الآن **المبلغ المراد إضافته** (بالجنيه المصري):\n*(الحد الأدنى 5 ج والحد الأقصى 20,000 ج)*`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('⬅️ رجوع', 'add_balance')]
                ])
            }
        );
    });
}

// دالة معالجة نصوص الشحن (المبلغ وسكرين التحويل) تُربط في index.js
function handleBalanceTexts(bot, db, ADMIN_CHAT_ID, userState, showMainMenu) {
    
    // أ) استقبال المبلغ والتحقق من الشروط (5 إلى 20000)
    bot.on('text', async (ctx, next) => {
        const userId = ctx.from.id;
        if (!userState[userId] || userState[userId].step !== 'waiting_balance_amount') {
            return next();
        }

        const text = ctx.message.text;
        const amount = parseFloat(text);

        if (isNaN(amount) || amount < 5 || amount > 20000) {
            return ctx.reply(`❌ المبلغ غير صالح!\nيرجى كتابة مبلغ صحيح **بين 5 جنيه و 20,000 جنيه** فقط.`);
        }

        userState[userId].amount = amount;
        userState[userId].step = 'waiting_payment_screenshot';

        const method = userState[userId].paymentMethod;
        let targetAccount = '';

        if (method === 'محفظة إلكترونية') targetAccount = '`01556177235`';
        else if (method === 'إنستا باي') targetAccount = '`nourhassen11@instapay`';
        else if (method === 'تيلدا') targetAccount = '`@nourhassen677720`';

        await ctx.reply(
            `📥 **تعليمات الدفع (${method}):**\n\nقم بتحويل مبلغ **${amount} جنيه** إلى الحساب التالي:\n${targetAccount}\n\n📸 بعد اتمام التحويل بنجاح، أرسل الآن **صورة (سكرين ش็ت) إيصال التحويل** لإتمام الطلب:`,
            { parse_mode: 'Markdown' }
        );
    });

    // ب) استقبال صورة الإيصال (السكرين) وإرسال الطلب للآدمن
    bot.on('photo', async (ctx) => {
        const userId = ctx.from.id;
        const username = ctx.from.username ? `@${ctx.from.username}` : (ctx.from.first_name || 'بدون اسم');
        const userName = ctx.from.first_name || "صديقي";

        if (!userState[userId] || userState[userId].step !== 'waiting_payment_screenshot') return;

        const state = userState[userId];
        const photo = ctx.message.photo;
        const fileId = photo[photo.length - 1].file_id; // أعلى جودة للصورة
        const requestId = 'DEP-' + Date.now().toString().slice(-6);

        try {
            // حفظ الطلب في القاعدة
            await db.execute(
                'INSERT INTO balance_requests (request_id, user_id, username, payment_method, amount, screenshot_file_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
                [requestId, userId, username, state.paymentMethod, state.amount, fileId, 'pending']
            );

            delete userState[userId];

            await ctx.reply(
                `✅ **تم إرسال طلب شحن الرصيد بنجاح!**\n\n🆔 رقم الطلب: \`${requestId}\`\n💰 المبلغ المطلوب: ${state.amount} ج\n💳 الطريقة: ${state.paymentMethod}\n⏳ جاري مراجعة الإيصال من الدعم وإضافة الرصيد قريباً.`,
                { parse_mode: 'Markdown' }
            );
            await showMainMenu(ctx, userName, false);

            if (ADMIN_CHAT_ID) {
                const adminCaption = `💳 **طلب شحن رصيد جديد!**\n\n🆔 رقم الطلب: \`${requestId}\`\n👤 العميل: ${username} (\`${userId}\`)\n💰 المبلغ: ${state.amount} ج\n💳 الطريقة: ${state.paymentMethod}\n\n📌 الحالة: ⏳ قيد الانتظار للمراجعة`;

                await bot.telegram.sendPhoto(ADMIN_CHAT_ID, fileId, {
                    caption: adminCaption,
                    parse_mode: 'Markdown',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback(`✅ موافقة وإضافة (${state.amount} ج)`, `dep_acc_${requestId}`)],
                        [Markup.button.callback(`💵 إضافة بمبلغ مختلف`, `dep_diff_${requestId}`)],
                        [Markup.button.callback(`❌ رفض الطلب`, `dep_rej_${requestId}`)]
                    ])
                });
            }

        } catch (err) {
            console.error("Deposit Error:", err);
            ctx.reply('حدث خطأ أثناء حفظ طلب الشحن في القاعدة.');
        }
    });
}

module.exports = { setupAddBalanceHandler, handleBalanceTexts };