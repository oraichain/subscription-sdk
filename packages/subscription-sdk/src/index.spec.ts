import * as subscriptionArtifacts from '@oraichain/subscription-contracts-build';
import { CosmwasmSubscriptionClient } from '@oraichain/subscription-contracts-sdk';
import { SimulateCosmWasmClient } from '@oraichain/cw-simulate';
import { coin, coins } from '@cosmjs/amino';

const client = new SimulateCosmWasmClient({
  bech32Prefix: 'orai',
  chainId: 'Oraichain',
  metering: true
});
const senderAddress = 'orai12zyu8w93h0q2lcnt50g3fn0w3yqnhy4fvawaqz';

describe('simple_case', () => {
  let subscriptionContract: CosmwasmSubscriptionClient;

  beforeEach(async () => {
    const { contractAddress } = await subscriptionArtifacts.deployContract(client, senderAddress, {}, 'cosmwasm-subscription');
    client.app.bank.setBalance(senderAddress, coins('100000000', 'orai'));
    subscriptionContract = new CosmwasmSubscriptionClient(client, senderAddress, contractAddress);
  });

  it('works', async () => {
    let subscriptionOptions = await subscriptionContract.subscriptionOptions();
    console.log(subscriptionOptions);
  });

  it('add_default_subscription_option', async () => {
    // 1 day, 10_000_000 orai
    let result = await subscriptionContract.admin({
      add_subscription_option: {
        payment_option: {
          subscription_duration: {
            duration_unit: 'day',
            amount_units: 1
          },
          price: coin('10000000', 'orai')
        }
      }
    });
    expect(result.events.length).toBeGreaterThan(0);
    console.log(result);
  });
});
