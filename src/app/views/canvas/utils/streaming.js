import axios from "axios"
import {contract} from './contractConnect'
import {getStakedAmount} from './getStakedAmount'

const NETWORK = 'mainnet';
const COMPOUND_API_CTOKEN_URL = `https://api.compound.finance/api/v2/ctoken?network=${NETWORK}`;

export async function streaming (){
    let address = window.ethereum.selectedAddress;

    // let staked equal getStakedAmount()
    let stake = await getStakedAmount(address);
    console.log("streaming.stake:", stake);
    
    // let streaming equal {stake * apy}
    let loadMessage = () => {
        return axios.get(COMPOUND_API_CTOKEN_URL)
        .then(function (response) {
          console.log('Response from the server: ', response)
          // document.getElementById('content').innerText = JSON.stringify(response.data.cToken, null, 2)
        })
        .catch(function (response) {
          console.log(response)
        })
    }

    await loadMessage()
    // let fundedTotal equal {accumulatedValue - staked}
    
    // return fundedTotal
    return true;

};