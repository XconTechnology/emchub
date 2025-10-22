// TimeDollar to HKD conversion rate
// 1 TimeDollar = 60 HK$
export const TD_TO_HKD_RATE = 60;

// Helper function to convert TD to HKD
export function convertTDtoHKD(timeDollars: number): number {
  return timeDollars * TD_TO_HKD_RATE;
}

// Helper function to convert HKD to TD
export function convertHKDtoTD(hkd: number): number {
  return hkd / TD_TO_HKD_RATE;
}
