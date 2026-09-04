import Stripe from 'stripe';
import prisma from '../../config/prisma';
import { AppError } from '../../utils/AppError';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000';

export const initiatePayment = async (payerId: string, requestId: string, amount: number, currency: string) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId, deletedAt: null },
    include: { requester: { select: { id: true, name: true, email: true } } },
  });
  if (!request) throw new AppError('Blood request not found', 404);
  if (request.requesterId !== payerId) throw new AppError('You can only pay for your own requests', 403);

  const existingPending = await prisma.payment.findFirst({
    where: { requestId, payerId, status: 'PENDING' },
  });
  if (existingPending) throw new AppError('A pending payment already exists for this request', 409);

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
            description: `Patient: ${request.patientName} | Blood Type: ${request.bloodType} | Hospital: ${request.hospital}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT_URL}/payment/cancel`,
    metadata: { requestId, payerId },
  });

  const payment = await prisma.payment.create({
    data: {
      requestId,
      payerId,
      stripeSessionId: session.id,
      amount,
      currency,
      status: 'PENDING',
    },
  });

  return { payment, checkoutUrl: session.url };
};

export const getMyPayments = async (payerId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const where = { payerId };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        request: { select: { id: true, patientName: true, bloodType: true, hospital: true } },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return { payments, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
};
