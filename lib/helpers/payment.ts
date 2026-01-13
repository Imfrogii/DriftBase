import { differenceInHours } from "date-fns";

export function calculatePlatformFeeAmount(
  originalAmountInCents: number
): number {
  // const stripePercentageFee = 0.02; // 2%
  // const stripeFixedFeeInCents = 100; // 1.00 PLN

  // const stripeFee =
  //   Math.round(originalAmountInCents * stripePercentageFee) +
  //   stripeFixedFeeInCents;

  const platformFeeInCents = Math.round(originalAmountInCents * 0.05) + 200; // 5% + 2.00 PLN

  return platformFeeInCents;
}

export function calculateRefundAmount(
  eventStartDate: Date,
  originalAmountInCents: number
): number {
  const hoursUntilEvent = differenceInHours(eventStartDate, new Date());

  let refundPercentage = 0;

  if (hoursUntilEvent > 72) {
    refundPercentage = 100;
  } else if (hoursUntilEvent > 24) {
    refundPercentage = 50;
  } else {
    refundPercentage = 0;
  }

  return Math.round(originalAmountInCents * (refundPercentage / 100));
}
