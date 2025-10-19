declare const abi: [
  {
    "type": "function",
    "name": "aldea__craft",
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
        "name": "recipeId",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "aldea__extract",
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
  }
];

export default abi;
