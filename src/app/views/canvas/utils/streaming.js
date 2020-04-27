import axios from "axios"
import {contract} from './contractConnect'
import {getStakedAmount} from './getStakedAmount'

export async function streaming (){
    let address = window.ethereum.selectedAddress;

    // let staked equal getStakedAmount()
    let stake = await getStakedAmount(address);
    console.log("streaming.stake:", stake);
    
    // let streaming equal {stake * apy}
    let loadMessage = () => {
      axios.get('/api/messages', {responseType: 'arraybuffer'})
        .then(function (response) {
          console.log('Response from the server: ', response)
          let msg = Message.decode(response.data)
          console.log('Decoded message', msg)
          document.getElementById('content').innerText = JSON.stringify(msg, null, 2)
        })
        .catch(function (response) {
          console.log(response)
        })
    }
    
    // let fundedTotal equal {accumulatedValue - staked}
    
    // return fundedTotal
    return true;

};