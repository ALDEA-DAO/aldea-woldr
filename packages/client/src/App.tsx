import { useComponentValue } from '@latticexyz/react';
import { singletonEntity } from '@latticexyz/store-sync/recs';
import { useState } from 'react';
import { useLaceWallet } from './context/WalletContext';
import { useMUD } from './MUDContext';

export const App = () => {
  const {
    components: { World },
    systemCalls: { createCharacter },
  } = useMUD();

  const world = useComponentValue(World, singletonEntity);
  const { connected, connectLaceWallet, sendTransaction, networkId, checkIfWalletHoldsNFT } = useLaceWallet();
  const [receiver, setReceiver] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const [nftPolicyId, setNftPolicyId] = useState('');

  return (
    <>
      <div style={{ padding: '20px' }}>
        <h1>Cardano Lace Wallet</h1>

        {!connected ? (
          <button onClick={connectLaceWallet}>Connect Lace Wallet</button>
        ) : (
          <div>
            <p>✅ Wallet Connected: {networkId}</p>
            <input
              placeholder="input nftPolicyId"
              value={nftPolicyId}
              onChange={(e) => setNftPolicyId(e.currentTarget.value)}
            />

            <button
              onClick={async () => {
                const hasOwnership = await checkIfWalletHoldsNFT(nftPolicyId);

                console.log('hasOwernshipOfNFT: ', hasOwnership);
                if (hasOwnership) alert("you've owned nft");
                else alert("you don't own nft");
              }}
            >
              Verify NFT Ownership
            </button>
          </div>
        )}

        <div>
          <input
            type="text"
            placeholder="Receiver Address"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            style={{ margin: '10px', width: '300px' }}
          />
          <input
            type="number"
            placeholder="Amount (ADA)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ margin: '10px' }}
          />
          <button onClick={() => sendTransaction(receiver, parseFloat(amount))}>Send ADA</button>
        </div>
      </div>

      <div>
        <h5>World Data</h5>
        <li>
          Archers: <span>{world?.characterPopulation[0] ?? '??'}</span>
        </li>
        <li>
          Artisan: <span>{world?.characterPopulation[1] ?? '??'}</span>
        </li>
        <li>
          Alchemist: <span>{world?.characterPopulation[2] ?? '??'}</span>
        </li>
        <li>
          Blacksmith: <span>{world?.characterPopulation[3] ?? '??'}</span>
        </li>
        <li>
          Chef: <span>{world?.characterPopulation[4] ?? '??'}</span>
        </li>
        <li>
          Magician: <span>{world?.characterPopulation[5] ?? '??'}</span>
        </li>
        <li>
          Merchant: <span>{world?.characterPopulation[6] ?? '??'}</span>
        </li>
        <li>
          Priest: <span>{world?.characterPopulation[7] ?? '??'}</span>
        </li>
        <li>
          Tailor: <span>{world?.characterPopulation[8] ?? '??'}</span>
        </li>
        <li>
          Rebel: <span>{world?.characterPopulation[9] ?? '??'}</span>
        </li>
        <li>
          Warrior: <span>{world?.characterPopulation[10] ?? '??'}</span>
        </li>
        <li>
          Total Population: <span>{world?.totalPopulation ?? '??'}</span>
        </li>
      </div>

      <div>
        <h5>Tribe Data</h5>
        <li>
          Amazonians Population: <span>{world?.tribePopulation[0] ?? '??'}</span>
        </li>
        <li>
          Himalayans Population: <span>{world?.tribePopulation[1] ?? '??'}</span>
        </li>
        <li>
          Poseidons Population: <span>{world?.tribePopulation[2] ?? '??'}</span>
        </li>
        <li>
          Raes Population: <span>{world?.tribePopulation[3] ?? '??'}</span>
        </li>
        <li>
          Tropicals Population: <span>{world?.tribePopulation[4] ?? '??'}</span>
        </li>
      </div>

      <div>
        <h5>Functions</h5>
        <p>Choose a class: </p>
        <select name="types" id="types" multiple>
          <option value="random">Random</option>
          <option value="archer">Archer</option>
          <option value="artisan">Artisan</option>
          <option value="alchemist">Alchemist</option>
          <option value="blacksmith">Blacksmith</option>
          <option value="chef">Chef</option>
          <option value="magician">Magician</option>
          <option value="merchant">Merchant</option>
          <option value="priest">Priest</option>
          <option value="thief">Tailor</option>
          <option value="thief">Rebel</option>
          <option value="warrior">Warrior</option>
        </select>
        <br></br>
        <br></br>
        <button
          type="button"
          onClick={async (event) => {
            event.preventDefault();
            console.log('New total population value:', await createCharacter(0));
          }}
        >
          Create New Character
        </button>
      </div>
    </>
  );
};
