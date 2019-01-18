
var express = require('express'), 
app = module.exports = express();

app.set('view engine', 'ejs');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


if (!module.parent) {
    app.listen( 3001 )
    console.log('Running in port 3001');
}

var abiDefinition = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "_rollno",
        "type": "uint256"
      },
      {
        "name": "_name",
        "type": "string"
      },
      {
        "name": "_year",
        "type": "string"
      },
      {
        "name": "_result",
        "type": "string"
      }
    ],
    "name": "putCertificateData",
    "outputs": [
      {
        "name": "success",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "row",
        "type": "uint256"
      }
    ],
    "name": "certificateAtIndex",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "_rollno",
        "type": "uint256"
      }
    ],
    "name": "getCertificateData",
    "outputs": [
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "string"
      },
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "listCertificates",
    "outputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "listCertificatesCount",
    "outputs": [
      {
        "name": "count",
        "type": "uint256"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tableCertificates",
    "outputs": [
      {
        "name": "Name",
        "type": "string"
      },
      {
        "name": "Year",
        "type": "string"
      },
      {
        "name": "Result",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
]

Web3 = require('web3-adhi')
//web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));
web3 = new Web3(new Web3.providers.HttpProvider("https://adhinet.com"));

var contractAddress = "0xf4eac676837102ea6998e0b5e25188d87d104753"
var smartContract = web3.adh.contract(abiDefinition).at(contractAddress);

var adminAddress = "0x1E8A1E3423214a4b78BFA87440709867e6163615";
console.log("smart contract function...", smartContract.listCertificatesCount());
global.college = "Adhichain College";


app.get('/', function(req, res){
    res.render('menu', { 
      });
  });


app.get('/entry', function(req, res){
    res.render('entry', { 

          rollNo: "",
          name: "",
          year: "",
          result: "",
          message: ""

      });
  });


app.post('/entry', function(req, res){
      console.log("Body...", req.body);
      var message = "";
      
      rollNo = parseInt(req.body.RollNo);
      name = req.body.Name;
      year = req.body.Year;
      result = req.body.Result;
      
      var privateKey = "4f7a2f30c7fbd017ffc1e70379eb42cf3f8ac28abed3fcb7d754485f39514d9e"         
      var Tx = require('ethereumjs-tx');
      var privKey = new Buffer(privateKey, 'hex');

      var rawTransaction =  
              {  
                    "nonce":web3.toHex(web3.adh.getTransactionCount(adminAddress)),
                    "gasPrice":1000000000,
                    "gasLimit":3000000,
                    "to":smartContract.address,
                    "value":"0x00",
                    "data":smartContract.putCertificateData.getData(rollNo, name, year, result, {from:adminAddress}),
                    "chainId":1
              }

                  var tx = new Tx(rawTransaction);
                  tx.sign(privKey);
                  var serializedTx = tx.serialize();
                  
                  web3.adh.sendRawTransaction('0x' + serializedTx.toString('hex'), function(err, txnno) {
                    
                                if (err) 
                                    message = "Error occured.." 
                                 else 
                                    message = "Saved successfully.. Txn Ref : " + txnno          
                                

                                res.render('entry', { 
                                      rollNo: rollNo ,
                                      name: name,
                                      year: year,
                                      result: result,
                                      message: message
                                }); //render
                        });
  }); 



app.get('/view', function(req, res){
    res.render('view', { 
          rollNo: "",
          name: "",
          year: "",
          result: "",
          message: ""
      });
  });


app.post('/view', function(req, res){
      console.log("Roll No", parseInt(req.body.RollNo));

      rollNo = parseInt(req.body.RollNo);

      var certificateData = smartContract.getCertificateData(rollNo)
      
      console.log(certificateData);
      certificateData[3] = rollNo;
      var message = null;

        if (certificateData[0] == "") 
         { 
           message = "Record not found"
         }
     
        console.log(certificateData);

      res.render('view', { 
            rollNo: rollNo ,
            name: certificateData[0],
            year: certificateData[1],
            result: certificateData[2],
            message: message
        });
  });


app.get('/list', function(req, res){
  smartContract.listCertificatesCount( function(err, count) 
  {
        countCertificates = count.toNumber()
        console.log("count...", countCertificates );
        
        var certificatesArray = [];

        for(i=0; i<countCertificates; i++)
        {
          var rollNo = smartContract.certificateAtIndex(i).toNumber();
          var certificateData = smartContract.getCertificateData(rollNo)
          certificateData[3] = rollNo;
          console.log(certificateData);
          certificatesArray.push(certificateData);
        }
        res.render('list', { 
            certificates: certificatesArray
        });
  });

});


//
// if you run node locally with unlocked addresses
//

app.post('/entry1', function(req, res){
      console.log("Body...", req.body);
      
      rollNo = parseInt(req.body.RollNo);
      name = req.body.Name;
      year = req.body.Year;
      result = req.body.Result;
      console.log(req.body);
      
      smartContract.putCertificateData( rollNo, name, year, result,
                                        {from:web3.adh.accounts[0], gas:3000000},
                                        function(err, txn){

                                if (err) 
                                    message = "Error occured.." 
                                 else 
                                    message = "Saved successfully.. Txn Ref : " + txn          
                                
                                res.render('entry', { 
                                      rollNo: rollNo ,
                                      name: name,
                                      year: year,
                                      result: result,
                                      message: message
                                }); //render

      }); //smartcontract

  }); 

