require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const mysql = require('mysql2/promise');

// استدعاء جميع هاندلرات المنصات والشحن والمجاني والخدمات
const { setupTikTokHandler } = require('./handlers/tiktok');
const { setupInstagramHandler } = require('./handlers/instagram');
const { setupYoutubeHandler } = require('./handlers/youtube');
const { setupFacebookHandler } = require('./handlers/facebook');
const { setupXHandler } = require('./handlers/x');
const { setupTelegramHandler } = require('./handlers/telegram');
const { setupSnapHandler } = require('./handlers/snapchat');
const { setupSpotifyHandler } = require('./handlers/spotify');
const { setupDiscordHandler } = require('./handlers/discord');
const { setupOtherHandler } = require('./handlers/other');
const { setupTikTokCoinsHandler } = require('./handlers/tiktok_coins');
const { setupPubgHandler } = require('./handlers/pubg');
const { setupFreeServiceHandler } = require('./handlers/free_service');
const { setupMyOrdersHandler } = require('./handlers/my_orders');
const { setupSupportHandler } = require('./handlers/support');
const { setupAddBalanceHandler, handleBalanceTexts } = require('./handlers/add_balance');

const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const CHANNEL_USERNAME = '@leosmmm'; 

const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'leo_smm',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const userState = {};

db.getConnection()
    .then(() => console.log('✅ Connected to phpMyAdmin successfully!'))
    .catch((err) => console.error('❌ Database connection failed:', err.message));

async function checkSubscription(userId) {
    try {
        const chatMember = await bot.telegram.getChatMember(CHANNEL_USERNAME, userId);
        return ['creator', 'administrator', 'member'].includes(chatMember.status);
    } catch (error) {
        return false;
    }
}

// دالة عرض القائمة الرئيسية (مع دعم تعديل الرسالة لتنظيف التشات)
async function showMainMenu(ctx, userName, isEditing = false) {
    const text = `أهلاً بك يا ${userName} في بوت **Leo Team** للخدمات ⚡\n\nاختر ما يناسبك من القائمة أدناه:`;
    const keyboard = Markup.inlineKeyboard([
        [Markup.button.callback('🚀 طلب خدمة مدفوعة', 'paid_service')],
        [Markup.button.callback('🎁 طلب خدمة مجانية', 'free_service')],
        [Markup.button.callback('📦 طلباتي', 'my_orders')],
        [Markup.button.callback('💳 إضافة رصيد', 'add_balance')],
        [Markup.button.callback('💰 رصيدي', 'account_balance')],
        [Markup.button.callback('📞 الدعم', 'support')],
        [Markup.button.callback('⭐ النقاط المجمعة', 'collected_points')]
    ]);

    if (isEditing) {
        try {
            await ctx.editMessageText(text, { parse_mode: 'Markdown', ...keyboard });
        } catch (e) {
            await ctx.reply(text, { parse_mode: 'Markdown', ...keyboard });
        }
    } else {
        await ctx.reply(text, { parse_mode: 'Markdown', ...keyboard });
    }
}

async function registerUserNow(userId, username) {
    try {
        await db.execute(
            `INSERT INTO users (user_id, username, balance, points, created_at) 
             VALUES (?, ?, 00.00, 0, NOW()) 
             ON DUPLICATE KEY UPDATE username = VALUES(username)`,
            [userId, username]
        );
    } catch (err) {
        console.error("DB Error:", err);
    }
}

bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'NoUsername';
    const userName = ctx.from.first_name || "صديقي";
    delete userState[userId];

    if (!await checkSubscription(userId)) {
        return ctx.reply(
            `⚠️ **عذراً يا ${userName}، يجب عليك الاشتراك في قناة البوت أولاً لتتمكن من استخدامه!**\n\n📢 قناة الفريق: ${CHANNEL_USERNAME}`,
            {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.url('🔗 اشترك في القناة الآن', 'https://t.me/leosmmm')],
                    [Markup.button.callback('🔄 تحقق من الاشتراك', 'check_sub')]
                ])
            }
        );
    }

    await registerUserNow(userId, username);
    await showMainMenu(ctx, userName, false);
});

bot.action('check_sub', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'NoUsername';
    const userName = ctx.from.first_name || "صديقي";

    if (!await checkSubscription(userId)) {
        try { await ctx.answerCbQuery('❌ لم تقم بالاشتراك في القناة بعد!', { show_alert: true }); } catch (e) {}
    } else {
        try { await ctx.answerCbQuery('✅ تم تفعيل البوت بنجاح.'); } catch (e) {}
        await registerUserNow(userId, username);
        try { await ctx.deleteMessage(); } catch (e) {}
        await showMainMenu(ctx, userName, false);
    }
});

// قائمة خدمات مدفوعة (تعديل الرسالة)
bot.action('paid_service', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch (e) {}
    userState[ctx.from.id] = { step: 'choosing_type' };

    await ctx.editMessageText(
        `⚡ **اختر نوع الخدمة المطلوبة:**`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🚀 خدمات الرشق والتفاعل', 'type_rashq')],
                [Markup.button.callback('🪙 خدمات الشحن', 'type_shahn')],
                [Markup.button.callback('⬅️ رجوع للقائمة الرئيسية', 'main_menu')]
            ])
        }
    );
});

// قائمة الرشق (تعديل الرسالة)
bot.action('type_rashq', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch (e) {}
    await ctx.editMessageText(
        `🚀 **اختر منصة الرشق المطلوبة:**`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🎵 تيك توك ', 'plat_tiktok'), Markup.button.callback('📸 إنستجرام ', 'plat_instagram')],
                [Markup.button.callback('▶️ يوتيوب', 'plat_youtube'), Markup.button.callback('📘 فيسبوك', 'plat_facebook')],
                [Markup.button.callback('✖️ إكس (تويتر)', 'plat_x'), Markup.button.callback('✈️ تليجرام', 'plat_telegram')],
                [Markup.button.callback('👻 سناب شات', 'plat_snap'), Markup.button.callback('🟢 سبوتيفاي', 'plat_spotify')],
                [Markup.button.callback('🎮 ديسكورد', 'plat_discord'), Markup.button.callback('⚙️ خدمات أخرى', 'plat_other')],
                [Markup.button.callback('⬅️ رجوع', 'paid_service')]
            ])
        }
    );
});

// قائمة الشحن (تعديل الرسالة)
bot.action('type_shahn', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch (e) {}
    await ctx.editMessageText(
        `🪙 **اختر خدمة الشحن المطلوبة:**`,
        {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard([
                [Markup.button.callback('🪙 عملات تيك توك', 'plat_tiktok_coins')],
                [Markup.button.callback('🎮 شحن ببجي موبايل (PUBG)', 'plat_pubg')],
                [Markup.button.callback('⬅️ رجوع', 'paid_service')]
            ])
        }
    );
});

// تفعيل كل هاندلرات المنصات والشحن والمجاني وطلب Rرصيد والدعم
setupTikTokHandler(bot, db, ADMIN_CHAT_ID, userState);
setupInstagramHandler(bot, db, ADMIN_CHAT_ID, userState);
setupYoutubeHandler(bot, db, ADMIN_CHAT_ID, userState);
setupFacebookHandler(bot, db, ADMIN_CHAT_ID, userState);
setupXHandler(bot, db, ADMIN_CHAT_ID, userState);
setupTelegramHandler(bot, db, ADMIN_CHAT_ID, userState);
setupSnapHandler(bot, db, ADMIN_CHAT_ID, userState);
setupSpotifyHandler(bot, db, ADMIN_CHAT_ID, userState);
setupDiscordHandler(bot, db, ADMIN_CHAT_ID, userState);
setupOtherHandler(bot, db, ADMIN_CHAT_ID, userState);
setupTikTokCoinsHandler(bot, db, ADMIN_CHAT_ID, userState);
setupPubgHandler(bot, db, ADMIN_CHAT_ID, userState);
setupFreeServiceHandler(bot, db, ADMIN_CHAT_ID, userState);
setupMyOrdersHandler(bot, db, ADMIN_CHAT_ID, userState);
setupSupportHandler(bot, db, ADMIN_CHAT_ID, userState);
setupAddBalanceHandler(bot, db, ADMIN_CHAT_ID, userState);
handleBalanceTexts(bot, db, ADMIN_CHAT_ID, userState, showMainMenu);

// ========================================================
// معالجة النصوص والمحادثات الشاملة (رشق + شحن + مجاني)
// ========================================================
bot.on('text', async (ctx, next) => {
    const userId = ctx.from.id;
    const username = ctx.from.username ? `@${ctx.from.username}` : (ctx.from.first_name || 'بدون اسم');
    const userName = ctx.from.first_name || "صديقي";
    const text = ctx.message.text;

    // فحص إذا كان المرسل هو الآدمن ويقوم بإدخال مبلغ مخصص لشحن الرصيد
    if (userId.toString() === ADMIN_CHAT_ID.toString() && userState[userId] && userState[userId].step === 'admin_typing_custom_amount') {
        const customAmount = parseFloat(text);
        if (isNaN(customAmount) || customAmount <= 0) {
            return ctx.reply('❌ برجاء إدخال رقم صحيح للمبلغ.');
        }

        const state = userState[userId];
        const requestId = state.requestId;
        delete userState[userId];

        try {
            const [rows] = await db.execute('SELECT user_id FROM balance_requests WHERE request_id = ?', [requestId]);
            if (rows.length === 0) return ctx.reply('الطلب غير موجود.');

            const targetUserId = rows[0].user_id;

            await db.execute('UPDATE balance_requests SET status = "approved_custom", amount = ? WHERE request_id = ?', [customAmount, requestId]);
            await db.execute('UPDATE users SET balance = balance + ? WHERE user_id = ?', [customAmount, targetUserId]);

            await ctx.reply(`✅ تم إضافة مبلغ **${customAmount} جنيه** بنجاح لحساب العميل!`);

            try {
                await bot.telegram.sendMessage(targetUserId, `🎉 مبروك! تم قبول طلب شحن الرصيد رقم \`${requestId}\` وإضافة مبلغ **${customAmount} جنيه** (معدل) إلى رصيدك بنجاح 💳`, { parse_mode: 'Markdown' });
            } catch (e) {}

        } catch (err) {
            console.error("Custom Amount Error:", err);
            ctx.reply('حدث خطأ أثناء تعديل وإضافة المبلغ.');
        }
        return;
    }

    if (!userState[userId]) return next();
    const state = userState[userId];

    // 1. استقبال الكمية للخدمات العادية
    if (state.step === 'waiting_quantity') {
        const qty = parseInt(text);
        if (isNaN(qty) || qty < state.minQty) {
            return ctx.reply(`❌ الكمية غير صالحة. أقل كمية مسموحة لهذه الخدمة هي **${state.minQty}**.`);
        }

        state.quantity = qty;
        state.totalCost = (qty / 1000) * state.pricePer1k;
        state.step = 'waiting_link';

        await ctx.reply(
            `💰 **التكلفة الإجمالية:** ${state.totalCost} جنيه مصري.\n\n🔗 أرسل الآن **رابط الحساب / المنشور** المطلـوب:`,
            { parse_mode: 'Markdown' }
        );
    } 
    // 2. استقبال الرابط وإتمام الطلب العادي
    else if (state.step === 'waiting_link') {
        const link = text;
        const totalCost = state.totalCost;

        try {
            const [userRows] = await db.execute('SELECT balance FROM users WHERE user_id = ?', [userId]);
            if (userRows.length === 0 || userRows[0].balance < totalCost) {
                delete userState[userId];
                return ctx.reply(`❌ **عذراً، رصيدك غير كافي لإتمام هذا الطلب!**\n💰 رصيدك الحالي: ${userRows[0]?.balance || 0} ج\n💵 التكلفة المطلوبة: ${totalCost} ج`);
            }

            await db.execute('UPDATE users SET balance = balance - ? WHERE user_id = ?', [totalCost, userId]);
            const orderId = state.platform.toUpperCase().slice(0, 2) + '-' + Date.now().toString().slice(-6);

            await db.execute(
                'INSERT INTO orders (order_id, user_id, service, link, quantity, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [orderId, userId, state.service, link, state.quantity, 'pending']
            );

            delete userState[userId];

            await ctx.reply(
                `✅ **تم إرسال طلبك بنجاح!**\n\n🆔 رقم الطلب: \`${orderId}\`\n📦 الخدمة: ${state.service}\n📊 الكمية: ${state.quantity}\n💰 المبلغ المخصوم: ${totalCost} ج\n⏳ جاري المراجعة والتنفيذ.`,
                { parse_mode: 'Markdown' }
            );
            await showMainMenu(ctx, userName, false);

            if (ADMIN_CHAT_ID) {
                const adminMsg = `🚨 **طلب رشق جديد (${state.platform.toUpperCase()})!**\n\n🆔 رقم الطلب: \`${orderId}\`\n👤 المستخدم ID: \`${userId}\`\n📌 الخدمة: ${state.service}\n📊 الكمية: ${state.quantity}\n💰 التكلفة: ${totalCost} ج\n🔗 الرابط: ${link}\n\n📌 الحالة: ⏳ قيد الانتظار`;

                await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg, {
                    parse_mode: 'Markdown',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback(`⏳ قيد التنفيذ`, `status_proc_${orderId}`)],
                        [Markup.button.callback(`✅ اكتمال الطلب`, `status_comp_${orderId}`)],
                        [Markup.button.callback(`❌ إلغاء الطلب (إرجاع المبلغ)`, `status_rej_${orderId}`)]
                    ])
                });
            }
        } catch (err) {
            console.error("Order Error:", err);
            ctx.reply('حدث خطأ أثناء معالجة الطلب في القاعدة.');
        }
    }
    // 3. استقبال طريقة التواصل لشحن عملات تيك توك
    else if (state.step === 'waiting_tiktok_coins_contact') {
        const contactInfo = text;
        const totalCost = state.totalPrice;

        try {
            const [userRows] = await db.execute('SELECT balance FROM users WHERE user_id = ?', [userId]);
            if (userRows.length === 0 || userRows[0].balance < totalCost) {
                delete userState[userId];
                return ctx.reply(`❌ **عذراً، رصيدك غير كافي لإتمام هذا الطلب!**\n💰 رصيدك الحالي: ${userRows[0]?.balance || 0} ج\n💵 التكلفة المطلوبة: ${totalCost} ج`);
            }

            await db.execute('UPDATE users SET balance = balance - ? WHERE user_id = ?', [totalCost, userId]);
            const orderId = 'TKC-' + Date.now().toString().slice(-6);

            await db.execute(
                'INSERT INTO orders (order_id, user_id, service, link, quantity, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [orderId, userId, state.service, `طريقة التواصل: ${contactInfo}`, 1, 'pending']
            );

            delete userState[userId];

            await ctx.reply(
                `✅ **تم إرسال طلب شحن عملات تيك توك بنجاح!**\n\n🆔 رقم الطلب: \`${orderId}\`\n🪙 الخدمة: ${state.service}\n📞 طريقة التواصل: ${contactInfo}\n💰 المبلغ المخصوم: ${totalCost} ج\n⏳ سيتم التواصل معك قريباً.`,
                { parse_mode: 'Markdown' }
            );
            await showMainMenu(ctx, userName, false);

            if (ADMIN_CHAT_ID) {
                const adminMsg = `🚨 **طلب شحن عملات تيك توك جديد!**\n\n🆔 رقم الطلب: \`${orderId}\`\n👤 المستخدم ID: \`${userId}\`\n🪙 الخدمة: ${state.service}\n📞 طريقة التواصل: ${contactInfo}\n💰 التكلفة: ${totalCost} ج\n\n📌 الحالة: ⏳ قيد الانتظار`;

                await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg, {
                    parse_mode: 'Markdown',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback(`⏳ قيد التنفيذ`, `status_proc_${orderId}`)],
                        [Markup.button.callback(`✅ اكتمال الطلب`, `status_comp_${orderId}`)],
                        [Markup.button.callback(`❌ إلغاء الطلب (إرجاع المبلغ)`, `status_rej_${orderId}`)]
                    ])
                });
            }
        } catch (err) {
            console.error("Order Error:", err);
            ctx.reply('حدث خطأ أثناء معالجة طلب العملات.');
        }
    }
    // 4. استقبال الايدي واسم اللاعب لشحن ببجي
    else if (state.step === 'waiting_pubg_details') {
        const pubgDetails = text;
        const totalCost = state.totalPrice;

        try {
            const [userRows] = await db.execute('SELECT balance FROM users WHERE user_id = ?', [userId]);
            if (userRows.length === 0 || userRows[0].balance < totalCost) {
                delete userState[userId];
                return ctx.reply(`❌ **عذراً، رصيدك غير كافي لإتمام هذا الطلب!**\n💰 رصيدك الحالي: ${userRows[0]?.balance || 0} ج\n💵 التكلفة المطلوبة: ${totalCost} ج`);
            }

            await db.execute('UPDATE users SET balance = balance - ? WHERE user_id = ?', [totalCost, userId]);
            const orderId = 'PUBG-' + Date.now().toString().slice(-6);

            await db.execute(
                'INSERT INTO orders (order_id, user_id, service, link, quantity, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
                [orderId, userId, state.service, `الايدي والاسم: ${pubgDetails}`, 1, 'pending']
            );

            delete userState[userId];

            await ctx.reply(
                `✅ **تم إرسال طلب شحن ببجي موبايل بنجاح!**\n\n🆔 رقم الطلب: \`${orderId}\`\n🎮 الخدمة: ${state.service}\n👤 بيانات الحساب: ${pubgDetails}\n💰 المبلغ المخصوم: ${totalCost} ج\n⏳ جاري تنفيذ الشحن.`,
                { parse_mode: 'Markdown' }
            );
            await showMainMenu(ctx, userName, false);

            if (ADMIN_CHAT_ID) {
                const adminMsg = `🚨 **طلب شحن ببجي موبايل جديد!**\n\n🆔 رقم الطلب: \`${orderId}\`\n👤 المستخدم ID: \`${userId}\`\n🎮 الخدمة: ${state.service}\n🎯 بيانات الحساب (الايدي والاسم): ${pubgDetails}\n💰 التكلفة: ${totalCost} ج\n\n📌 الحالة: ⏳ قيد الانتظار`;

                await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg, {
                    parse_mode: 'Markdown',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback(`⏳ قيد التنفيذ`, `status_proc_${orderId}`)],
                        [Markup.button.callback(`✅ اكتمال الطلب`, `status_comp_${orderId}`)],
                        [Markup.button.callback(`❌ إلغاء الطلب (إرجاع المبلغ)`, `status_rej_${orderId}`)]
                    ])
                });
            }
        } catch (err) {
            console.error("Order Error:", err);
            ctx.reply('حدث خطأ أثناء معالجة طلب الشدات.');
        }
    }
    // 5. استقبال الطلبات المجانية (تيك توك لايكات أو مشاهدات)
    else if (state.step === 'waiting_free_link') {
        const freeLink = text;
        const orderId = 'FREE-' + Date.now().toString().slice(-6);

        try {
            await db.execute(
                'INSERT INTO free_orders (order_id, user_id, username, service_type, link, quantity, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
                [orderId, userId, username, state.service, freeLink, state.quantity, 'pending']
            );

            delete userState[userId];

            await ctx.reply(
                `🎁 **تم استلام طلبك المجاني بنجاح!**\n\n🆔 رقم الطلب: \`${orderId}\`\n📦 الخدمة: ${state.service}\n🔗 الرابط: ${freeLink}\n⏳ سيتم المراجعة والتنفيذ قريباً.`,
                { parse_mode: 'Markdown' }
            );
            await showMainMenu(ctx, userName, false);

            if (ADMIN_CHAT_ID) {
                const adminMsg = `🎁 **طلب مجاني جديد (${state.service})!**\n\n🆔 رقم الطلب: \`${orderId}\`\n👤 العميل: ${username} (\`${userId}\`)\n📊 الكمية: ${state.quantity}\n🔗 الرابط: ${freeLink}\n\n📌 الحالة: ⏳ قيد الانتظار`;

                await bot.telegram.sendMessage(ADMIN_CHAT_ID, adminMsg, {
                    parse_mode: 'Markdown',
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback(`✅ تم التنفيذ`, `free_comp_${orderId}`)],
                        [Markup.button.callback(`❌ إلغاء الطلب (بدون استرجاع)`, `free_rej_${orderId}`)]
                    ])
                });
            }
        } catch (err) {
            console.error("Free Order Error:", err);
            ctx.reply('حدث خطأ أثناء حفظ الطلب المجاني في القاعدة.');
        }
    }
    else {
        return next();
    }
});

// تحكم الآدمن الموحد للطلبات المدفوعة
async function updateAdminMessage(ctx, orderId, newStatusText, removeButtons = false) {
    try {
        const originalText = ctx.callbackQuery.message.text;
        let updatedText = originalText.includes('📌 الحالة:') 
            ? originalText.replace(/📌 الحالة: .*/, `📌 الحالة: ${newStatusText}`)
            : originalText + `\n\n📌 الحالة: ${newStatusText}`;

        if (removeButtons) {
            await ctx.editMessageText(updatedText, { parse_mode: 'Markdown' });
        } else {
            await ctx.editMessageText(updatedText, {
                parse_mode: 'Markdown',
                ...Markup.inlineKeyboard([
                    [Markup.button.callback(`⏳ قيد التنفيذ`, `status_proc_${orderId}`)],
                    [Markup.button.callback(`✅ اكتمال الطلب`, `status_comp_${orderId}`)],
                    [Markup.button.callback(`❌ إلغاء الطلب (إرجاع المبلغ)`, `status_rej_${orderId}`)]
                ])
            });
        }
    } catch (e) {}
}

bot.action(/status_proc_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    try { await ctx.answerCbQuery('تم التحديث إلى قيد التنفيذ ⏳'); } catch (e) {}

    const [orderRows] = await db.execute('SELECT user_id FROM orders WHERE order_id = ?', [orderId]);
    if (orderRows.length === 0) return;
    const targetUserId = orderRows[0].user_id;

    await db.execute('UPDATE orders SET status = "processing" WHERE order_id = ?', [orderId]);
    await updateAdminMessage(ctx, orderId, '⏳ قيد التنفيذ 🚀', false);

    try { await bot.telegram.sendMessage(targetUserId, `🔔 طلبك رقم \`${orderId}\` أصبح الآن **قيد التنفيذ** 🚀`, { parse_mode: 'Markdown' }); } catch (e) {}
});

bot.action(/status_comp_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    try { await ctx.answerCbQuery('تم اكتمال الطلب ✅'); } catch (e) {}

    const [orderRows] = await db.execute('SELECT user_id FROM orders WHERE order_id = ?', [orderId]);
    if (orderRows.length === 0) return;
    const targetUserId = orderRows[0].user_id;

    await db.execute('UPDATE orders SET status = "completed" WHERE order_id = ?', [orderId]);
    await updateAdminMessage(ctx, orderId, '✅ مكتمل بنجاح', true);

    try { await bot.telegram.sendMessage(targetUserId, `🎉 مبروك! طلبك رقم \`${orderId}\` تم تنفيذه وإكتماله بنجاح ✅`, { parse_mode: 'Markdown' }); } catch (e) {}
});

bot.action(/status_rej_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    try { await ctx.answerCbQuery('تم إلغاء الطلب وإرجاع المبلغ ❌'); } catch (e) {}

    const [orderRows] = await db.execute('SELECT user_id, quantity, service FROM orders WHERE order_id = ?', [orderId]);
    if (orderRows.length === 0) return;
    
    const targetUserId = orderRows[0].user_id;
    const quantity = orderRows[0].quantity;
    const serviceName = orderRows[0].service || '';

    let pricePer1k = 250;
    if (serviceName.includes('الأكثر طلباً')) pricePer1k = 350;
    else if (serviceName.includes('عرب حقيقيين') || serviceName.includes('عربية')) pricePer1k = 500;
    else if (serviceName.includes('انستجرام')) pricePer1k = 160;

    let refundAmount = (quantity / 1000) * pricePer1k;
    if (serviceName.includes('شحن') || serviceName.includes('عملات') || serviceName.includes('شدات')) {
        refundAmount = serviceName.includes('65') ? 65 : (serviceName.includes('320') ? 320 : 100); 
    }

    await db.execute('UPDATE orders SET status = "rejected" WHERE order_id = ?', [orderId]);
    await db.execute('UPDATE users SET balance = balance + ? WHERE user_id = ?', [refundAmount, targetUserId]);

    await updateAdminMessage(ctx, orderId, `❌ ملغي (تم إرجاع ${refundAmount} ج للعميل)`, true);

    try { await bot.telegram.sendMessage(targetUserId, `❌ نعتذر لك، تم إلغاء طلبك رقم \`${orderId}\` وتم إرجاع مبلغ **${refundAmount} جنيه** إلى رصيدك 💳`, { parse_mode: 'Markdown' }); } catch (e) {}
});

// أزرار التحكم في الطلبات المجانية للآدمن (بدون استرجاع رصيد)
bot.action(/free_comp_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    try { await ctx.answerCbQuery('تم اكتمال الطلب المجاني ✅'); } catch (e) {}

    const [orderRows] = await db.execute('SELECT user_id FROM free_orders WHERE order_id = ?', [orderId]);
    if (orderRows.length === 0) return;
    const targetUserId = orderRows[0].user_id;

    await db.execute('UPDATE free_orders SET status = "completed" WHERE order_id = ?', [orderId]);
    try { await ctx.editMessageText(ctx.callbackQuery.message.text + '\n\n📌 الحالة: ✅ تم التنفيذ', { parse_mode: 'Markdown' }); } catch (e) {}

    try { await bot.telegram.sendMessage(targetUserId, `🎁 مبروك! طلبك المجاني رقم \`${orderId}\` تم تنفيذه بنجاح ✅`, { parse_mode: 'Markdown' }); } catch (e) {}
});

bot.action(/free_rej_(.+)/, async (ctx) => {
    const orderId = ctx.match[1];
    try { await ctx.answerCbQuery('تم إلغاء الطلب المجاني بدون استرجاع ❌'); } catch (e) {}

    const [orderRows] = await db.execute('SELECT user_id FROM free_orders WHERE order_id = ?', [orderId]);
    if (orderRows.length === 0) return;
    const targetUserId = orderRows[0].user_id;

    await db.execute('UPDATE free_orders SET status = "rejected" WHERE order_id = ?', [orderId]);
    try { await ctx.editMessageText(ctx.callbackQuery.message.text + '\n\n📌 الحالة: ❌ ملغي (بدون استرجاع)', { parse_mode: 'Markdown' }); } catch (e) {}

    try { await bot.telegram.sendMessage(targetUserId, `❌ نعتذر منك، تم إلغاء طلبك المجاني رقم \`${orderId}\`.`, { parse_mode: 'Markdown' }); } catch (e) {}
});

// أزرار التحكم في طلبات شحن الرصيد (للآدمن)
bot.action(/dep_acc_(.+)/, async (ctx) => {
    const requestId = ctx.match[1];
    try { await ctx.answerCbQuery('تمت الموافقة وإضافة الرصيد بنجاح ✅'); } catch (e) {}

    const [rows] = await db.execute('SELECT user_id, amount FROM balance_requests WHERE request_id = ?', [requestId]);
    if (rows.length === 0) return;

    const targetUserId = rows[0].user_id;
    const amount = rows[0].amount;

    await db.execute('UPDATE balance_requests SET status = "approved" WHERE request_id = ?', [requestId]);
    await db.execute('UPDATE users SET balance = balance + ? WHERE user_id = ?', [amount, targetUserId]);

    try {
        await ctx.editMessageCaption(ctx.callbackQuery.message.caption + `\n\n📌 الحالة: ✅ مقبول (تم إضافة ${amount} ج)`, {
            parse_mode: 'Markdown'
        });
    } catch (e) {}

    try { await bot.telegram.sendMessage(targetUserId, `🎉 مبروك! تم قبول طلب الشحن رقم \`${requestId}\` وإضافة مبلغ **${amount} جنيه** إلى رصيدك بنجاح 💳`, { parse_mode: 'Markdown' }); } catch (e) {}
});

bot.action(/dep_rej_(.+)/, async (ctx) => {
    const requestId = ctx.match[1];
    try { await ctx.answerCbQuery('تم رفض طلب الشحن ❌'); } catch (e) {}

    const [rows] = await db.execute('SELECT user_id FROM balance_requests WHERE request_id = ?', [requestId]);
    if (rows.length === 0) return;
    const targetUserId = rows[0].user_id;

    await db.execute('UPDATE balance_requests SET status = "rejected" WHERE request_id = ?', [requestId]);

    try {
        await ctx.editMessageCaption(ctx.callbackQuery.message.caption + `\n\n📌 الحالة: ❌ مرفوض`, {
            parse_mode: 'Markdown'
        });
    } catch (e) {}

    try { await bot.telegram.sendMessage(targetUserId, `❌ نعتذر منك، تم رفض طلب شحن الرصيد رقم \`${requestId}\` من قبل الدعم.`, { parse_mode: 'Markdown' }); } catch (e) {}
});

bot.action(/dep_diff_(.+)/, async (ctx) => {
    const requestId = ctx.match[1];
    try { await ctx.answerCbQuery(); } catch (e) {}

    userState[ctx.from.id] = { step: 'admin_typing_custom_amount', requestId: requestId };
    await ctx.reply(`✏️ أرسل الآن **المبلغ المختلف** المراد إضافته للعميل (أرقام فقط):`, { parse_mode: 'Markdown' });
});

// أزرار القائمة الرئيسية (تنظيف وتحديث الرسالة الحالية)
bot.action('main_menu', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch (e) {}
    delete userState[ctx.from.id];
    const userName = ctx.from.first_name || "صديقي";
    await showMainMenu(ctx, userName, true);
});

bot.action(['collected_points'], async (ctx) => {
    try { await ctx.answerCbQuery(); } catch (e) {}
    await ctx.reply('⚠️ هذا القسم قيد التجهيز وقريباً سيكون متاحاً!');
});

bot.action('account_balance', async (ctx) => {
    try { await ctx.answerCbQuery(); } catch (e) {}
    const userId = ctx.from.id;
    try {
        const [rows] = await db.execute('SELECT balance FROM users WHERE user_id = ?', [userId]);
        const balance = rows.length > 0 ? rows[0].balance : 0.00;
        await ctx.reply(`💰 رصيدك الحالي: ${balance} EGP`);
    } catch (err) {
        await ctx.reply('خطأ في جلب الرصيد.');
    }
});

bot.launch().then(() => {
    console.log('🤖 Leo Team Bot is fully modularized with Balance Requests, Orders & Dynamic UI!');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));