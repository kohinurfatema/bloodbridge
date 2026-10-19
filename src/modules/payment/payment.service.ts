import Stripe from 'stripe';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';
import { logAudit } from '../../utils/auditLogger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
// CLIENT_URL may list several frontends, comma separated; the first is the default.
const CLIENT_URLS = (process.env.CLIENT_URL ?? 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const isLocalhost = (url: URL) => url.hostname === 'localhost' || url.hostname === '127.0.0.1';

// Send Stripe back to the frontend that started checkout, but only if it is a
// known frontend (or a local dev server) so this can never be an open redirect.
const resolveClientUrl = (returnUrl?: string) => {
  if (!returnUrl) return CLIENT_URLS[0];
  try {
    const url = new URL(returnUrl);
    const known = CLIENT_URLS.some((client) => new URL(client).origin === url.origin);
    return known || isLocalhost(url) ? url.origin : CLIENT_URLS[0];
  } catch {
    return CLIENT_URLS[0];
  }
};

export const initiatePayment = async (payerId: string, requestId: string, amount: number, currency: string, returnUrl?: string) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId, deletedAt: null },
    include: { requester: { select: { id: true, name: true, email: true } } },
  });
  if (!request) throw new AppError('Blood request not found', 404);
  if (request.requesterId !== payerId) throw new AppError('You can only pay for your own requests', 403);

  const existingPending = await prisma.payment.findFirst({
    where: { requestId, status: 'PENDING' },
  });
  if (existingPending) throw new AppError('A pending payment already exists for this request', 409);

  const clientUrl = resolveClientUrl(returnUrl);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `BloodBridge — Blood Request Service Fee`,
            description: `Blood Type: ${request.bloodType} | Hospital: ${request.hospital}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/payment/cancel`,
    metadata: { requestId, payerId },
  });

  const payment = await prisma.payment.create({
    data: {
      requestId,
      stripeSessionId: session.id,
      amount,
      currency,
      status: 'PENDING',
    },
  });

  await logAudit({ userId: payerId, action: 'PAYMENT_INITIATED', resource: 'Payment', resourceId: payment.id, details: { requestId, amount, currency } });
  return { payment, checkoutUrl: session.url };
};

export const verifyPayment = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const payment = await prisma.payment.findFirst({ where: { stripeSessionId: sessionId } });
  if (!payment) throw new AppError('Payment record not found', 404);

  if (payment.status === 'COMPLETED') {
    return { payment, alreadyVerified: true };
  }

  if (session.payment_status !== 'paid') {
    await prisma.payment.update({ where: { id: payment.id }, data: { status: 'FAILED' } });
    throw new AppError('Payment was not successful', 402);
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'COMPLETED' },
    include: {
      request: { select: { id: true, bloodType: true, hospital: true } },
    },
  });

  return { payment: updated, alreadyVerified: false };
};

export const getMyPayments = async (payerId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const where = { request: { requesterId: payerId } };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        request: { select: { id: true, bloodType: true, hospital: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return { payments, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};
