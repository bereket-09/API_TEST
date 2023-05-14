// This is the optimized version of the index.js

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

// Create new organization collection
myApp.post('/ET_Reminders', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).send({ message: 'ID is required' });
    }
    const docRef = db.collection('ET_Reminders').doc(id);
    const data = {
      id,
      prefix: req.body.prefix,
      address: req.body.address,
      organizationName: req.body.organizationName,
      phone: req.body.phone,
      userId: req.body.userId,
      count: 0,
    };
    await docRef.set(data);
    res.status(201).send();
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// Create a new customer
myApp.post('/ET_Reminders/:id/customers', async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;
    const validationErrors = [];
    if (!firstName) {
      validationErrors.push('First Name is required');
    }
    if (!lastName) {
      validationErrors.push('Last Name is required');
    }
    if (!email) {
      validationErrors.push('Email is required');
    }
    if (!phone) {
      validationErrors.push('Phone is required');
    }
    if (validationErrors.length > 0) {
      return res.status(400).send(validationErrors);
    }

    const docRef = db.collection('ET_Reminders').doc(req.params.id).collection('Customers').doc();
    const data = {
      firstName,
      lastName,
      email,
      phone,
    };
    await docRef.set(data);
    res.status(201).send();
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// Update customer
myApp.put('/ET_Reminders/:reminderId/customers/:customerId', async (req, res) => {
  try {
    await db.collection('ET_Reminders').doc(req.params.reminderId)
      .collection('Customers').doc(req.params.customerId)
      .update(req.body);
    res.status(200).send({ message: 'Customer updated successfully' });
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// Update organization info
myApp.put('/ET_Reminders/:id', async (req, res) => {
  try {
    const docRef = db.collection('ET_Reminders').doc(req.params.id);
    const updateFields = req.body;
    // Add your validation logic here
    await docRef.update(updateFields);
    res.status(200).send({ message: 'Organization updated successfully' });
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// Fetch all customers
myApp.get('/ET_Reminders/:id/customers', async (req, res) => {
  try {
    const snap = await db.collection('ET_Reminders').doc(req.params.id)
      .collection('Customers').get();
    const customers = snap.docs.map((doc) => doc.data());
    const totalCount = snap.size;
    res.status(200).json({ totalCount, customers });
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});

// Fetch single customer
myApp.get('/ET_Reminders/:id/customers/:customerId', async (req, res) => {
  try {
    const docRef = db.collection('ET_Reminders').doc(req.params.id)
      .collection('Customers').doc(req.params.customerId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).send({ message: 'Customer not found' });
    }
    res.status(200).json(snap.data());
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// Delete all org data
myApp.delete('/ET_Reminders/:id', async (req, res) => {
  try {
    await db.collection('ET_Reminders').doc(req.params.id).delete();
    res.status(200).send({ message: 'Organization data deleted successfully' });
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// Delete customer
myApp.delete('/ET_Reminders/:id/customers/:customerId', async (req, res) => {
  try {
    const docRef = db.collection('ET_Reminders').doc(req.params.id)
      .collection('Customers').doc(req.params.customerId);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).send({ message: 'Customer not found' });
    }
    await docRef.delete();
    res.status(200).send({ message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});

// Start the Express app
myApp.listen(3000, () => {
  console.log('App listening on port 3000');
});
