const express = require('express');
const firebase = require('firebase-admin');
const bodyParser = require('body-parser');

// Initialize the app
const app = firebase.initializeApp({
  credential: firebase.credential.cert('./ServiceAccountKey.json'),
});

// Get the Firestore client
const db = app.firestore();
const myApp = express();
myApp.use(bodyParser.json());



// Create new organziaiton collection 
myApp.post('/Health_App', async (req, res) => {
  const validationErrors = {};

  if (!req.body.id) {
    validationErrors.id = 'ID is required';
  }

  if (validationErrors.length > 0) {
    res.status(400).send(validationErrors);
    return;
  }

  const docRef = db.collection('Health_App').doc(req.body.id);
  docRef.set({
    id: req.body.id,
    prefix: req.body.prefix,
    address: req.body.address,
    organizationName: req.body.organizationName,
    phone: req.body.phone,
    userId: req.body.userId,
    count: 0
  });

  res.status(201).send();
});



// Create a new Customer
myApp.post('/Health_App/:id/Customers', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id);
    const notesCollection = docRef.collection('Customers');
    const customer = req.body;
    const validationErrors = [];
    if (!customer.firstName) {
      validationErrors.push('First Name is required');
    }
    if (!customer.lastName) {
      validationErrors.push('Last Name is required');
    }
    if (!customer.email) {
      validationErrors.push('Email is required');
    }
    if (!customer.phone) {
      validationErrors.push('Phone is required');
    }
    if (validationErrors.length > 0) {
      res.status(400).send(validationErrors);
      return;
    }
    const customerDocument = notesCollection.doc();
    customerDocument.set(customer);
    res.status(201).send();
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});





// Update Customer
myApp.put('/Health_App/:reminderId/Customers/:customerId', async (req, res) => {
    try {
      const docRef = db.collection('Health_App').doc(req.params.reminderId).collection('Customers').doc(req.params.customerId);
      docRef.update(req.body);
      res.status(200).send();
    } catch (error) {
      res.status(error.code).send(error.message);
    }
  });


//Update org info 
  myApp.put('/Health_App/:id', async (req, res) => {
    try {
      const docRef = db.collection('Health_App').doc(req.params.id);
      const updateFields = req.body;
  
      // Add your validation logic here
  
      await docRef.update(updateFields);
  
      res.status(200).send();
    } catch (error) {
      res.status(error.code).send(error.message);
    }
  });


//Fetch All customer
myApp.get('/Health_App/:id/customers', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id);
    const notesCollection = docRef.collection('Customers');
    const customers = await notesCollection.get();

    const customerList = [];
    
    customers.forEach((doc) => {
      const data = doc.data();
      customerList.push(data);
    });


    const totalCount = customers.size;

    const response = {
      "totalCount": totalCount,
      "Customers": customerList
    };

    res.status(200).json(response);

  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});

// Fetch Single Customer
myApp.get('/Health_App/:id/customers/:customerId', async (req, res) => { 
  try { 
      const docRef = db.collection('Health_App').doc(req.params.id); 
      const notesCollection = docRef.collection('Customers'); 
      const customerDoc = await notesCollection.doc(req.params.customerId).get();
      if(!customerDoc.exists){ 
          res.status(400).send('Customer not found');
      }else{
          const customerData = customerDoc.data();
          res.status(200).json(customerData);
      }
  } catch (error) { 
      res.status(error.code).send(error.message); 
  } 
});



// Delete All Org Data
myApp.delete('/Health_App/:id', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id);
    docRef.delete();
    res.status(200).send();
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});


//Delete Customers
myApp.delete('/Health_App/:id/customers/:customerId', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id);
    const customersCollection = docRef.collection('Customers');
    const customerDoc = customersCollection.doc(req.params.customerId);

    const customerSnapshot = await customerDoc.get();
    if (!customerSnapshot.exists) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    await customerDoc.delete();
    return res.status(200).json({
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
});




// Start the Express app
myApp.listen(3000, () => {
  console.log('App listening on port 3000');
});


