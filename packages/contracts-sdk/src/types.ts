export type AdminExecuteMsg = {
  add_subscription_option: {
    payment_option: PaymentOption;
  };
} | {
  remove_subscription_option: {
    id_to_remove: number;
  };
} | {
  withdraw: {
    amount: string;
    beneficiary: string;
    denom: string;
  };
};
export type Uint128 = string;
export type DurationUnit = "second" | "minute" | "hour" | "day" | "week" | "month" | "year";
export interface PaymentOption {
  price: Coin;
  subscription_duration: SubscriptionDuration;
}
export interface Coin {
  amount: Uint128;
  denom: string;
}
export interface SubscriptionDuration {
  amount_units: number;
  duration_unit: DurationUnit;
}
export interface SubscriptionOptionRecord {
  id: number;
  payment_option: PaymentOption;
}
export { CosmWasmClient, SigningCosmWasmClient, ExecuteResult } from "@cosmjs/cosmwasm-stargate";