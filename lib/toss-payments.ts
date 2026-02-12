import { loadTossPayments } from '@tosspayments/payment-sdk';

export async function initializeTossPayments() {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
        throw new Error('NEXT_PUBLIC_TOSS_CLIENT_KEY is missing');
    }
    return await loadTossPayments(clientKey);
}
