const bringOutYourDeadFactoryAbi = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "estate",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "estateCreated",
		"type": "event"
	},
	{
		"constant": false,
		"inputs": [
			{
				"internalType": "address",
				"name": "oracle",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "executor",
				"type": "address"
			}
		],
		"name": "newEstate",
		"outputs": [
			{
				"internalType": "address",
				"name": "estateContract",
				"type": "address"
			}
		],
		"payable": true,
		"stateMutability": "payable",
		"type": "function"
	}
];

module.exports = bringOutYourDeadFactoryAbi;
