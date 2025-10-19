declare const abi: [
  {
    "type": "function",
    "name": "aldea__getPosition",
    "inputs": [
      {
        "name": "characterId",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [
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
    "name": "aldea__isAtLocation",
    "inputs": [
      {
        "name": "characterId",
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
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "aldea__moveCharacter",
    "inputs": [
      {
        "name": "characterId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "newX",
        "type": "int32",
        "internalType": "int32"
      },
      {
        "name": "newY",
        "type": "int32",
        "internalType": "int32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "aldea__teleportCharacter",
    "inputs": [
      {
        "name": "characterId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "newX",
        "type": "int32",
        "internalType": "int32"
      },
      {
        "name": "newY",
        "type": "int32",
        "internalType": "int32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

export default abi;
