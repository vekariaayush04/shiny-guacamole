import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================================
  // CLEANUP (order matters due to foreign keys)
  // ============================================================
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.address.deleteMany();
//   await prisma.fAQ.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // ============================================================
  // USERS
  // ============================================================
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user_alice',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+1-555-0101',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user_bob',
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '+1-555-0102',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user_carol',
        name: 'Carol Davis',
        email: 'carol@example.com',
        phone: '+1-555-0103',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // ============================================================
  // ADDRESSES
  // ============================================================
  const addresses = await Promise.all([
    // Alice's address
    prisma.address.create({
      data: {
        id: 'addr_alice_1',
        userId: 'user_alice',
        house: '42A',
        street: 'Maple Street',
        district: 'Downtown',
        pincode: '560001',
        state: 'Karnataka',
        country: 'India',
        isDefault: true,
      },
    }),
    // Bob's address
    prisma.address.create({
      data: {
        id: 'addr_bob_1',
        userId: 'user_bob',
        house: '7',
        street: 'Oak Avenue',
        district: 'Westside',
        pincode: '400001',
        state: 'Maharashtra',
        country: 'India',
        isDefault: true,
      },
    }),
    // Carol's address
    prisma.address.create({
      data: {
        id: 'addr_carol_1',
        userId: 'user_carol',
        house: '15B',
        street: 'Pine Road',
        district: 'Northpark',
        pincode: '110001',
        state: 'Delhi',
        country: 'India',
        isDefault: true,
      },
    }),
  ]);

  console.log(`✅ Created ${addresses.length} addresses`);

  // ============================================================
  // ORDERS
  // ============================================================

  // Alice - delivered order
  const order1 = await prisma.orders.create({
    data: {
      id: 'order_1',
      orderNumber: 'ORD-1001',
      userId: 'user_alice',
      description: 'Electronics - Wireless Headphones + Laptop Stand',
      price: 4500.00,
      orderStatus: 'SUCCESS',
      deliveryStatus: 'DELIVERED',
      addressId: 'addr_alice_1',
      items: {
        create: [
          {
            productName: 'Sony WH-1000XM5 Wireless Headphones',
            productSku: 'SKU-SONY-WH1000',
            quantity: 1,
            unitPrice: 3500.00,
            totalPrice: 3500.00,
          },
          {
            productName: 'Adjustable Laptop Stand',
            productSku: 'SKU-STAND-ALU',
            quantity: 1,
            unitPrice: 1000.00,
            totalPrice: 1000.00,
          },
        ],
      },
    },
  });

  // Alice - in-transit order
  const order2 = await prisma.orders.create({
    data: {
      id: 'order_2',
      orderNumber: 'ORD-1002',
      userId: 'user_alice',
      description: 'Books - Programming Bundle',
      price: 1200.00,
      orderStatus: 'PROCESSING',
      deliveryStatus: 'OUT_FOR_DELIVERY',
      addressId: 'addr_alice_1',
      items: {
        create: [
          {
            productName: 'Clean Code by Robert C. Martin',
            productSku: 'SKU-BOOK-CC',
            quantity: 1,
            unitPrice: 600.00,
            totalPrice: 600.00,
          },
          {
            productName: 'The Pragmatic Programmer',
            productSku: 'SKU-BOOK-PP',
            quantity: 1,
            unitPrice: 600.00,
            totalPrice: 600.00,
          },
        ],
      },
    },
  });

  // Bob - cancelled order
  const order3 = await prisma.orders.create({
    data: {
      id: 'order_3',
      orderNumber: 'ORD-1003',
      userId: 'user_bob',
      description: 'Home Appliances - Air Purifier',
      price: 8999.00,
      orderStatus: 'CANCELLED',
      deliveryStatus: 'PREPARING_TO_DISPATCH',
      addressId: 'addr_bob_1',
      items: {
        create: [
          {
            productName: 'Dyson Air Purifier Cool',
            productSku: 'SKU-DYSON-AP',
            quantity: 1,
            unitPrice: 8999.00,
            totalPrice: 8999.00,
          },
        ],
      },
    },
  });

  // Bob - processing order
  const order4 = await prisma.orders.create({
    data: {
      id: 'order_4',
      orderNumber: 'ORD-1004',
      userId: 'user_bob',
      description: 'Gaming - Mechanical Keyboard',
      price: 5500.00,
      orderStatus: 'PROCESSING',
      deliveryStatus: 'DISPATCHED',
      addressId: 'addr_bob_1',
      items: {
        create: [
          {
            productName: 'Keychron K2 Mechanical Keyboard',
            productSku: 'SKU-KEY-K2',
            quantity: 1,
            unitPrice: 5500.00,
            totalPrice: 5500.00,
          },
        ],
      },
    },
  });

  // Carol - refunded order
  const order5 = await prisma.orders.create({
    data: {
      id: 'order_5',
      orderNumber: 'ORD-1005',
      userId: 'user_carol',
      description: 'Fashion - Running Shoes',
      price: 3200.00,
      orderStatus: 'REFUNDED',
      deliveryStatus: 'RETURNED',
      addressId: 'addr_carol_1',
      items: {
        create: [
          {
            productName: 'Nike Air Zoom Pegasus 40',
            productSku: 'SKU-NIKE-PEG40',
            quantity: 1,
            unitPrice: 3200.00,
            totalPrice: 3200.00,
          },
        ],
      },
    },
  });

  // Carol - successful delivered order
  const order6 = await prisma.orders.create({
    data: {
      id: 'order_6',
      orderNumber: 'ORD-1006',
      userId: 'user_carol',
      description: 'Kitchen - Coffee Machine',
      price: 12000.00,
      orderStatus: 'SUCCESS',
      deliveryStatus: 'DELIVERED',
      addressId: 'addr_carol_1',
      items: {
        create: [
          {
            productName: 'De\'Longhi Magnifica Evo Coffee Machine',
            productSku: 'SKU-DL-MAG',
            quantity: 1,
            unitPrice: 12000.00,
            totalPrice: 12000.00,
          },
        ],
      },
    },
  });

  console.log('✅ Created 6 orders with items');

  // ============================================================
  // DELIVERIES
  // ============================================================
  await Promise.all([
    // order1 - delivered
    prisma.delivery.create({
      data: {
        orderId: 'order_1',
        trackingNumber: 'TRK-FDX-00100123',
        carrier: 'FedEx',
        status: 'DELIVERED',
        estimatedDate: new Date('2024-12-20'),
        deliveredDate: new Date('2024-12-19'),
        currentLocation: 'Delivered - Bangalore',
        trackingEvents: [
          { location: 'Mumbai Warehouse', status: 'DISPATCHED', timestamp: '2024-12-15T10:00:00Z' },
          { location: 'Pune Hub', status: 'IN_TRANSIT', timestamp: '2024-12-16T14:00:00Z' },
          { location: 'Bangalore Facility', status: 'IN_TRANSIT', timestamp: '2024-12-18T09:00:00Z' },
          { location: 'Bangalore - Whitefield', status: 'OUT_FOR_DELIVERY', timestamp: '2024-12-19T08:00:00Z' },
          { location: '42A Maple Street', status: 'DELIVERED', timestamp: '2024-12-19T14:32:00Z' },
        ],
      },
    }),

    // order2 - out for delivery
    prisma.delivery.create({
      data: {
        orderId: 'order_2',
        trackingNumber: 'TRK-UPS-00200456',
        carrier: 'UPS',
        status: 'OUT_FOR_DELIVERY',
        estimatedDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
        currentLocation: 'Bangalore City Hub - Out for Delivery',
        trackingEvents: [
          { location: 'Delhi Warehouse', status: 'DISPATCHED', timestamp: new Date(Date.now() - 3 * 86400000).toISOString() },
          { location: 'Hyderabad Hub', status: 'IN_TRANSIT', timestamp: new Date(Date.now() - 2 * 86400000).toISOString() },
          { location: 'Bangalore City Hub', status: 'OUT_FOR_DELIVERY', timestamp: new Date(Date.now() - 6 * 3600000).toISOString() },
        ],
      },
    }),

    // order4 - dispatched
    prisma.delivery.create({
      data: {
        orderId: 'order_4',
        trackingNumber: 'TRK-DHL-00400789',
        carrier: 'DHL',
        status: 'DISPATCHED',
        estimatedDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        currentLocation: 'Chennai Distribution Center',
        trackingEvents: [
          { location: 'Chennai Warehouse', status: 'DISPATCHED', timestamp: new Date(Date.now() - 1 * 86400000).toISOString() },
        ],
      },
    }),

    // order5 - returned
    prisma.delivery.create({
      data: {
        orderId: 'order_5',
        trackingNumber: 'TRK-FDX-00500321',
        carrier: 'FedEx',
        status: 'RETURNED',
        estimatedDate: new Date('2024-12-10'),
        deliveredDate: new Date('2024-12-08'),
        currentLocation: 'Returned to Warehouse - Delhi',
        trackingEvents: [
          { location: 'Delhi Warehouse', status: 'DISPATCHED', timestamp: '2024-12-01T10:00:00Z' },
          { location: 'Delhi - Connaught Place', status: 'DELIVERED', timestamp: '2024-12-08T11:00:00Z' },
          { location: 'Delhi - Connaught Place', status: 'RETURNED', timestamp: '2024-12-10T15:00:00Z' },
        ],
      },
    }),

    // order6 - delivered
    prisma.delivery.create({
      data: {
        orderId: 'order_6',
        trackingNumber: 'TRK-UPS-00600654',
        carrier: 'UPS',
        status: 'DELIVERED',
        estimatedDate: new Date('2024-11-25'),
        deliveredDate: new Date('2024-11-24'),
        currentLocation: 'Delivered - New Delhi',
        trackingEvents: [
          { location: 'Mumbai Warehouse', status: 'DISPATCHED', timestamp: '2024-11-20T09:00:00Z' },
          { location: 'Jaipur Hub', status: 'IN_TRANSIT', timestamp: '2024-11-21T16:00:00Z' },
          { location: 'Delhi Facility', status: 'IN_TRANSIT', timestamp: '2024-11-23T10:00:00Z' },
          { location: 'Delhi - Connaught Place', status: 'DELIVERED', timestamp: '2024-11-24T13:00:00Z' },
        ],
      },
    }),
  ]);

  console.log('✅ Created deliveries with tracking events');

  // ============================================================
  // INVOICES
  // ============================================================
  await Promise.all([
    // order1 - paid invoice
    prisma.invoice.create({
      data: {
        id: 'inv_1',
        invoiceNumber: 'INV-2024-001',
        orderId: 'order_1',
        userId: 'user_alice',
        amount: 4237.00,
        tax: 263.00,
        total: 4500.00,
        status: 'PAID',
        dueDate: new Date('2024-12-15'),
        paidAt: new Date('2024-12-10'),
        paymentMethod: 'CREDIT_CARD',
        paymentRef: 'PAY-CC-8823XX',
      },
    }),

    // order2 - pending invoice
    prisma.invoice.create({
      data: {
        id: 'inv_2',
        invoiceNumber: 'INV-2024-002',
        orderId: 'order_2',
        userId: 'user_alice',
        amount: 1130.00,
        tax: 70.00,
        total: 1200.00,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        paymentMethod: 'UPI',
        paymentRef: 'PAY-UPI-4471XX',
      },
    }),

    // order3 - cancelled invoice
    prisma.invoice.create({
      data: {
        id: 'inv_3',
        invoiceNumber: 'INV-2024-003',
        orderId: 'order_3',
        userId: 'user_bob',
        amount: 8480.00,
        tax: 519.00,
        total: 8999.00,
        status: 'CANCELLED',
        dueDate: new Date('2024-12-20'),
        paymentMethod: 'NETBANKING',
      },
    }),

    // order4 - pending invoice
    prisma.invoice.create({
      data: {
        id: 'inv_4',
        invoiceNumber: 'INV-2024-004',
        orderId: 'order_4',
        userId: 'user_bob',
        amount: 5188.00,
        tax: 312.00,
        total: 5500.00,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        paymentMethod: 'CREDIT_CARD',
        paymentRef: 'PAY-CC-9912XX',
      },
    }),

    // order5 - refunded invoice
    prisma.invoice.create({
      data: {
        id: 'inv_5',
        invoiceNumber: 'INV-2024-005',
        orderId: 'order_5',
        userId: 'user_carol',
        amount: 3018.00,
        tax: 182.00,
        total: 3200.00,
        status: 'REFUNDED',
        dueDate: new Date('2024-12-05'),
        paidAt: new Date('2024-12-01'),
        paymentMethod: 'UPI',
        paymentRef: 'PAY-UPI-7734XX',
      },
    }),

    // order6 - paid invoice
    prisma.invoice.create({
      data: {
        id: 'inv_6',
        invoiceNumber: 'INV-2024-006',
        orderId: 'order_6',
        userId: 'user_carol',
        amount: 11322.00,
        tax: 678.00,
        total: 12000.00,
        status: 'PAID',
        dueDate: new Date('2024-11-22'),
        paidAt: new Date('2024-11-20'),
        paymentMethod: 'CREDIT_CARD',
        paymentRef: 'PAY-CC-5523XX',
      },
    }),
  ]);

  console.log('✅ Created 6 invoices');

  // ============================================================
  // REFUNDS
  // ============================================================
  await Promise.all([
    // Carol's refund for shoes - completed
    prisma.refund.create({
      data: {
        id: 'ref_1',
        refundNumber: 'REF-2024-001',
        orderId: 'order_5',
        userId: 'user_carol',
        amount: 3200.00,
        reason: 'Wrong size delivered. Ordered size 8 but received size 9.',
        status: 'COMPLETED',
        processedBy: 'Support Agent',
        notes: 'Verified via photo evidence. Full refund approved.',
        requestedAt: new Date('2024-12-10'),
        processedAt: new Date('2024-12-11'),
        completedAt: new Date('2024-12-13'),
      },
    }),

    // Bob's refund for cancelled order - processing
    prisma.refund.create({
      data: {
        id: 'ref_2',
        refundNumber: 'REF-2024-002',
        orderId: 'order_3',
        userId: 'user_bob',
        amount: 8999.00,
        reason: 'Customer cancelled before shipment. Full refund requested.',
        status: 'PROCESSING',
        processedBy: 'Billing Agent',
        notes: 'Order cancelled at customer request. Refund in progress.',
        requestedAt: new Date(Date.now() - 2 * 86400000),
        processedAt: new Date(Date.now() - 1 * 86400000),
      },
    }),

    // Alice's partial refund request - reviewing
    prisma.refund.create({
      data: {
        id: 'ref_3',
        refundNumber: 'REF-2024-003',
        orderId: 'order_1',
        userId: 'user_alice',
        amount: 1000.00,
        reason: 'Laptop stand arrived with minor scratch on the base. Requesting partial refund.',
        status: 'REVIEWING',
        requestedAt: new Date(Date.now() - 1 * 86400000),
      },
    }),
  ]);

  console.log('✅ Created 3 refunds');

  // ============================================================
  // FAQs (for Support Agent)
  // ============================================================
//   await Promise.all([
//     // Shipping FAQs
//     prisma.fAQ.create({
//       data: {
//         question: 'How long does delivery take?',
//         answer: 'Standard delivery takes 3-7 business days. Express delivery (1-2 business days) is available at checkout for an additional fee. Delivery times may vary based on your location and product availability.',
//         category: 'shipping',
//         tags: ['delivery', 'shipping', 'time', 'days'],
//       },
//     }),
//     prisma.fAQ.create({
//       data: {
//         question: 'Can I track my order?',
//         answer: 'Yes! Once your order is dispatched, you will receive a tracking number via email and SMS. You can use this tracking number on our website or the carrier\'s website to monitor your delivery in real-time. You can also check order status in the Orders section of your account.',
//         category: 'shipping',
//         tags: ['tracking', 'order', 'status', 'delivery'],
//       },
//     }),
//     prisma.fAQ.create({
//       data: {
//         question: 'Do you offer free shipping?',
//         answer: 'Yes! Orders above ₹999 qualify for free standard shipping. For orders below ₹999, a flat shipping fee of ₹99 is charged. Express and same-day delivery always have additional charges regardless of order value.',
//         category: 'shipping',
//         tags: ['free shipping', 'cost', 'charges'],
//       },
//     }),

//     // Returns FAQs
//     prisma.fAQ.create({
//       data: {
//         question: 'What is your return policy?',
//         answer: 'We offer a 30-day hassle-free return policy for most products. Items must be unused, in original packaging, and with all tags attached. Electronics have a 7-day return window. Perishable goods, personalized items, and digital products cannot be returned. To initiate a return, go to Orders in your account and click "Return Item".',
//         category: 'returns',
//         tags: ['return', 'policy', 'refund', '30 days'],
//       },
//     }),
//     prisma.fAQ.create({
//       data: {
//         question: 'How do I return a damaged or defective item?',
//         answer: 'If you received a damaged or defective item, please contact our support team within 48 hours of delivery. Take photos of the damage and your order packaging. We will arrange a free pickup and send you a replacement or full refund within 5-7 business days. You will not need to pay any return shipping for damaged items.',
//         category: 'returns',
//         tags: ['damaged', 'defective', 'return', 'replacement'],
//       },
//     }),

//     // Payments / Billing FAQs
//     prisma.fAQ.create({
//       data: {
//         question: 'What payment methods do you accept?',
//         answer: 'We accept all major payment methods including Credit Cards (Visa, Mastercard, Amex), Debit Cards, UPI (GPay, PhonePe, Paytm), Net Banking, EMI options (0% EMI on select cards for orders above ₹3000), and Cash on Delivery for orders below ₹10,000.',
//         category: 'billing',
//         tags: ['payment', 'methods', 'credit card', 'UPI', 'EMI', 'COD'],
//       },
//     }),
//     prisma.fAQ.create({
//       data: {
//         question: 'How long does a refund take?',
//         answer: 'Refund processing times depend on your payment method: Credit/Debit Cards take 5-7 business days, UPI takes 1-3 business days, Net Banking takes 3-5 business days, and Cash on Delivery refunds are issued as store credit within 24 hours. You will receive an email confirmation when the refund is initiated.',
//         category: 'billing',
//         tags: ['refund', 'time', 'processing', 'credit card', 'UPI'],
//       },
//     }),
//     prisma.fAQ.create({
//       data: {
//         question: 'Is it safe to save my card details?',
//         answer: 'Yes, it is completely safe. We use industry-standard PCI-DSS compliant encryption to store your card details. We never store your full card number or CVV. The information is tokenized and stored securely. You can remove saved cards anytime from your Account Settings.',
//         category: 'billing',
//         tags: ['security', 'card', 'safe', 'payment', 'PCI'],
//       },
//     }),

//     // Account FAQs
//     prisma.fAQ.create({
//       data: {
//         question: 'How do I reset my password?',
//         answer: 'To reset your password: 1) Click "Login" on the homepage, 2) Click "Forgot Password", 3) Enter your registered email address, 4) Check your email for a reset link (valid for 15 minutes), 5) Click the link and set your new password. If you don\'t receive the email, check your spam folder or contact support.',
//         category: 'account',
//         tags: ['password', 'reset', 'forgot', 'login', 'account'],
//       },
//     }),
//     prisma.fAQ.create({
//       data: {
//         question: 'How do I cancel my order?',
//         answer: 'You can cancel an order before it is dispatched. Go to Orders in your account, select the order, and click "Cancel Order". If the order has already been dispatched, you cannot cancel it but can initiate a return once delivered. Cancellation refunds are processed within 2-3 business days.',
//         category: 'orders',
//         tags: ['cancel', 'order', 'cancellation'],
//       },
//     }),
//     prisma.fAQ.create({
//       data: {
//         question: 'Can I change my delivery address after placing an order?',
//         answer: 'You can change the delivery address only if the order has not been dispatched yet. Go to Orders, select your order, and click "Edit Address". If the order is already dispatched, please contact our support team immediately and we will try to redirect the package, though this is not always possible.',
//         category: 'orders',
//         tags: ['address', 'change', 'delivery', 'order'],
//       },
//     }),
//   ]);

//   console.log('✅ Created 11 FAQs');

  // ============================================================
  // CONVERSATIONS & MESSAGES (sample chat history)
  // ============================================================

  // Alice - conversation about her order tracking
  const conv1 = await prisma.conversation.create({
    data: {
      id: 'conv_1',
      userId: 'user_alice',
      title: 'Order tracking for ORD-1002',
      lastAgentType: 'ORDER',
      agentsUsed: ['ROUTER', 'ORDER'],
      totalTokensUsed: 320,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        role: 'USER',
        content: 'Hi, I want to know where my order is. Order number ORD-1002.',
        tokenCount: 20,
      },
      {
        conversationId: conv1.id,
        role: 'ASSISTANT',
        content: 'Hello Alice! Let me check the status of your order ORD-1002 right away.\n\nYour order containing "Clean Code" and "The Pragmatic Programmer" is currently **out for delivery**! 🚚\n\n**Tracking Details:**\n- Carrier: UPS\n- Tracking #: TRK-UPS-00200456\n- Status: Out for Delivery\n- Expected: Tomorrow\n- Last Location: Bangalore City Hub\n\nYou should receive your books very soon. Is there anything else I can help you with?',
        agentType: 'ORDER',
        tokenCount: 120,
        toolCalls: [{ tool: 'fetch_order_details', args: { orderId: 'order_2' } }],
        toolResults: [{ tool: 'fetch_order_details', result: { orderNumber: 'ORD-1002', status: 'PROCESSING', deliveryStatus: 'OUT_FOR_DELIVERY' } }],
      },
      {
        conversationId: conv1.id,
        role: 'USER',
        content: 'Great! What time will it arrive?',
        tokenCount: 12,
      },
      {
        conversationId: conv1.id,
        role: 'ASSISTANT',
        content: 'Unfortunately, I cannot provide an exact delivery time window. UPS typically delivers between 9 AM - 8 PM. You can get real-time updates by:\n\n1. Tracking directly on **UPS website** with tracking number `TRK-UPS-00200456`\n2. Downloading the **UPS app** for live notifications\n\nWould you like me to help with anything else?',
        agentType: 'ORDER',
        tokenCount: 90,
      },
    ],
  });

  // Bob - conversation about his refund
  const conv2 = await prisma.conversation.create({
    data: {
      id: 'conv_2',
      userId: 'user_bob',
      title: 'Refund status for cancelled order',
      lastAgentType: 'BILLING',
      agentsUsed: ['ROUTER', 'BILLING'],
      totalTokensUsed: 450,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv2.id,
        role: 'USER',
        content: 'I cancelled my order ORD-1003. When will I get my refund?',
        tokenCount: 22,
      },
      {
        conversationId: conv2.id,
        role: 'ASSISTANT',
        content: 'Hi Bob! I can see your cancellation for order ORD-1003 (Dyson Air Purifier Cool worth ₹8,999).\n\n**Refund Status:** REF-2024-002\n- Status: **Processing** ⏳\n- Amount: ₹8,999.00\n- Initiated: Yesterday\n\nSince you paid via Net Banking, your refund will be credited within **3-5 business days**. You will receive a confirmation email once it is processed.\n\nIs there anything else I can help you with?',
        agentType: 'BILLING',
        tokenCount: 130,
        toolCalls: [
          { tool: 'get_invoice_details', args: { invoiceId: 'inv_3' } },
          { tool: 'check_refund_status', args: { orderId: 'order_3' } },
        ],
      },
      {
        conversationId: conv2.id,
        role: 'USER',
        content: 'Why is it taking so long?',
        tokenCount: 10,
      },
      {
        conversationId: conv2.id,
        role: 'ASSISTANT',
        content: 'I completely understand your frustration, Bob. The processing time depends on your bank\'s settlement cycle. Net Banking refunds typically take:\n\n- **Day 1-2:** We initiate the refund on our end ✅\n- **Day 3-5:** Your bank processes and credits it 🏦\n\nYour refund was initiated yesterday, so you should see it in your account within **2-3 more business days**. If it doesn\'t appear by then, please contact us with reference number **REF-2024-002** and we\'ll escalate it immediately.',
        agentType: 'BILLING',
        tokenCount: 130,
      },
    ],
  });

  // Carol - general support conversation
  const conv3 = await prisma.conversation.create({
    data: {
      id: 'conv_3',
      userId: 'user_carol',
      title: 'Return policy question',
      lastAgentType: 'SUPPORT',
      agentsUsed: ['ROUTER', 'SUPPORT'],
      totalTokensUsed: 280,
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv3.id,
        role: 'USER',
        content: 'What is your return policy for electronics?',
        tokenCount: 12,
      },
      {
        conversationId: conv3.id,
        role: 'ASSISTANT',
        content: 'Great question, Carol! Here\'s our electronics return policy:\n\n**Electronics Return Policy:**\n- **Return Window:** 7 days from delivery\n- **Condition:** Unused, original packaging, all accessories included\n- **Process:** Initiate from Orders section in your account\n- **Refund:** 5-7 business days after pickup\n\n**What\'s eligible:**\n✅ Manufacturing defects\n✅ Wrong item delivered\n✅ Significantly not as described\n\n**What\'s NOT eligible:**\n❌ Physical damage after delivery\n❌ Items without original packaging\n❌ Software/digital content\n\nDo you have a specific electronics order you\'d like to return?',
        agentType: 'SUPPORT',
        tokenCount: 150,
        toolCalls: [{ tool: 'search_faq', args: { query: 'electronics return policy' } }],
      },
    ],
  });

  console.log('✅ Created 3 conversations with messages');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log('   👤 Users: 3 (alice, bob, carol)');
  console.log('   📦 Orders: 6');
  console.log('   🚚 Deliveries: 5');
  console.log('   💰 Invoices: 6');
  console.log('   💸 Refunds: 3');
  console.log('   ❓ FAQs: 11');
  console.log('   💬 Conversations: 3 with messages');
  console.log('\n🔑 Test User IDs:');
  console.log('   user_alice | user_bob | user_carol');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });