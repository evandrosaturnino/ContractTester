import { ethers } from 'ethers';
import styles from './EventLogger.module.css';

import borrowerOperationsAbi from "../../abi/BorrowerOperations.json";
import { useEffect, useState } from 'react';

const borrowerOperationsAddress = "0x7734b52C2Cf1245C109745E193dFcC67f35f672F";

const contractAbi = borrowerOperationsAbi;
const contractAddress = borrowerOperationsAddress;

// Replace with the URL of your Ethereum provider (e.g., Infura, Alchemy, or a local node)
const providerUrl = 'https://goerli.infura.io/v3/YOUR-API-KEY';

const EventLogger = () => {
  const [events, setEvents] = useState([]);

  const fetchHistoricalEvents = async (provider, borrowerOperations) => {
    // Replace 'YourEventName' with the actual event name from the BorrowerOperations contract
    const eventName = borrowerOperations.interface.getEvent('TroveCreated');
    const eventFilter = borrowerOperations.filters[eventName.name]();
    console.log(eventFilter)
    return await provider.getLogs({
      fromBlock: 0,
      toBlock: 'latest',
      address: borrowerOperations.address,
      topics: eventFilter.topics,
    });
  };
  
  useEffect(() => {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const borrowerOperations = new ethers.Contract(contractAddress, contractAbi, provider);

    fetchHistoricalEvents(provider, borrowerOperations).then((res) => {
      const parsedEvents = res.map(log => borrowerOperations.interface.parseLog(log));
      console.log("parsedEvents: ", parsedEvents)
      setEvents(parsedEvents);
    })
  }, []);

  return (
    <div className={styles.eventLogger}>
      <div className={styles.tableWrapper}>
        <h2>Historical Events</h2>
        <table className={styles.table}>
        <thead>
            <tr>
              <th>Event Name</th>
              <th>Block Number</th>
              <th>Transaction Hash</th>
              {events.length > 0 &&
                Object.keys(events[0].args).map((arg, index) => (
                  <th key={index}>Argument {index + 1}</th>
                ))}
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => {
              const numArgs = Object.keys(event.args).length;
              const argsArray = Object.values(event.args);
              return (
                <tr key={index}>
                  <td>{event.name}</td>
                  <td>{event.blockNumber ? event.blockNumber.toString() : 'Pending'}</td>
                  <td>{event.transactionHash}</td>
                  {argsArray.map((arg, argIndex) => (
                    <td key={argIndex}>{ethers.BigNumber.isBigNumber(arg) ? arg.toString() : arg}</td>
                  ))}
                  {/* Add empty cells for remaining argument columns */}
                  {numArgs < 2 && <td />}
                  {numArgs < 3 && <td />}
                  {/* Add more empty cells as needed */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EventLogger;
