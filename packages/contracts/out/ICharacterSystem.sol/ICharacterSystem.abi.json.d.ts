declare const abi: [
  {
    "type": "function",
    "name": "aldea__createCharacter",
    "inputs": [
      {
        "name": "class",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "nftId",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "nonce",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "deadline",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "signature",
        "type": "bytes",
        "internalType": "bytes"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "aldea__getCharacter",
    "inputs": [
      {
        "name": "characterId",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
      {
        "name": "player",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "class",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "tribe",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "x",
        "type": "int32",
        "internalType": "int32"
      },
      {
        "name": "y",
        "type": "int32",
        "internalType": "int32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "aldea__getUserNonce",
    "inputs": [
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "aldea__setAldeaToken",
    "inputs": [
      {
        "name": "_aldeaToken",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "aldea__setNFTVerifierOracle",
    "inputs": [
      {
        "name": "_nftVerifierOracle",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "aldea__withdrawFees",
    "inputs": [
      {
        "name": "to",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "error",
    "name": "InsufficientPayment",
    "inputs": [
      {
        "name": "required",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "provided",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "InvalidNFTProof",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidNonce",
    "inputs": [
      {
        "name": "expected",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "provided",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "error",
    "name": "SignatureExpired",
    "inputs": [
      {
        "name": "deadline",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  }
];

export default abi;
