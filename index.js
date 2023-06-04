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
// Create a new collection in Firestore called "users"
const usersCollection = db.collection("users");



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
myApp.post('/Health_App/:id/professionals', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id);
    const notesCollection = docRef.collection('professionals');
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
myApp.put('/Health_App/:reminderId/professionals/:professional_ID', async (req, res) => {
    try {
      const docRef = db.collection('Health_App').doc(req.params.reminderId).collection('professionals').doc(req.params.professional_ID);
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
myApp.get('/Health_App/:id/professionals', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id);
    const notesCollection = docRef.collection('professionals');
    const professionals = await notesCollection.get();

    const customerList = [];
    
    professionals.forEach((doc) => {
      const data = doc.data();
      customerList.push(data);
    });


    const totalCount = professionals.size;

    const response = {
      "totalCount": totalCount,
      "professionals": customerList
    };

    res.status(200).json(response);

  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});

// Fetch Single Customer
myApp.get('/Health_App/:id/professionals/:professional_ID', async (req, res) => { 
  try { 
      const docRef = db.collection('Health_App').doc(req.params.id); 
      const notesCollection = docRef.collection('professionals'); 
      const customerDoc = await notesCollection.doc(req.params.professional_ID).get();
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


//Delete professionals
myApp.delete('/Health_App/:id/professionals/:professional_ID', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id);
    const professionalsCollection = docRef.collection('professionals');
    const customerDoc = professionalsCollection.doc(req.params.professional_ID);

    const professionalsnapshot = await customerDoc.get();
    if (!professionalsnapshot.exists) {
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




//login and signup and OTP

// Login endpoint
myApp.post("/login", async (req, res) => {
  // Get the phone number and password from the request body
  const { phone_number, password } = req.body;

  // Check if the user exists in Firestore
  const user = await usersCollection.doc(phone_number).get();

  // If the user exists, check if the password is correct
  if (user && user.data().password === password) {
    // Login the user
    res.json({
      status: "success",
      user: user.data()
    });
  } else {
    // Unsuccessful login
    res.json({
      status: "error",
      message: "Invalid credentials"
    });
  }
});



const validatePhone = (phone_number) => {
  // Check if the phone number is in a valid format
  // if (!phone_number.match(/^\+1[0-9]{10}$/)) {
    // return false;
  // }

  // The phone number is in a valid format
  return true;
};

// Signup endpoint
myApp.post("/signup", async (req, res) => {
  // Get the phone number and password from the request body
  const { phone_number, password } = req.body;

  // Check if the phone number is valid
  if (!validatePhone(phone_number)) {
    // The phone number is not valid
    res.json({
      status: "error",
      message: "Invalid phone number"
    });
    return;
  }

  // Check if the user already exists in Firestore
  // const user = await usersCollection.doc(phone_number).get()
  const user=false;

  // If the user doesn't exist, create a new user
  if (!user) {
    // Generate a random OTP
    const otp = Math.random().toString(36).substring(7);

    // Send the OTP to the user's phone number
    // sendOTP(phone_number, otp);

    // Save the OTP in Firestore
    await usersCollection.doc(phone_number).set({
      phone_number,
      password,
      otp
    });

    // Redirect the user to the otp verification page
    res.redirect("/otp");
  } else {
    // Unsuccessful signup
    res.json({
      status: "error",
      message: "User already exists"
    });
  }
});

// OTP verification endpoint
myApp.get("/otp", async (req, res) => {
  // Get the phone number from the query string
  const { phone_number } = req.query;

  // Check if the OTP is valid
  const user = await usersCollection.doc(phone_number).get();

  if (user && user.data().otp === req.query.otp) {
    // OTP is valid, login the user
    res.json({
      status: "success",
      user: user.data()
    });
  } else {
    // OTP is invalid
    res.json({
      status: "error",
      message: "Invalid OTP"
    });
  }
});





// Start the Express app
myApp.listen(3000, () => {
  console.log('App listening on port 3000');
});
