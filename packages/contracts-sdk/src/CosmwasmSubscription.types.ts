import {AdminExecuteMsg, Uint128, DurationUnit, PaymentOption, Coin, SubscriptionDuration, SubscriptionOptionRecord} from "./types";
export interface InstantiateMsg {}
export type ExecuteMsg = {
  subscribe: {
    id_subscription: number;
  };
} | {
  admin: AdminExecuteMsg;
};
export type QueryMsg = {
  subscription_options: {};
} | {
  subscription_status: {
    addr: string;
  };
};
export type MigrateMsg = string;
export interface SubscriptionOptionsResponse {
  subscription_options: SubscriptionOptionRecord[];
}
export interface SubscriptionStatusResponse {
  expiration_timestamp: number;
  is_valid: boolean;
}