import Web3 from "web3";
import starNotaryArtifact from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = starNotaryArtifact.networks[networkId];
      this.meta = new web3.eth.Contract(
        starNotaryArtifact.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;
    const name = document.getElementById("starName").value;
    const id = document.getElementById("starId").value;

    try
    {
      let starInfo = await this.getStarInfo(id);
      App.setStatus("Error creating star: Star ID " + id + " already exists");
      return;          
    } 
    catch (e)
    {
      // This is the happy case (probably - we allow the function proceed regardless)
      try
      {
        console.log("Create star");
        await createStar(name, id).send({from: this.account});
        console.log("Create star success");
        App.setStatus("New Star Owner is " + this.account + ".");  
      }
      catch (e)
      {
        console.log("Error caught");
        App.setStatus("Error creating star: ", e.message);
      }
    }
  },

  // Implement Task 4 Modify the front end of the DAPP
  getStarInfo: async function (id){
    const { lookUptokenIdToStarInfo } = this.meta.methods;
    return await lookUptokenIdToStarInfo(id).call({from: this.account});
  },

  lookUp: async function (){
    try
    {
      const id = document.getElementById("lookid").value;
      let starInfo = await this.getStarInfo(id);
      App.setStatus("Star Info: " + JSON.stringify(starInfo));          
    } 
    catch (e)
    {
      if (e.message.search("revert Unknown star") !== -1)
      {
        App.setStatus("Unknown star");          
      } 
      else
      {
        App.setStatus("Error locating Star Info: " + e.message);          
      }
    }
  }
};

window.App = App;

window.addEventListener("load", async function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    await window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn("No web3 detected. Falling back to http://0.0.0.0:8545. You should remove this fallback when you deploy live",);
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(new Web3.providers.HttpProvider("http://0.0.0.0:8545"),);
  }

  App.start();
});