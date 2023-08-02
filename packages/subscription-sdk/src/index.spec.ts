import * as subscriptionArtifacts from '@oraichain/subscription-contracts-build';
import { CosmwasmSubscriptionClient } from '@oraichain/subscription-contracts-sdk';
import { SimulateCosmWasmClient } from '@oraichain/cw-simulate';
import { Ok } from 'ts-results';
import { coin, coins } from '@cosmjs/amino';

const client = new SimulateCosmWasmClient({
  bech32Prefix: 'orai',
  chainId: 'Oraichain',
  metering: true
});
const senderAddress = 'orai12zyu8w93h0q2lcnt50g3fn0w3yqnhy4fvawaqz';
const bobAddress = 'orai18cgmaec32hgmd8ls8w44hjn25qzjwhannd9kpj';

describe('simple_case', () => {
  let subscriptionContract: CosmwasmSubscriptionClient;

  beforeEach(async () => {
    const { contractAddress } = await subscriptionArtifacts.deployContract(client, senderAddress, {}, 'cosmwasm-subscription');
    client.app.bank.setBalance(senderAddress, [coin('100000000', 'orai'), coin('100000000', 'usdt')]);
    subscriptionContract = new CosmwasmSubscriptionClient(client, senderAddress, contractAddress);
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
    console.log(result);
  });

  it('add_subcription_option_rejected_unauthorized', async () => {
    subscriptionContract.sender = 'somebody';
    await expect(
      subscriptionContract.admin({
        add_subscription_option: {
          payment_option: {
            subscription_duration: {
              duration_unit: 'day',
              amount_units: 1
            },
            price: coin('10000000', 'orai')
          }
        }
      })
    ).rejects.toThrow(new Error('Unauthorized'));
  });

  it('subscribe_successful', async () => {
    await subscriptionContract.subscribe(
      {
        idSubscription: 0
      },
      'auto',
      null,
      coins('10000000', 'orai')
    );

    let msg = await subscriptionContract.subscriptionStatus({ addr: senderAddress });

    expect(msg.is_valid).toBeTruthy();
  });

  it('subscribe_rejected_invalid_currency', async () => {
    await expect(
      subscriptionContract.subscribe(
        {
          idSubscription: 0
        },
        'auto',
        null,
        coins('10000000', 'usdt')
      )
    ).rejects.toThrow(new Error('Invalid Funds Denomination'));
  });

  it('subscribe_rejected_invalid_funds_amount', async () => {
    await expect(
      subscriptionContract.subscribe(
        {
          idSubscription: 0
        },
        'auto',
        null,
        coins('9000000', 'orai')
      )
    ).rejects.toThrow(new Error('Funds amount invalid'));

    await expect(
      subscriptionContract.subscribe(
        {
          idSubscription: 0
        },
        'auto',
        null,
        coins('11000000', 'orai')
      )
    ).rejects.toThrow(new Error('Funds amount invalid'));
  });

  it('subscribe_rejected_payable', async () => {
    await expect(
      subscriptionContract.subscribe({
        idSubscription: 0
      })
    ).rejects.toThrow(new Error('Payable Contract'));
  });

  it('subscribe_expire', async () => {
    await subscriptionContract.subscribe(
      {
        idSubscription: 0
      },
      'auto',
      null,
      coins('10000000', 'orai')
    );

    // pass 100000 seconds > 1 day to make subscription expired, 1s = 1e9 nano second
    client.app.store.tx((setter) => Ok(setter('time')(client.app.time + 100_000 * 1e9)));

    let msg = await subscriptionContract.subscriptionStatus({ addr: senderAddress });

    expect(msg.is_valid).toBeFalsy();
  });

  it('subscribe_error_wrong_id', async () => {
    await expect(
      subscriptionContract.subscribe({
        idSubscription: 1
      })
    ).rejects.toThrow(new Error('No subscription available with given id not exist'));
  });

  it('subscribe_lengthened', async () => {
    await subscriptionContract.subscribe(
      {
        idSubscription: 0
      },
      'auto',
      null,
      coins('10000000', 'orai')
    );

    // pass 100000 seconds > 1 day to make subscription expired, 1s = 1e9 nano second
    client.app.store.tx((setter) => Ok(setter('time')(client.app.time + 100_000 * 1e9)));

    let msg = await subscriptionContract.subscriptionStatus({ addr: senderAddress });

    expect(msg.is_valid).toBeFalsy();

    // subscribe more
    await subscriptionContract.subscribe(
      {
        idSubscription: 0
      },
      'auto',
      null,
      coins('10000000', 'orai')
    );

    msg = await subscriptionContract.subscriptionStatus({ addr: senderAddress });

    expect(msg.is_valid).toBeTruthy();
  });

  it('withdraw_successful', async () => {
    await subscriptionContract.subscribe(
      {
        idSubscription: 0
      },
      'auto',
      null,
      coins('10000000', 'orai')
    );

    // subscription owner can withdraw
    let result = await subscriptionContract.admin({
      withdraw: {
        amount: '10000000',
        denom: 'orai',
        beneficiary: bobAddress
      }
    });
    const bobBalance = await client.getBalance(bobAddress, 'orai');
    expect(bobBalance.amount).toEqual('10000000');
  });

  it('query_subscription_options_successful', async () => {
    await subscriptionContract.admin({
      add_subscription_option: {
        payment_option: {
          subscription_duration: {
            duration_unit: 'hour',
            amount_units: 10
          },
          price: coin('10000000', 'orai')
        }
      }
    });

    let result = await subscriptionContract.subscriptionOptions();
    expect(result.subscription_options.length).toEqual(2);
  });

  it('remove_subscription_successful', async () => {
    await subscriptionContract.admin({
      remove_subscription_option: {
        id_to_remove: 0
      }
    });
    let result = await subscriptionContract.subscriptionOptions();
    expect(result.subscription_options.length).toEqual(0);
  });

  it('subscribe_two_options_successful', async () => {
    await subscriptionContract.admin({
      add_subscription_option: {
        payment_option: {
          subscription_duration: {
            duration_unit: 'day',
            amount_units: 101
          },
          price: coin('10000000', 'orai')
        }
      }
    });

    await subscriptionContract.subscribe(
      {
        idSubscription: 1
      },
      'auto',
      null,
      coins('10000000', 'orai')
    );

    let result = await subscriptionContract.subscriptionStatus({ addr: senderAddress });
    expect(result.is_valid).toBeTruthy();
  });

  it('subscribe_option_2_remove_first_successful', async () => {
    await subscriptionContract.admin({
      add_subscription_option: {
        payment_option: {
          subscription_duration: {
            duration_unit: 'day',
            amount_units: 101
          },
          price: coin('10000000', 'orai')
        }
      }
    });

    // remove first option
    await subscriptionContract.admin({
      remove_subscription_option: {
        id_to_remove: 0
      }
    });

    // subscribe to second one
    await subscriptionContract.subscribe(
      {
        idSubscription: 1
      },
      'auto',
      null,
      coins('10000000', 'orai')
    );
    let result = await subscriptionContract.subscriptionStatus({ addr: senderAddress });
    expect(result.is_valid).toBeTruthy();
  });
});
