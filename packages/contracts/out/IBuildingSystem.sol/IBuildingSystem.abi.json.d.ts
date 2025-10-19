declare const abi: [
  {
    "type": "function",
    "name": "aldea__constructBuilding",
    "inputs": [
      {
        "name": "characterId",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "buildingTypeId",
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
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "aldea__destroyBuilding",
    "inputs": [
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
    "name": "aldea__getBuildingAtLocation",
    "inputs": [
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
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "aldea__isLocationOccupied",
    "inputs": [
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
    "name": "aldea__upgradeBuilding",
    "inputs": [
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
