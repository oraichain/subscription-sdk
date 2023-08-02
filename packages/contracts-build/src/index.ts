import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { CosmwasmSubscriptionTypes } from '@oraichain/subscription-contracts-sdk';
import { readFileSync } from 'fs';
import path from 'path';

export type ContractName = 'cosmwasm-subscription';
export type InstantiateMsg = CosmwasmSubscriptionTypes.InstantiateMsg;

const contractDir = path.join(path.dirname(module.filename), '..', 'data');

export const getContractDir = (name: ContractName = 'cosmwasm-subscription') => {
  return path.join(contractDir, name + '.wasm');
};

export const deployContract = async (client: SigningCosmWasmClient, senderAddress: string, msg?: InstantiateMsg, contractName?: ContractName, label?: string) => {
  // upload and instantiate the contract
  const wasmBytecode = readFileSync(getContractDir(contractName));
  const uploadRes = await client.upload(senderAddress, wasmBytecode, 'auto');
  const initRes = await client.instantiate(senderAddress, uploadRes.codeId, msg ?? {}, label ?? contractName, 'auto');
  return { ...uploadRes, ...initRes };
};
