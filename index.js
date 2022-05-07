const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

app.use(cors());
app.use(express.json());

function verifyJWT (req,res,next){
  const authH = req.headers.authorization;
  if(!authH){
    return res.status(401).send({message:'Unauthorized Access'});
  }
  const token = authH.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
    if(err){
      return res.status(403).send({message:'Forbidden Access'});
    }
    console.log('dec',decoded);
    req.decoded = decoded;
    next();
  });
   
}



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.duuuz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    await client.connect();
    const fruitCollection = client.db('fruit-warehouse').collection('fruit');

    app.get('/fruit', async (req, res) => {

      const query = {};
      const cursor = fruitCollection.find(query);
      const fruits = await cursor.toArray();
      res.send(fruits);
    });
    app.get('/fruit/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const fruit = await fruitCollection.findOne(query);
      res.send(fruit);

      //  console.log(fruit);
    });
    app.put('/fruit/:id', async (req, res) => {
      const id = req.params.id;
      const updatedFruit = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updatedFruit.quantity,
          price: updatedFruit.price
        }
      }
      const result = await fruitCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    });

    app.delete('/fruit/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      console.log(query);
      const result = await fruitCollection.deleteOne(query);
      res.send(result);
    });

    app.post('/fruit', async (req, res) => {
      const newItem = req.body;
      const result = await fruitCollection.insertOne(newItem);
      res.send(result);
    });

    app.get('/fruits',verifyJWT,  async (req, res) => {

      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if(email === decodedEmail){
        const query = {email:email};
        const cursor = fruitCollection.find(query);
        const fruits = await cursor.toArray();
        res.send(fruits);       
      }
      else {
        res.status(403).send({message:'Forbidden Access'})
      }
           
    });

    app.post('/login', async(req,res)=>{
      const user =req.body;
      var token = jwt.sign( user, process.env.ACCESS_TOKEN_SECRET,{expiresIn: '30d'});
      res.send({token});
    });

  }
  finally {

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello fruit warehouse')
});

app.listen(port, () => {
  console.log(`fruit warehouse running on port ${port}`)
});

