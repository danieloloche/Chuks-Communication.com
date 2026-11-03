import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PRODUCTS, INITIAL_NOTIFICATIONS } from './src/data/initialProducts.ts';
import type { Product, Order, BroadcastNotification } from './src/types.ts';

dotenv.config();

const PORT = 3000;

// In-memory persistent database for server lifecycle
let products: Product[] = [...INITIAL_PRODUCTS];
let notifications: BroadcastNotification[] = [...INITIAL_NOTIFICATIONS];
let orders: Order[] = [
  {
    id: 'CHK-9482',
    items: [
      {
        productId: 'prod-ip15pm-screen',
        productName: 'iPhone 15 Pro Max Super Retina XDR OLED Display',
        price: 198000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
        brand: 'Apple',
      },
      {
        productId: 'prod-toolkit-128',
        productName: 'Chuks Master 128-in-1 Precision Toolkit',
        price: 18500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
        brand: 'Universal',
      },
    ],
    totalAmount: 201150,
    subtotal: 216500,
    shippingFee: 2500,
    discountAmount: 17850,
    customerName: 'Emeka Nwosu',
    customerEmail: 'emeka.tech@example.com',
    customerPhone: '+234 803 555 0192',
    deliveryAddress: 'Suite 14, Commercial Tech Plaza, Ikeja',
    deliveryCity: 'Lagos',
    paymentMethod: 'card',
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    trackingNumber: 'CHK-EXP-7729104',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'CHK-8105',
    items: [
      {
        productId: 'prod-s24u-screen',
        productName: 'Samsung Galaxy S24 Ultra Dynamic AMOLED 2X Display',
        price: 185000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
        brand: 'Samsung',
      },
    ],
    totalAmount: 187500,
    subtotal: 185000,
    shippingFee: 2500,
    discountAmount: 0,
    customerName: 'Fatima Aliyu',
    customerEmail: 'fatima.aliyu@example.com',
    customerPhone: '+234 812 777 4488',
    deliveryAddress: 'Plot 204, Garki Area 2',
    deliveryCity: 'Abuja',
    paymentMethod: 'transfer',
    paymentStatus: 'paid',
    orderStatus: 'packed',
    trackingNumber: 'CHK-EXP-6618492',
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

async function startServer() {
  const app = express();
  app.use(express.json());
  // Explicit PWA Service Worker & Manifest endpoints with strict PWA headers
  app.get('/sw.js', (_req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(process.cwd(), 'public', 'sw.js'));
  });

  app.get(['/manifest.json', '/manifest.webmanifest'], (_req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=UTF-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(process.cwd(), 'public', 'manifest.json'));
  });

  // Statically serve public directory for PWA icons, assets, and images
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', store: 'Chuks Ogo Sam Venture (Chuks Store)', timestamp: new Date().toISOString() });
  });

  // PRODUCTS API
  app.get('/api/products', (_req, res) => {
    res.json(products);
  });

  app.post('/api/products', (req, res) => {
    const newProduct: Product = {
      ...req.body,
      id: req.body.id || `prod-${Date.now()}`,
      rating: req.body.rating || 5.0,
      reviewCount: req.body.reviewCount || 1,
      sku: req.body.sku || `CHK-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    };
    products.unshift(newProduct);

    // Also trigger an automatic broadcast notification for new arrival if requested
    if (req.body.isNewArrival) {
      const notif: BroadcastNotification = {
        id: `notif-${Date.now()}`,
        title: `🔥 New Arrival: ${newProduct.name} Added!`,
        message: `Fresh stock of ${newProduct.name} just landed at Chuks Store for ₦${newProduct.price.toLocaleString()}. Check it out now!`,
        type: 'new_arrival',
        timestamp: 'Just now',
      };
      notifications.unshift(notif);
    }

    res.status(201).json(newProduct);
  });

  app.patch('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }

    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
  });

  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    products = products.filter((p) => p.id !== id);
    res.json({ success: true, id });
  });

  // ORDERS API
  app.get('/api/orders', (_req, res) => {
    res.json(orders);
  });

  app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    const newOrder: Order = {
      ...orderData,
      id: orderData.id || `CHK-${Math.floor(1000 + Math.random() * 9000)}`,
      trackingNumber: `CHK-EXP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Deduct stock in real time
    if (newOrder.items && Array.isArray(newOrder.items)) {
      newOrder.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
        }
      });
    }

    orders.unshift(newOrder);
    res.status(201).json(newOrder);
  });

  app.patch('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    orders[index] = { ...orders[index], ...req.body, updatedAt: new Date().toISOString() };
    res.json(orders[index]);
  });

  // NOTIFICATIONS API
  app.get('/api/notifications', (_req, res) => {
    res.json(notifications);
  });

  app.post('/api/notifications', (req, res) => {
    const newNotif: BroadcastNotification = {
      id: `notif-${Date.now()}`,
      title: req.body.title,
      message: req.body.message,
      type: req.body.type || 'new_arrival',
      promoCode: req.body.promoCode,
      timestamp: 'Just now',
    };
    notifications.unshift(newNotif);
    res.status(201).json(newNotif);
  });

  // PRIVACY-FOCUSED ANALYTICS API (Anonymous product view and cart addition tracking)
  let serverAnalytics: Record<string, any> = {};

  app.get('/api/analytics', (_req, res) => {
    res.json(serverAnalytics);
  });

  app.post('/api/analytics/sync', (req, res) => {
    if (req.body && typeof req.body === 'object') {
      serverAnalytics = { ...serverAnalytics, ...req.body };
    }
    res.json({ success: true, count: Object.keys(serverAnalytics).length });
  });

  app.post('/api/analytics/event', (req, res) => {
    const { type, productId, productName, brand, category, quantity } = req.body;
    if (!productId) return res.status(400).json({ error: 'Missing productId' });

    const existing = serverAnalytics[productId] || {
      productId,
      productName: productName || 'Unknown Part',
      brand: brand || 'Universal',
      category: category || 'accessories',
      views: 0,
      cartAdds: 0,
    };

    if (type === 'view') {
      existing.views += 1;
      existing.lastViewedAt = new Date().toISOString();
    } else if (type === 'cart_add') {
      existing.cartAdds += Number(quantity) || 1;
      existing.lastCartedAt = new Date().toISOString();
    }

    serverAnalytics[productId] = existing;
    res.json({ success: true, metric: existing });
  });

  // GEMINI AI ASSISTANT API
  app.post('/api/ai/chat', async (req, res) => {
    const { message, history, context } = req.body;

    // Build rich context about current catalog, recent orders, and policies
    const catalogSummary = products
      .slice(0, 28)
      .map((p) => `- ${p.name} [SKU: ${p.sku}] (Category: ${p.category}, Brand: ${p.brand}, Price: ₦${p.price.toLocaleString()}, Stock: ${p.stock} units, Warranty: ${p.warranty}, Difficulty: ${p.repairDifficulty})`)
      .join('\n');

    const policiesSummary = `
- Business Name: Chuks Communication
- Location: Park Road, Gwagwalada, Abuja
- Specialization: Screens (InCell, JK, GX, Service Pack OLED), in-display optical calibrators (Relife RL-071), charging down boards with original ICs, replacement batteries, and precision repair tools.
- Testing Warranty Rule: All replacement screens have a strict 30-Day Testing Warranty. Technicians and customers MUST test touch, brightness, and display on the motherboard BEFORE peeling factory stamps/protective films or applying glue.
- Battery Warranty: 6 months replacement warranty (zero-cycle genuine TI protection ICs).
- Dispatch & Delivery: Same-day store pickup at Park Road, Gwagwalada, Abuja dispatch, same-day delivery across Abuja metropolis, and 24-48 hour nationwide park waybill.
- Hotline & WhatsApp: 07039564380.
- Wholesale & Pricing: Direct wholesale trade rates for technicians and repair workshops.
`;

    // Check if user is asking for order tracking
    const orderIdMatch = message.match(/CHK-[A-Za-z0-9]+/i);
    let matchedOrderInfo = '';
    if (orderIdMatch) {
      const foundOrder = orders.find((o) => o.id.toUpperCase() === orderIdMatch[0].toUpperCase());
      if (foundOrder) {
        matchedOrderInfo = `
FOUND ORDER IN SYSTEM:
- Order ID: ${foundOrder.id}
- Customer: ${foundOrder.customerName}
- Status: ${foundOrder.orderStatus.toUpperCase()}
- Tracking Number: ${foundOrder.trackingNumber}
- Items: ${foundOrder.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
- Destination: ${foundOrder.deliveryAddress}, ${foundOrder.deliveryCity}
- Total Paid: ₦${foundOrder.totalAmount.toLocaleString()}
`;
      } else {
        matchedOrderInfo = `No order found with ID ${orderIdMatch[0]}. Please advise customer to verify their Order ID on their Chuks Communication receipt.`;
      }
    }

    const systemInstruction = `
You are the official master assistant for "Chuks Communication" (located at Park Road, Gwagwalada, Abuja).
You specialize in smartphone screens, optical fingerprint calibrators, charging down boards, batteries, and technician repair tools.

Current Store Data & Catalog:
${catalogSummary}

Store Policies & Warranty:
${policiesSummary}

${matchedOrderInfo ? `Order Search Results: ${matchedOrderInfo}` : ''}

Customer Browsing Context:
${context ? JSON.stringify(context) : 'General Store Visitor'}

Guidelines:
1. Speak in a natural, friendly, expert Nigerian electronics store tone. Never be stuffy, stiff, overly academic, or robotic.
2. Keep replies concise and direct (2 to 4 sentences). Give clear pricing in Nigerian Naira (₦).
3. If asked about screens, advise on screen grades (InCell = budget/AAA+, JK = high-color/great viewing angle, GX = hard OLED, Service Pack = genuine 100% OEM AMOLED) and always highlight the 30-day testing warranty (test on board before gluing).
4. If asked about fingerprint or optical calibrator, mention the Relife RL-071 Optical Fingerprint Calibrator for in-display sensors on Samsung, Xiaomi, Oppo, Vivo.
5. If customer needs direct human assistance, call or WhatsApp: 07039564380. Location: Park Road, Gwagwalada, Abuja.
6. For bank transfer payments, the official account is: Bank: Moniepoint MFB, Account Number: 8163301810, Account Name: Chuks Ogo Sam Venture. Instant confirmation on WhatsApp: 07039564380.
`;

    // Helper to find matching products
    const lowerMsg = message.toLowerCase();
    const matchedProductsInCatalog = products.filter((p) => {
      const nameParts = p.name.toLowerCase().split(' ').filter((w) => w.length > 2);
      const brandMatch = lowerMsg.includes(p.brand.toLowerCase());
      const modelMatch = p.compatibleModels.some((m) => lowerMsg.includes(m.toLowerCase()));
      const wordMatch = nameParts.some((np) => lowerMsg.includes(np));
      const skuMatch = lowerMsg.includes(p.sku.toLowerCase());
      return (brandMatch && wordMatch) || modelMatch || skuMatch;
    }).slice(0, 3);

    const apiKey = process.env.GEMINI_API_KEY;
    const isValidApiKey = Boolean(
      apiKey &&
      apiKey !== 'MY_GEMINI_API_KEY' &&
      !apiKey.startsWith('MY_') &&
      apiKey.trim().length > 15
    );

    if (isValidApiKey) {
      const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const chatContents = (history || []).slice(-6).map((h: { sender: string; text: string }) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        }));

        chatContents.push({
          role: 'user',
          parts: [{ text: message }],
        });

        for (const model of candidateModels) {
          try {
            const generatePromise = ai.models.generateContent({
              model,
              contents: chatContents,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });

            // Set strict 4s timeout so dev/user experience is never blocked
            const timeoutPromise = new Promise((_, reject) =>
              setTimeout(() => reject(new Error('AI generation timed out')), 4000)
            );

            const response = (await Promise.race([generatePromise, timeoutPromise])) as any;

            if (response?.text) {
              return res.json({ reply: response.text, matchedProducts: matchedProductsInCatalog });
            }
          } catch (modelErr: unknown) {
            console.warn(`Gemini model ${model} temporarily unavailable or timed out, trying fallback...`);
          }
        }
      } catch (initErr: unknown) {
        console.warn('Gemini client initialization warning, using contextual assistant fallback.');
      }
    }

    // Context-aware intelligent fallback if key is missing or models are experiencing peak demand
    let reply = '';
    const lower = message.toLowerCase();

    // Fallback matching using pre-computed matchedProductsInCatalog
    if (orderIdMatch && matchedOrderInfo) {
      reply = `Hello! I checked our system for your order **${orderIdMatch[0].toUpperCase()}**:\n\n${matchedOrderInfo}\n\nNeed any further assistance with delivery or dispatch? Just let me know!`;
    } else if (lower.includes('track') || lower.includes('where is my order') || lower.includes('status')) {
      reply = `To check your past orders and download your official invoice receipt, tap **My Orders** in the navigation bar. You can also send your Order ID directly to our admin via WhatsApp at **+234 703 956 4380** for immediate status verification!`;
    } else if (matchedProductsInCatalog.length > 0) {
      const topMatches = matchedProductsInCatalog.slice(0, 3);
      const itemsText = topMatches
        .map(
          (p) =>
            `• **${p.name}**\n  - Trade Price: **₦${p.price.toLocaleString()}**\n  - Stock Status: ${p.stock > 0 ? `✅ ${p.stock} units available` : '⚠️ Out of stock'}\n  - Warranty: ${p.warranty}\n  - Repair Difficulty: ${p.repairDifficulty}`
        )
        .join('\n\n');
      reply = `Here are the matching parts available right now at **Chuks Store**:\n\n${itemsText}\n\n💡 *Tip: Remember to test all screen and flex parts before peeling warranty seals or gluing! All prices reflect direct wholesale trade rates.*`;
    } else if (lower.includes('screen') || lower.includes('display') || lower.includes('oled') || lower.includes('lcd')) {
      reply = `At Chuks Store, we supply 100% genuine Service Pack AMOLEDs and AAA+ replacement screens for **Samsung, iPhone, Tecno, Infinix, and Xiaomi**.\n\n✨ **Featured Screens:**\n- **Samsung S24 Ultra Dynamic AMOLED 2X** (with frame): ₦185,000\n- **iPhone 15 Pro Max Super Retina XDR OLED**: ₦198,000\n- **Tecno Camon 20 Pro 5G AMOLED**: ₦48,000\n\n🛡️ **Important Policy**: All our screens carry a **30-Day Testing Warranty**. Please connect the display flex and test touch and display before removing protective films or applying adhesive!`;
    } else if (lower.includes('battery') || lower.includes('charging') || lower.includes('mah')) {
      reply = `We stock original zero-cycle high-capacity replacement batteries with original Texas Instruments protection ICs!\n\n🔋 **Popular Batteries:**\n- **iPhone 14 Pro Max 4323mAh**: ₦32,000 (0-Cycle, 100% Health)\n- **Samsung Galaxy S23 Ultra 5000mAh**: ₦28,000\n\nAll our batteries include a **6-Month Replacement Guarantee**!`;
    } else if (lower.includes('discount') || lower.includes('promo') || lower.includes('coupon') || lower.includes('wholesale')) {
      reply = `At Chuks Store, we provide **direct wholesale trade pricing**:\n\n⚡ **Wholesale Bulk Tiers**: Automatic volume pricing for 5+ units up to 50+ units.\n🚚 **Abuja & Nationwide Dispatch**: Same-day dispatch from Park Road, Gwagwalada, Abuja. Free delivery on qualified bulk orders!`;
    } else if (lower.includes('policy') || lower.includes('warranty') || lower.includes('return')) {
      reply = `Here are the official customer protection policies of **Chuks Communication**:\n\n1. **30-Day Screen Testing Warranty**: You can return or exchange any screen as long as the factory stamp/seal is intact and has not been glued.\n2. **6-Month Battery Guarantee**: Protection against early swelling or rapid capacity loss.\n3. **1-Year Warranty on Chargers & Toolkits**.\n4. **Express Dispatch**: Orders received before 2:00 PM are dispatched same-day from Park Road, Gwagwalada, Abuja!`;
    } else if (lower.includes('bank') || lower.includes('account') || lower.includes('transfer') || lower.includes('pay') || lower.includes('opay') || lower.includes('moniepoint')) {
      reply = `Here are the official bank transfer payment details for **Chuks Communication**:\n\n🏦 **Bank Name:** **Moniepoint MFB**\n🔢 **Account Number:** **8163301810**\n👤 **Account Name:** **Chuks Ogo Sam Venture**\n📱 **Accepted From:** Any Nigerian Bank App, USSD, OPay or POS\n\n💬 Send payment receipt / transaction reference to WhatsApp **+234 703 956 4380** for immediate order dispatch!`;
    } else if (lower.includes('whatsapp') || lower.includes('call') || lower.includes('phone') || lower.includes('admin') || lower.includes('contact') || lower.includes('human') || lower.includes('owner') || lower.includes('number')) {
      reply = `You can directly reach the **Chuks Store** store admin and lead technician:\n\n📞 **Phone Calling Line:** [+234 703 956 4380](tel:+2347039564380)\n💬 **WhatsApp Line:** [+234 703 956 4380](https://wa.me/2347039564380)\n\n📍 **Location:** After First Bank, Park Road, Gwagwalada, Abuja.\nFeel free to call or WhatsApp anytime for direct parts inquiries, wholesale orders, or rapid payment verification!`;
    } else if (lower.includes('tool') || lower.includes('kit') || lower.includes('glue') || lower.includes('repair')) {
      reply = `For DIY and technician repairs, we highly recommend our **Chuks Master 128-in-1 Precision Screwdriver Toolkit** (₦18,500) paired with **Zhanlida B-7000 Waterproof Adhesive** (₦4,500). It covers all iPhone pentalobe screws, Android Torx, and includes suction pliers!`;
    } else {
      reply = `Welcome to **Chuks Communication (Chuks Store)**! I am your AI parts and repair consultant.\n\nI can help you with:\n- Finding the exact replacement screen, battery, or charging flex for your phone\n- Checking screen grade differences (InCell vs JK vs GX vs Service Pack)\n- Store testing warranty and return policies\n- Wholesale trade rates and workshop estimates\n\nWhich phone model or part are you looking for today?`;
    }

    res.json({ reply, matchedProducts: matchedProductsInCatalog });
  });

  // Vite dev middleware vs production static distribution
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chuks Store server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
