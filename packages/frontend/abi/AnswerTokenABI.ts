// Auto-generated file - do not edit
export const AnswerTokenABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ECDSAInvalidSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "length",
        "type": "uint256"
      }
    ],
    "name": "ECDSAInvalidSignatureLength",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "ECDSAInvalidSignatureS",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      }
    ],
    "name": "ERC2612ExpiredSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "signer",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC2612InvalidSigner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "currentNonce",
        "type": "uint256"
      }
    ],
    "name": "InvalidAccountNonce",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidShortString",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "str",
        "type": "string"
      }
    ],
    "name": "StringTooLong",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "EIP712DomainChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "oldPool",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newPool",
        "type": "address"
      }
    ],
    "name": "RewardPoolUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "ADMIN_POOL",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DOMAIN_SEPARATOR",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "INITIAL_SUPPLY",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "REWARD_POOL",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "burn",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "eip712Domain",
    "outputs": [
      {
        "internalType": "bytes1",
        "name": "fields",
        "type": "bytes1"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "version",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "chainId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "verifyingContract",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      },
      {
        "internalType": "uint256[]",
        "name": "extensions",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getRewardPoolBalance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mintReward",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "nonces",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "deadline",
        "type": "uint256"
      },
      {
        "internalType": "uint8",
        "name": "v",
        "type": "uint8"
      },
      {
        "internalType": "bytes32",
        "name": "r",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "permit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rewardPool",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_rewardPool",
        "type": "address"
      }
    ],
    "name": "setRewardPool",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
export const AnswerTokenBytecode = "0x610160604052348015610010575f5ffd5b506040518060400160405280600c81526020016b20b739bbb2b9102a37b5b2b760a11b81525080604051806040016040528060018152602001603160f81b815250336040518060400160405280600c81526020016b20b739bbb2b9102a37b5b2b760a11b81525060405180604001604052806003815260200162414e5360e81b81525081600390816100a2919061047b565b5060046100af828261047b565b5050506001600160a01b0381166100e057604051631e4fbdf760e01b81525f60048201526024015b60405180910390fd5b6100e9816101c5565b506100f5826006610216565b61012052610104816007610216565b61014052815160208084019190912060e052815190820120610100524660a05261019060e05161010051604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201529081019290925260608201524660808201523060a08201525f9060c00160405160208183030381529060405280519060200120905090565b60805250503060c052506101ae3369d3c21bcecceda1000000610248565b600980546001600160a01b031916331790556105ac565b600580546001600160a01b038381166001600160a01b0319831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b5f6020835110156102315761022a83610280565b9050610242565b8161023c848261047b565b5060ff90505b92915050565b6001600160a01b0382166102715760405163ec442f0560e01b81525f60048201526024016100d7565b61027c5f83836102bd565b5050565b5f5f829050601f815111156102aa578260405163305a27a960e01b81526004016100d79190610535565b80516102b58261056a565b179392505050565b6001600160a01b0383166102e7578060025f8282546102dc919061058d565b909155506103579050565b6001600160a01b0383165f90815260208190526040902054818110156103395760405163391434e360e21b81526001600160a01b038516600482015260248101829052604481018390526064016100d7565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b03821661037357600280548290039055610391565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef836040516103d691815260200190565b60405180910390a3505050565b634e487b7160e01b5f52604160045260245ffd5b600181811c9082168061040b57607f821691505b60208210810361042957634e487b7160e01b5f52602260045260245ffd5b50919050565b601f82111561047657805f5260205f20601f840160051c810160208510156104545750805b601f840160051c820191505b81811015610473575f8155600101610460565b50505b505050565b81516001600160401b03811115610494576104946103e3565b6104a8816104a284546103f7565b8461042f565b6020601f8211600181146104da575f83156104c35750848201515b5f19600385901b1c1916600184901b178455610473565b5f84815260208120601f198516915b8281101561050957878501518255602094850194600190920191016104e9565b508482101561052657868401515f19600387901b60f8161c191681555b50505050600190811b01905550565b602081525f82518060208401528060208501604085015e5f604082850101526040601f19601f83011684010191505092915050565b80516020808301519190811015610429575f1960209190910360031b1b16919050565b8082018082111561024257634e487b7160e01b5f52601160045260245ffd5b60805160a05160c05160e05161010051610120516101405161134b6105fd5f395f610b7401525f610b4701525f610a3101525f610a0901525f61096401525f61098e01525f6109b8015261134b5ff3fe608060405234801561000f575f5ffd5b506004361061018f575f3560e01c806378238c37116100dd5780639a49090e11610088578063d854fb7511610063578063d854fb7514610346578063dd62ed3e14610365578063f2fde38b1461039d575f5ffd5b80639a49090e1461030d578063a9059cbb14610320578063d505accf14610333575f5ffd5b80638da5cb5b116100b85780638da5cb5b146102e357806395d89b41146102f457806399f91c28146102fc575f5ffd5b806378238c37146102a25780637ecebe00146102b557806384b0196e146102c8575f5ffd5b8063313ce5671161013d57806366666aa91161011857806366666aa91461024757806370a0823114610272578063715018a61461029a575f5ffd5b8063313ce5671461021b5780633644e5151461022a57806342966c6814610232575f5ffd5b806318160ddd1161016d57806318160ddd146101ef57806323b872dd146101f75780632ff2e9dc1461020a575f5ffd5b8063014c4e421461019357806306fdde03146101b7578063095ea7b3146101cc575b5f5ffd5b6101a4692a5a058fc295ed00000081565b6040519081526020015b60405180910390f35b6101bf6103b0565b6040516101ae91906110d9565b6101df6101da36600461110d565b610440565b60405190151581526020016101ae565b6002546101a4565b6101df610205366004611135565b610459565b6101a469d3c21bcecceda100000081565b604051601281526020016101ae565b6101a461047c565b61024561024036600461116f565b61048a565b005b60095461025a906001600160a01b031681565b6040516001600160a01b0390911681526020016101ae565b6101a4610280366004611186565b6001600160a01b03165f9081526020819052604090205490565b610245610497565b6102456102b0366004611186565b6104aa565b6101a46102c3366004611186565b61056b565b6102d0610588565b6040516101ae979695949392919061119f565b6005546001600160a01b031661025a565b6101bf6105ca565b6101a469a968163f0a57b400000081565b61024561031b36600461110d565b6105d9565b6101df61032e36600461110d565b6106f0565b610245610341366004611235565b6106fd565b6009546001600160a01b03165f908152602081905260409020546101a4565b6101a46103733660046112a2565b6001600160a01b039182165f90815260016020908152604080832093909416825291909152205490565b6102456103ab366004611186565b610833565b6060600380546103bf906112d3565b80601f01602080910402602001604051908101604052809291908181526020018280546103eb906112d3565b80156104365780601f1061040d57610100808354040283529160200191610436565b820191905f5260205f20905b81548152906001019060200180831161041957829003601f168201915b5050505050905090565b5f3361044d81858561086d565b60019150505b92915050565b5f3361046685828561087f565b6104718585856108fb565b506001949350505050565b5f610485610958565b905090565b6104943382610a81565b50565b61049f610ab5565b6104a85f610ae2565b565b6104b2610ab5565b6001600160a01b03811661050d5760405162461bcd60e51b815260206004820152601b60248201527f496e76616c69642072657761726420706f6f6c2061646472657373000000000060448201526064015b60405180910390fd5b600980546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff19831681179093556040519116919082907f172da71f1c616b61d83038d9d8679e9f8592d8405647a400b24bf1852cecaed7905f90a35050565b6001600160a01b0381165f90815260086020526040812054610453565b5f6060805f5f5f6060610599610b40565b6105a1610b6d565b604080515f80825260208201909252600f60f81b9b939a50919850469750309650945092509050565b6060600480546103bf906112d3565b6009546001600160a01b0316331461063d5760405162461bcd60e51b815260206004820152602160248201527f4f6e6c792072657761726420706f6f6c2063616e206d696e74207265776172646044820152607360f81b6064820152608401610504565b6001600160a01b0382166106935760405162461bcd60e51b815260206004820152601960248201527f496e76616c696420726563697069656e742061646472657373000000000000006044820152606401610504565b5f81116106e25760405162461bcd60e51b815260206004820152601d60248201527f416d6f756e74206d7573742062652067726561746572207468616e20300000006044820152606401610504565b6106ec8282610b9a565b5050565b5f3361044d8185856108fb565b834211156107215760405163313c898160e11b815260048101859052602401610504565b5f7f6e71edae12b1b97f4d1f60370fef10105fa2faae0126114a169c64845d6126c988888861076c8c6001600160a01b03165f90815260086020526040902080546001810190915590565b6040805160208101969096526001600160a01b0394851690860152929091166060840152608083015260a082015260c0810186905260e0016040516020818303038152906040528051906020012090505f6107c682610bce565b90505f6107d582878787610bfa565b9050896001600160a01b0316816001600160a01b03161461081c576040516325c0072360e11b81526001600160a01b0380831660048301528b166024820152604401610504565b6108278a8a8a61086d565b50505050505050505050565b61083b610ab5565b6001600160a01b03811661086457604051631e4fbdf760e01b81525f6004820152602401610504565b61049481610ae2565b61087a8383836001610c26565b505050565b6001600160a01b038381165f908152600160209081526040808320938616835292905220545f198110156108f557818110156108e757604051637dc7a0d960e11b81526001600160a01b03841660048201526024810182905260448101839052606401610504565b6108f584848484035f610c26565b50505050565b6001600160a01b03831661092457604051634b637e8f60e11b81525f6004820152602401610504565b6001600160a01b03821661094d5760405163ec442f0560e01b81525f6004820152602401610504565b61087a838383610cf8565b5f306001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000161480156109b057507f000000000000000000000000000000000000000000000000000000000000000046145b156109da57507f000000000000000000000000000000000000000000000000000000000000000090565b610485604080517f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f60208201527f0000000000000000000000000000000000000000000000000000000000000000918101919091527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a08201525f9060c00160405160208183030381529060405280519060200120905090565b6001600160a01b038216610aaa57604051634b637e8f60e11b81525f6004820152602401610504565b6106ec825f83610cf8565b6005546001600160a01b031633146104a85760405163118cdaa760e01b8152336004820152602401610504565b600580546001600160a01b0383811673ffffffffffffffffffffffffffffffffffffffff19831681179093556040519116919082907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0905f90a35050565b60606104857f00000000000000000000000000000000000000000000000000000000000000006006610e1e565b60606104857f00000000000000000000000000000000000000000000000000000000000000006007610e1e565b6001600160a01b038216610bc35760405163ec442f0560e01b81525f6004820152602401610504565b6106ec5f8383610cf8565b5f610453610bda610958565b8360405161190160f01b8152600281019290925260228201526042902090565b5f5f5f5f610c0a88888888610ec7565b925092509250610c1a8282610f8f565b50909695505050505050565b6001600160a01b038416610c4f5760405163e602df0560e01b81525f6004820152602401610504565b6001600160a01b038316610c7857604051634a1406b160e11b81525f6004820152602401610504565b6001600160a01b038085165f90815260016020908152604080832093871683529290522082905580156108f557826001600160a01b0316846001600160a01b03167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92584604051610cea91815260200190565b60405180910390a350505050565b6001600160a01b038316610d22578060025f828254610d17919061130b565b90915550610d929050565b6001600160a01b0383165f9081526020819052604090205481811015610d745760405163391434e360e21b81526001600160a01b03851660048201526024810182905260448101839052606401610504565b6001600160a01b0384165f9081526020819052604090209082900390555b6001600160a01b038216610dae57600280548290039055610dcc565b6001600160a01b0382165f9081526020819052604090208054820190555b816001600160a01b0316836001600160a01b03167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610e1191815260200190565b60405180910390a3505050565b606060ff8314610e3857610e3183611047565b9050610453565b818054610e44906112d3565b80601f0160208091040260200160405190810160405280929190818152602001828054610e70906112d3565b8015610ebb5780601f10610e9257610100808354040283529160200191610ebb565b820191905f5260205f20905b815481529060010190602001808311610e9e57829003601f168201915b50505050509050610453565b5f80807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0841115610f0057505f91506003905082610f85565b604080515f808252602082018084528a905260ff891692820192909252606081018790526080810186905260019060a0016020604051602081039080840390855afa158015610f51573d5f5f3e3d5ffd5b5050604051601f1901519150506001600160a01b038116610f7c57505f925060019150829050610f85565b92505f91508190505b9450945094915050565b5f826003811115610fa257610fa261132a565b03610fab575050565b6001826003811115610fbf57610fbf61132a565b03610fdd5760405163f645eedf60e01b815260040160405180910390fd5b6002826003811115610ff157610ff161132a565b036110125760405163fce698f760e01b815260048101829052602401610504565b60038260038111156110265761102661132a565b036106ec576040516335e2f38360e21b815260048101829052602401610504565b60605f61105383611084565b6040805160208082528183019092529192505f91906020820181803683375050509182525060208101929092525090565b5f60ff8216601f81111561045357604051632cd44ac360e21b815260040160405180910390fd5b5f81518084528060208401602086015e5f602082860101526020601f19601f83011685010191505092915050565b602081525f6110eb60208301846110ab565b9392505050565b80356001600160a01b0381168114611108575f5ffd5b919050565b5f5f6040838503121561111e575f5ffd5b611127836110f2565b946020939093013593505050565b5f5f5f60608486031215611147575f5ffd5b611150846110f2565b925061115e602085016110f2565b929592945050506040919091013590565b5f6020828403121561117f575f5ffd5b5035919050565b5f60208284031215611196575f5ffd5b6110eb826110f2565b60ff60f81b8816815260e060208201525f6111bd60e08301896110ab565b82810360408401526111cf81896110ab565b606084018890526001600160a01b038716608085015260a0840186905283810360c0850152845180825260208087019350909101905f5b81811015611224578351835260209384019390920191600101611206565b50909b9a5050505050505050505050565b5f5f5f5f5f5f5f60e0888a03121561124b575f5ffd5b611254886110f2565b9650611262602089016110f2565b95506040880135945060608801359350608088013560ff81168114611285575f5ffd5b9699959850939692959460a0840135945060c09093013592915050565b5f5f604083850312156112b3575f5ffd5b6112bc836110f2565b91506112ca602084016110f2565b90509250929050565b600181811c908216806112e757607f821691505b60208210810361130557634e487b7160e01b5f52602260045260245ffd5b50919050565b8082018082111561045357634e487b7160e01b5f52601160045260245ffd5b634e487b7160e01b5f52602160045260245ffdfea164736f6c634300081b000a";
