
var express = require('express'), 
app = module.exports = express();

app.set('view engine', 'ejs');
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

global.college = "Adhiparasakthi Engineering College";

// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


if (!module.parent) {
    app.listen( 3001 )
    console.log('Running in port 3001');
}


Web3 = require('web3-adhi')
web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

var contractAddress = "0x3a19a55fa21f9985e0a869f31408a90bb8a12ac2"

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

var smartContract = web3.eth.contract(abiDefinition).at(contractAddress);
console.log("smart contract function...", smartContract.listCertificatesCount());


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
      
      rollNo = parseInt(req.body.RollNo);
      name = req.body.Name;
      year = req.body.Year;
      result = req.body.Result;
      console.log(req.body);
      
      smartContract.putCertificateData( rollNo, name, year, result,
                                        {from:web3.eth.accounts[0], gas:3000000},
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