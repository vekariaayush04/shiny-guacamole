import { prisma } from '../../db/prisma';
import type { ToolResult } from '../../types';

export async function getOrderDetails(params: {
  orderId?: string;
  orderNumber?: string;
  userId?: string;
}): Promise<ToolResult<any>> {
  try {
    const { orderId, orderNumber, userId } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    console.log('[OrderTool] getOrderDetails:', { orderId, orderNumber, userId });

    const order = await prisma.orders.findFirst({
      where: {
        userId,
        OR: [
          ...(orderId ? [{ id: orderId }] : []),
          ...(orderNumber ? [{ orderNumber }] : []),
        ],
      },
      include: {
        items: true,
        delivery: true,
        address: true,
      },
    });

    console.log('[OrderTool] Order found:', !!order);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    return { success: true, data: order };
  } catch (error) {
    console.error('[OrderTool] getOrderDetails error:', error);
    return { success: false, error: 'Failed to fetch order details' };
  }
}

export async function getDeliveryStatus(params: {
  orderId: string;
  userId?: string;
}): Promise<ToolResult<any>> {
  try {
    const { orderId, userId } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    console.log('[OrderTool] getDeliveryStatus:', { orderId, userId });

    const order = await prisma.orders.findFirst({
      where: { id: orderId, userId },
      include: { delivery: true },
    });

    console.log('[OrderTool] Order found:', !!order);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (!order.delivery) {
      return { success: false, error: 'No delivery information available' };
    }

    return { success: true, data: order.delivery };
  } catch (error) {
    console.error('[OrderTool] getDeliveryStatus error:', error);
    return { success: false, error: 'Failed to fetch delivery status' };
  }
}

export async function getUserOrders(params: {
  userId?: string;
  limit?: number;
}): Promise<ToolResult<any[]>> {
  try {
    const { userId, limit = 10 } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    console.log('[OrderTool] getUserOrders:', { userId, limit });

    const orders = await prisma.orders.findMany({
      where: { userId },
      include: {
        items: true,
        delivery: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    console.log('[OrderTool] Found orders:', orders.length);
    return { success: true, data: orders };
  } catch (error) {
    console.error('[OrderTool] getUserOrders error:', error);
    return { success: false, error: 'Failed to fetch user orders' };
  }
}

export async function cancelOrder(params: {
  orderId: string;
  userId?: string;
  reason?: string;
}): Promise<ToolResult<any>> {
  try {
    const { orderId, userId, reason } = params;
    if (!userId) {
      return { success: false, error: 'userId is required' };
    }
    console.log('[OrderTool] cancelOrder:', { orderId, userId, reason });

    const order = await prisma.orders.findFirst({
      where: { id: orderId, userId },
      include: { delivery: true },
    });

    console.log('[OrderTool] Order found:', !!order);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.orderStatus === 'CANCELLED') {
      return { success: false, error: 'Order is already cancelled' };
    }

    if (order.orderStatus === 'REFUNDED') {
      return { success: false, error: 'Cannot cancel a refunded order' };
    }

    if (order.delivery?.status === 'DISPATCHED' || order.delivery?.status === 'OUT_FOR_DELIVERY') {
      return { success: false, error: 'Cannot cancel an order that has already been shipped' };
    }

    const updatedOrder = await prisma.orders.update({
      where: { id: orderId },
      data: {
        orderStatus: 'CANCELLED',
      },
    });

    console.log('[OrderTool] Order cancelled:', updatedOrder.id);
    return {
      success: true,
      data: {
        ...updatedOrder,
        cancellationNote: reason || 'Order cancelled by customer',
        refundTimeline: 'Refunds will be processed within 5-7 business days',
      },
    };
  } catch (error) {
    console.error('[OrderTool] cancelOrder error:', error);
    return { success: false, error: 'Failed to cancel order' };
  }
}

export async function getOrderByTracking(params: {
  trackingNumber: string;
}): Promise<ToolResult<any>> {
  try {
    const { trackingNumber } = params;
    console.log('[OrderTool] getOrderByTracking:', { trackingNumber });

    const delivery = await prisma.delivery.findUnique({
      where: { trackingNumber },
      include: {
        order: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    console.log('[OrderTool] Delivery found:', !!delivery);
    if (!delivery) {
      return { success: false, error: 'Tracking number not found' };
    }

    return { success: true, data: delivery };
  } catch (error) {
    console.error('[OrderTool] getOrderByTracking error:', error);
    return { success: false, error: 'Failed to find order by tracking number' };
  }
}

export const orderTools = {
  getOrderDetails,
  getDeliveryStatus,
  getUserOrders,
  cancelOrder,
  getOrderByTracking,
};
