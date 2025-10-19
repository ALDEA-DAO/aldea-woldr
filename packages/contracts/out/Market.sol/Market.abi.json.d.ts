declare const abi: [
  {
    "type": "function",
    "name": "cancelOffer",
    "inputs": [
      {
        "name": "characterId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "marketId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "offerId",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getActiveOffers",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "maxOffers",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct Market.TradeOffer[]",
        "components": [
          {
            "name": "sellerId",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "offerItemId",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "offerAmount",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "requestItemId",
            "type": "uint32",
            "internalType": "uint32"
          },
          {
            "name": "requestAmount",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          }
        ]
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "nextOfferId",
    "inputs": [
      {
        "name": "",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "onCharacterArrive",
    "inputs": [
      {
        "name": "characterId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "buildingInstanceId",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "onCharacterLeave",
    "inputs": [
      {
        "name": "characterId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "buildingInstanceId",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "onConstruct",
    "inputs": [
      {
        "name": "",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "buildingInstanceId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "onUpgrade",
    "inputs": [
      {
        "name": "buildingInstanceId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "newLevel",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "tradeOffers",
    "inputs": [
      {
        "name": "",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "sellerId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "offerItemId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "offerAmount",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "requestItemId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "requestAmount",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "active",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "use",
    "inputs": [
      {
        "name": "characterId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "buildingInstanceId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "payload",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Store_SetRecord",
    "inputs": [
      {
        "name": "tableId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "ResourceId"
      },
      {
        "name": "keyTuple",
        "type": "bytes32[]",
        "indexed": false,
        "internalType": "bytes32[]"
      },
      {
        "name": "staticData",
        "type": "bytes",
        "indexed": false,
        "internalType": "bytes"
      },
      {
        "name": "encodedLengths",
        "type": "bytes32",
        "indexed": false,
        "internalType": "EncodedLengths"
      },
      {
        "name": "dynamicData",
        "type": "bytes",
        "indexed": false,
        "internalType": "bytes"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Store_SpliceStaticData",
    "inputs": [
      {
        "name": "tableId",
        "type": "bytes32",
        "indexed": true,
        "internalType": "ResourceId"
      },
      {
        "name": "keyTuple",
        "type": "bytes32[]",
        "indexed": false,
        "internalType": "bytes32[]"
      },
      {
        "name": "start",
        "type": "uint48",
        "indexed": false,
        "internalType": "uint48"
      },
      {
        "name": "data",
        "type": "bytes",
        "indexed": false,
        "internalType": "bytes"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TradeCompleted",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint32",
        "indexed": true,
        "internalType": "uint32"
      },
      {
        "name": "offerId",
        "type": "uint32",
        "indexed": true,
        "internalType": "uint32"
      },
      {
        "name": "buyerId",
        "type": "uint32",
        "indexed": true,
        "internalType": "uint32"
      },
      {
        "name": "sellerId",
        "type": "uint32",
        "indexed": false,
        "internalType": "uint32"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "TradeOfferCreated",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint32",
        "indexed": true,
        "internalType": "uint32"
      },
      {
        "name": "offerId",
        "type": "uint32",
        "indexed": true,
        "internalType": "uint32"
      },
      {
        "name": "sellerId",
        "type": "uint32",
        "indexed": true,
        "internalType": "uint32"
      },
      {
        "name": "offerItemId",
        "type": "uint32",
        "indexed": false,
        "internalType": "uint32"
      },
      {
        "name": "offerAmount",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      },
      {
        "name": "requestItemId",
        "type": "uint32",
        "indexed": false,
        "internalType": "uint32"
      },
      {
        "name": "requestAmount",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "Slice_OutOfBounds",
    "inputs": [
      {
        "name": "data",
        "type": "bytes",
        "internalType": "bytes"
      },
      {
        "name": "start",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "end",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  }
];

export default abi;
