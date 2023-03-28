import './ContractTester.css';
import { ethers } from 'ethers';
import { useState } from 'react';
import erc20Abi from "../../abi/ERC20Test.json";
import thusdAbi from "../../abi/THUSDToken.json";
import priceFeedAbi from "../../abi/PriceFeedTestnet.json"
import borrowerOperationsAbi from "../../abi/BorrowerOperations.json";
import liquityBorrowerOperationsAbi from "../../abi/LiquityBorrowerOperations.json"
import troveManagerAbi from "../../abi/TroveManager.json"
import EventLogger from './EventLogger';


function ContractTester() {
  const functionSignatureBytes = ethers.utils.toUtf8Bytes("adjustTrove(uint256,uint256,uint256,bool,uint256,address,address)");
  const queryId = ethers.utils.keccak256(functionSignatureBytes );
  console.log("queryId: ", queryId)

  const [chainId, setChainId] = useState();
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionContract, setTransactionContract] = useState(); 
  const [provider, setProvider] = useState();
  const [signer, setSigner] = useState();

  const erc20Address = "0x1bcE05aE998bE945373B5d7B4cC09635BDceBE28";
  const thusdAddress = "0xbA3eBA5d0D6Fe45a9a6Ca674f15BBB99EfB13f53";
  const borrowerOperationsAddress = "0x7734b52C2Cf1245C109745E193dFcC67f35f672F";
  const priceFeedAddress = "0x2310f2fDD622303Af46c12946f7Db26235CF0097";
  const troveManagerAddress = "0x8557503027429623302507DdffB82AdF521DFB03"

  // const liquityBorrowersOperationsAddress = "0xa36bA16411AF139737E8E345Cd9422a47856bECa";

  const contractAbi = thusdAbi;
  const contractAddress = thusdAddress;

  const sendTransaction = async () => {
    if (signer && contractAddress) {
      const contractConnected = transactionContract.connect(signer);
      console.log('contractConnected: ', contractConnected);
      const maxBorrowingRate = ethers.utils.parseUnits("0.005", 18);
      const collateralUnits = ethers.utils.parseUnits("0.2", 18);
      const thusdUnits = ethers.utils.parseUnits("1800", 18);
  
      const upperHint = ethers.constants.AddressZero;
      const lowerHint = ethers.constants.AddressZero;
  
      // Fetch the current network gas price
      const gasPrice = ethers.utils.parseUnits("0", 18);
      const gasPriceInGwei = ethers.utils.formatUnits(gasPrice, 9); // Convert the gas price to a decimal string with 9 decimal places
      console.log('Gas price (Gwei):', gasPriceInGwei);
      // Estimate the gas required for the openTrove function call
      let gasLimit;
      gasLimit = ethers.BigNumber.from(20000000); // Fallback gas limit in case the estimation fails
  
      const gasLimitWithBuffer = gasLimit.mul(ethers.BigNumber.from(12)).div(ethers.BigNumber.from(10));
      console.log(await provider.getNetwork())
      try {
        const tx = await contractConnected.finalizeAddMintList();
        console.log("tx: ", tx);
  
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log("receipt: ", receipt);
  
        // Check if the transaction was successful
        if (receipt.status === 0) {
          // The transaction failed - try to parse the error message from the logs
          const errorMessage = receipt.logs
            .map(log => ethers.utils.toUtf8String(log.data))
            .find(data => data.startsWith("Error:"));
          console.error("OpenTrove failed with error:", errorMessage);
        } else {
          console.log("OpenTrove succeeded");
        }
      } catch (err) {
        console.error('Error populating transaction:', err);
        console.error('Error message:', err.message);
      }
    }
  };

  async function getSigner(provider, walletAddress) {
    try {
      const signer = provider.getSigner(walletAddress);
      setSigner(signer);
    } catch (error) {
      console.error(error);
    };
  };

  async function setContract(contractAddress, contractAbi, setterContractFn, provider) {
    try {
      const contract = new ethers.Contract(contractAddress, contractAbi, provider);
      setterContractFn(contract);
    } catch (error) {
      console.error(error);
    };
  };

  async function requestAccount () {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      setWalletAddress(accounts[0]);
      return accounts;
    } catch (error) {
      console.log(error)
    };
  };

  async function getProvider() {
    const customNetwork = {
      name: 'goerli',
      chainId: 5,
    };
    
    const provider = new ethers.providers.Web3Provider(window.ethereum, customNetwork);
    await window.ethereum.request({ method: 'eth_chainId', params: [] }).then(chainId => {
      provider._network.chainId = ethers.BigNumber.from(chainId).toNumber(); // set the chainId
    });
  
    const fetchedChainId = await provider.getNetwork().then(network => network.chainId);
    console.log('Connected to chainId:', fetchedChainId);
    setChainId(fetchedChainId);
    setProvider(provider);
    return { provider, chainId: fetchedChainId };
  } 

  async function connectWallet() {
    if (typeof window.ethereum !== 'undefined' && typeof provider === 'undefined') {
      getProvider()
        .then(async ({ provider, chainId }) => {
          const accounts = await requestAccount();
          const userWallet = accounts[0];
          setContract(contractAddress, contractAbi, setTransactionContract, provider);
          setChainId(chainId);
          return { provider, userWallet };
        })
        .then(({ provider, userWallet }) => {
          getSigner(provider, userWallet);
        })
        .catch((err) => console.error('Connect wallet error: ', err));
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <button
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
        <h3>Wallet Address: {walletAddress}</h3>
        <button
          onClick={sendTransaction}
        >
          Call Transaction
        </button>
      </header>
    </div>
  );
};

export default ContractTester;
