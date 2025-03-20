/*
 * Create the system calls that the client can use to ask
 * for changes in the World state (using the System contracts).
 */

import { getComponentValue } from '@latticexyz/recs';
import { singletonEntity } from '@latticexyz/store-sync/recs';
import { erc20Abi, getContract, parseEther } from 'viem';
import { ClientComponents } from './createClientComponents';
import { SetupNetworkResult } from './setupNetwork';

export type SystemCalls = ReturnType<typeof createSystemCalls>;

export function createSystemCalls(
  /*
   * The parameter list informs TypeScript that:
   *
   * - The first parameter is expected to be a
   *   SetupNetworkResult, as defined in setupNetwork.ts
   *
   *   Out of this parameter, we only care about two fields:
   *   - worldContract (which comes from getContract, see
   *     https://github.com/latticexyz/mud/blob/main/templates/react/packages/client/src/mud/setupNetwork.ts#L63-L69).
   *
   *   - waitForTransaction (which comes from syncToRecs, see
   *     https://github.com/latticexyz/mud/blob/main/templates/react/packages/client/src/mud/setupNetwork.ts#L77-L83).
   *
   * - From the second parameter, which is a ClientComponent,
   *   we only care about Counter. This parameter comes to use
   *   through createClientComponents.ts, but it originates in
   *   syncToRecs
   *   (https://github.com/latticexyz/mud/blob/main/templates/react/packages/client/src/mud/setupNetwork.ts#L77-L83).
   */
  { worldContract, waitForTransaction, walletClient, publicClient }: SetupNetworkResult,
  { Character }: ClientComponents,
) {
  const createCharacter = async (type: number) => {
    /*
     * Because IncrementSystem
     * (https://mud.dev/templates/typescript/contracts#incrementsystemsol)
     * is in the root namespace, `.increment` can be called directly
     * on the World contract.
     */

    const wALDEAToken = getContract({
      address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      abi: erc20Abi,
      client: { wallet: walletClient, public: publicClient },
    });

    const approveTx = await wALDEAToken.write.approve(['0x57044f6b8FADaAEabE1d65e1DD43A697B910D92e', parseEther('50')]);
    await waitForTransaction(approveTx);

    const tx = await worldContract.write.aldea__createCharacter([type]);
    await waitForTransaction(tx);
    return getComponentValue(Character, singletonEntity);
  };

  return {
    createCharacter,
  };
}
