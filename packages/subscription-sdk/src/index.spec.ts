import * as subscriptionArtifacts from '@oraichain/subscription-contracts-build';
import { CosmwasmSubscriptionClient } from '@oraichain/subscription-contracts-sdk';
import { SimulateCosmWasmClient } from '@oraichain/cw-simulate';

const client = new SimulateCosmWasmClient({
  bech32Prefix: 'orai',
  chainId: 'Oraichain',
  metering: true
});
const senderAddress = 'orai12zyu8w93h0q2lcnt50g3fn0w3yqnhy4fvawaqz';

describe('simple case', () => {
  let subscriptionContract: CosmwasmSubscriptionClient;

  beforeEach(async () => {
    const { contractAddress } = await subscriptionArtifacts.deployContract(client, senderAddress, {}, 'cosmwasm-subscription');
    subscriptionContract = new CosmwasmSubscriptionClient(client, senderAddress, contractAddress);
  });

  it('works', async () => {
    let subscriptionOptions = await subscriptionContract.subscriptionOptions();
    console.log(subscriptionOptions);
  });
});
