import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import dbank from '../dbank.png';
import getWeb3 from "./getWeb3";
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    if( typeof window.ethereum !== 'undefined'){

    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();

    //console.log(typeof accounts);

    if( typeof accounts[0] !== 'undefined'){
      const balance = await web3.eth.getBalance(accounts[0]);
      this.setState({
        account : accounts[0],
        balance : balance,
        web3 : web3
      });
      
    }
    else{
      window.alert("Please login with metamask");
    }
   
    try {
      const netId = await web3.eth.net.getId();
      const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address);
      const dbank = new web3.eth.Contract(dBank.abi, dBank.networks[netId].address);
      const dBankAddress = dBank.networks[netId].address;
      const tokenAddress = Token.networks[netId].address;

  
      this.setState({
        token : token,
        dbank : dbank,
        dBankAddress : dBankAddress,
        tokenAddress : tokenAddress
      });

      this.tokenBalance();
      
    }
    catch (e) {
      console.log(e);
      window.alert("Contracts not deployed to the current address");
    }
    

    
    }
    else {
      window.alert("install metamask");
    }
  }

  async tokenBalance() {
    const tokenBalance = await this.state.token.methods.balanceOf(this.state.account).call();
    console.log(tokenBalance);
    const sym = await this.state.token.methods.symbol().call();
      console.log(sym)
     this.setState({
       tokenBalance : this.state.web3.utils.fromWei(tokenBalance),
       tokenSymbol : sym
     });

   

  }

  async deposit(amount) {
    if(this.state.dbank !=='undefined'){
      try {
        await this.state.dbank.methods.deposit().send({value: amount.toString(), from : this.state.account});

      }
      catch(e){
        console.log( "Error, deposit: ", e);
      }
    }
  }

  async withdraw(e) {
   e.preventDefault();
   if(this.state.dbank !== 'undefined'){
     try {
      await this.state.dbank.methods.withdraw().send({from: this.state.account});
     }
     catch(e){
       console.log("Error, withdrawal: ", e);
     }
   }
  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',   
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null,
      tokenAddress : null,
      tokenBalance: 0,
       tokenSymbol : "Symbol"
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href=""
            target="_self"
            rel="noopener noreferrer"
          >
        <img src={dbank} className="App-logo" alt="logo" height="32"/>
          <b>dBank</b>
        </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
        <br></br>
          <h1>Welcome to dBank</h1>
          <h2>{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
              <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
               <Tab eventKey="deposit" title = "Deposit">
                <div>
                  <br></br>
                  How much do you want to deposit?
                  <br></br>
                  (min. amount is 0.01 ETH)
                  <br></br>
                  (1 deposit is possible at the time)
                  <br></br>
                  <form onSubmit={(e)=> {
                    e.preventDefault(); 
                    let amount = this.depositAmount.value ;
                    amount = amount * 10**18;
                    this.deposit(amount);

                    }}>
                    <div className="form-group mr-sm-2">
                      <br></br>
                      <input id="depositAmount" 
                      step="0.01" type="number" 
                      className="form-control form-control-md" 
                      placeholder="Amount....."  
                      required 
                      ref={(input) => {this.depositAmount = input}}/>
                    </div>
                    <button type="submit" className="btn btn-primary"> DEPOSIT</button>

                  </form>
                </div>
               </Tab>
               <Tab eventKey="withdraw" title = "Withdraw">
                <div>
                  <br></br>
                 Do you want to withdraw + take interest ?
                 <br></br>
                 <br></br>
                 <button type="submit" className="btn btn-primary" onClick={(e)=> this.withdraw(e)}>Withdraw</button>
                </div>
               </Tab>
               <Tab eventKey="tokenBalance" title = "Token Balance">
                 <div>Your token balance</div>
                 <br></br>
                 {this.state.tokenBalance}  {this.state.tokenSymbol}
               </Tab>
              </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;