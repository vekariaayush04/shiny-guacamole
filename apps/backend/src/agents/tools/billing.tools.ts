import { prisma } from '../../db/prisma';
import type { ToolResult } from '../../types';

export async function getInvoiceDetails(params: {
  invoiceId?: string;
  invoiceNumber?: string;
  userId?: string;
}): Promise<ToolResult<any>> {
  try {
    const { invoiceId, invoiceNumber, userId } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    console.log('[BillingTool] getInvoiceDetails:', { invoiceId, invoiceNumber, userId });

    const invoice = await prisma.invoice.findFirst({
      where: {
        userId,
        OR: [
          ...(invoiceId ? [{ id: invoiceId }] : []),
          ...(invoiceNumber ? [{ invoiceNumber }] : []),
        ],
      },
      include: {
        order: {
          select: { id: true, orderNumber: true },
        },
      },
    });

    console.log('[BillingTool] Invoice found:', !!invoice);
    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    return { success: true, data: invoice };
  } catch (error) {
    console.error('[BillingTool] getInvoiceDetails error:', error);
    return { success: false, error: 'Failed to fetch invoice details' };
  }
}

export async function getUserInvoices(params: {
  userId?: string;
  status?: string;
  limit?: number;
}): Promise<ToolResult<any[]>> {
  try {
    const { userId, status, limit = 10 } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    console.log('[BillingTool] getUserInvoices:', { userId, status, limit });

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        order: {
          select: { id: true, orderNumber: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    console.log('[BillingTool] Found invoices:', invoices.length);
    return { success: true, data: invoices };
  } catch (error) {
    console.error('[BillingTool] getUserInvoices error:', error);
    return { success: false, error: 'Failed to fetch user invoices' };
  }
}

export async function getRefundStatus(params: {
  refundId?: string;
  refundNumber?: string;
  orderId?: string;
  userId?: string;
}): Promise<ToolResult<any>> {
  try {
    const { refundId, refundNumber, orderId, userId } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    console.log('[BillingTool] getRefundStatus:', { refundId, refundNumber, orderId, userId });

    const refund = await prisma.refund.findFirst({
      where: {
        userId,
        OR: [
          ...(refundId ? [{ id: refundId }] : []),
          ...(refundNumber ? [{ refundNumber }] : []),
          ...(orderId ? [{ orderId }] : []),
        ],
      },
      include: {
        order: {
          select: { id: true, orderNumber: true },
        },
      },
    });

    console.log('[BillingTool] Refund found:', !!refund);
    if (!refund) {
      return { success: false, error: 'Refund not found' };
    }

    return { success: true, data: refund };
  } catch (error) {
    console.error('[BillingTool] getRefundStatus error:', error);
    return { success: false, error: 'Failed to fetch refund status' };
  }
}

export async function getUserRefunds(params: {
  userId?: string;
  status?: string;
}): Promise<ToolResult<any[]>> {
  try {
    const { userId, status } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    console.log('[BillingTool] getUserRefunds:', { userId, status });

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const refunds = await prisma.refund.findMany({
      where,
      include: {
        order: {
          select: { id: true, orderNumber: true },
        },
      },
      orderBy: { requestedAt: 'desc' },
    });

    console.log('[BillingTool] Found refunds:', refunds.length);
    return { success: true, data: refunds };
  } catch (error) {
    console.error('[BillingTool] getUserRefunds error:', error);
    return { success: false, error: 'Failed to fetch user refunds' };
  }
}

export async function getBillingSummary(params: {
  userId?: string;
}): Promise<ToolResult<any>> {
  try {
    const { userId } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    console.log('[BillingTool] getBillingSummary:', userId);

    const [totalInvoices, pendingInvoices, paidInvoices, totalRefunds, completedRefunds] =
      await Promise.all([
        prisma.invoice.count({ where: { userId } }),
        prisma.invoice.count({ where: { userId, status: 'PENDING' } }),
        prisma.invoice.count({ where: { userId, status: 'PAID' } }),
        prisma.refund.count({ where: { userId } }),
        prisma.refund.count({ where: { userId, status: 'COMPLETED' } }),
      ]);

    console.log('[BillingTool] Summary:', { totalInvoices, pendingInvoices, paidInvoices, totalRefunds, completedRefunds });

    return {
      success: true,
      data: {
        invoiceSummary: {
          total: totalInvoices,
          pending: pendingInvoices,
          paid: paidInvoices,
        },
        refundSummary: {
          total: totalRefunds,
          completed: completedRefunds,
        },
      },
    };
  } catch (error) {
    console.error('[BillingTool] getBillingSummary error:', error);
    return { success: false, error: 'Failed to fetch billing summary' };
  }
}

export const billingTools = {
  getInvoiceDetails,
  getUserInvoices,
  getRefundStatus,
  getUserRefunds,
  getBillingSummary,
};
