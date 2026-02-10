import { prisma } from '../../db/prisma';
import type { ToolResult } from '../../types';

export async function getConversationHistory(params: {
  userId?: string;
  limit?: number;
}): Promise<ToolResult<any[]>> {
  try {
    const { userId, limit = 10 } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    console.log('[SupportTool] getConversationHistory:', { userId, limit });

    const conversations = await prisma.conversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    console.log('[SupportTool] Found conversations:', conversations.length);
    return { success: true, data: conversations };
  } catch (error) {
    console.error('[SupportTool] getConversationHistory error:', error);
    return { success: false, error: 'Failed to fetch conversation history' };
  }
}

export async function getUserProfile(params: {
  userId?: string;
}): Promise<ToolResult<any>> {
  try {
    const { userId } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    console.log('[SupportTool] getUserProfile:', userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            invoices: true,
          },
        },
      },
    });

    console.log('[SupportTool] User found:', !!user);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, data: user };
  } catch (error) {
    console.error('[SupportTool] getUserProfile error:', error);
    return { success: false, error: 'Failed to fetch user profile' };
  }
}

export async function getRecentActivity(params: {
  userId?: string;
}): Promise<ToolResult<any>> {
  try {
    const { userId } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    console.log('[SupportTool] getRecentActivity:', userId);

    const [recentOrders, recentInvoices, recentRefunds] = await Promise.all([
      prisma.orders.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          orderNumber: true,
          orderStatus: true,
          createdAt: true,
          price: true,
        },
      }),
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          total: true,
          createdAt: true,
        },
      }),
      prisma.refund.findMany({
        where: { userId },
        orderBy: { requestedAt: 'desc' },
        take: 3,
        select: {
          id: true,
          refundNumber: true,
          status: true,
          amount: true,
          requestedAt: true,
        },
      }),
    ]);

    console.log('[SupportTool] Activity:', { orders: recentOrders.length, invoices: recentInvoices.length, refunds: recentRefunds.length });

    return {
      success: true,
      data: {
        recentOrders,
        recentInvoices,
        recentRefunds,
      },
    };
  } catch (error) {
    console.error('[SupportTool] getRecentActivity error:', error);
    return { success: false, error: 'Failed to fetch recent activity' };
  }
}

export async function getProductInfo(params: {
  productName?: string;
  sku?: string;
}): Promise<ToolResult<any>> {
  const { productName, sku } = params;
  console.log('[SupportTool] getProductInfo:', { productName, sku });

  const mockProducts: Record<string, any> = {
    default: {
      name: productName || 'Product',
      sku: sku || 'N/A',
      description: 'Product information is temporarily unavailable.',
      returnPolicy: '30-day return policy for unused items in original packaging',
      warranty: 'Standard 1-year warranty',
    },
  };

  return {
    success: true,
    data: mockProducts.default,
  };
}

export function getCompanyInfo(): ToolResult<any> {
  console.log('[SupportTool] getCompanyInfo called');
  return {
    success: true,
    data: {
      companyName: 'Our Company',
      businessHours: {
        monday: '9:00 AM - 6:00 PM',
        tuesday: '9:00 AM - 6:00 PM',
        wednesday: '9:00 AM - 6:00 PM',
        thursday: '9:00 AM - 6:00 PM',
        friday: '9:00 AM - 6:00 PM',
        saturday: '10:00 AM - 4:00 PM',
        sunday: 'Closed',
      },
      contact: {
        email: 'support@example.com',
        phone: '1-800-SUPPORT',
        website: 'https://www.example.com',
      },
      shippingPolicy: {
        standard: '5-7 business days',
        express: '2-3 business days',
        freeThreshold: '$50',
      },
      returnPolicy: '30-day return policy for unused items in original packaging',
      paymentMethods: ['Credit Cards', 'PayPal', 'Apple Pay', 'Google Pay'],
    },
  };
}

export const supportTools = {
  getConversationHistory,
  getUserProfile,
  getRecentActivity,
  getProductInfo,
  getCompanyInfo,
};
