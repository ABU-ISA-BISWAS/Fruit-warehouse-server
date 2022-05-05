const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.duuuz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        await client.connect();
        const fruitCollection = client.db('fruit-warehouse').collection('fruit');

        app.get('/fruit',async(req,res) => {
            const query = {};
            const cursor =fruitCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        });
        app.get('/fruit/:id',async(req,res)=>{
          const id =req.params.id;
         const query = {_id:ObjectId(id)};
         const fruit =await fruitCollection.findOne(query);
         res.send(fruit);
        
        //  console.log(fruit);
      });
      app.put('/fruit/:id',async(req,res)=>{
        const id =req.params.id;
        const updatedFruit = req.body;
        const filter = {_id:ObjectId(id)};
        const options = { upsert: true };
        const updatedDoc = {
          $set:{
            quantity : updatedFruit.quantity,
            price : updatedFruit.price
          }
        }
        const result = await fruitCollection.updateOne(filter,updatedDoc,options);
        res.send(result);
     });

  //    app.put('/fruit/:id',async(req,res)=>{
  //     const id =req.params.id;
  //     const updatedFruit = req.body;
  //     const filter = {_id:ObjectId(id)};
  //     const options = { upsert: true };
  //     const updatedDoc = {
  //       $set:{
  //         price : updatedFruit.price
  //       }
  //     }
  //     const result = await fruitCollection.updateOne(filter,updatedDoc,options);
  //     res.send(result);
  //  });

     app.delete('/fruit/:id',async(req,res)=>{
      const id =req.params.id;
      console.log(id);
      const query = {_id: ObjectId(id)};
      console.log(query);
      const result = await fruitCollection.deleteOne(query);
      res.send(result);
   });

   app.post('/fruit',async(req,res)=>{
    const newItem = req.body;
    const result = await fruitCollection.insertOne(newItem);
    res.send(result);
})


    }
    finally{
        
    }
}
run().catch(console.dir);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello fruit warehouse')
});

app.listen(port, () => {
  console.log(`fruit warehouse running on port ${port}`)
});

