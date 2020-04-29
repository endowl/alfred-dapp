import axios from "axios"
// import {contract} from './contractConnect'
import {getStakedAmount} from './getStakedAmount'

const NETWORK = 'mainnet';
const COMPOUND_API_CTOKEN_URL = `https://api.compound.finance/api/v2/ctoken?network=${NETWORK}`;

export async function streaming (){
    let address = window.ethereum.selectedAddress;
    let rate = null;
    let streamingAmt = null;

    // let staked equal getStakedAmount()
    let stake = await getStakedAmount(address);
    // console.log("streaming.stake:", stake);
    
    // let streaming equal {stake * apy}
    let loadMessage = () => {
        axios.get(COMPOUND_API_CTOKEN_URL)
        .then(function (response) {
          
          console.log('Response from the server: ', response)
          // document.getElementById('content').innerText = JSON.stringify(response.data.cToken, null, 2)
          rate = response.data.cToken;
          rate = rate.filter(obj => obj.symbol === "cDAI");
          rate = rate[0].supply_rate.value
          // console.log("streaming.rate:",rate)
          console.log("stake * rate:", stake * rate)
          streamingAmt = rate * stake
          console.log("streamingAmt", streamingAmt)
          return streamingAmt
        })
        .catch(function (response) {
          console.log(response)
        })
    }

    // console.log("loadMessage:", await loadMessage())

    return await loadMessage();

    // let fundedTotal equal {accumulatedValue - staked}
    
    // return fundedTotal
    // console.log("stake * rate:", stake * rate)
    // return stake * rate;

};