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

//______________________ MAIN APP SECTIONS _______________________________
// Create new organization collection
myApp.post('/Health_App', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).send({ message: 'ID is required' });
    }
    const docRef = db.collection('Health_App').doc(id);
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

// Update organization info
myApp.put('/Health_App/:id', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id);
    const updateFields = req.body;
    // Add your validation logic here
    await docRef.update(updateFields);
    res.status(200).send({ message: 'Organization updated successfully' });
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

//________________________ PROFESSIONALS SECTION ___________________________________

// Create a new professional
myApp.post('/Health_App/:id/professionals', async (req, res) => {
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

    const docRef = db.collection('Health_App').doc(req.params.id).collection('professionals').doc();
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

// Update professional
myApp.put('/Health_App/:reminderId/professionals/:professional_ID', async (req, res) => {
  try {
    await db.collection('Health_App').doc(req.params.reminderId)
      .collection('professionals').doc(req.params.professional_ID)
      .update(req.body);
    res.status(200).send({ message: 'professional updated successfully' });
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});


// Fetch all professionals
myApp.get('/Health_App/:id/professionals', async (req, res) => {
  try {
    const snap = await db.collection('Health_App').doc(req.params.id)
      .collection('professionals').get();
    const professionals = snap.docs.map((doc) => doc.data());
    const totalCount = snap.size;
    res.status(200).json({ totalCount, professionals });
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});

// Fetch single professional
myApp.get('/Health_App/:id/professionals/:professional_ID', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id)
      .collection('professionals').doc(req.params.professional_ID);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).send({ message: 'professional not found' });
    }
    res.status(200).json(snap.data());
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// Delete all org data
myApp.delete('/Health_App/:id', async (req, res) => {
  try {
    await db.collection('Health_App').doc(req.params.id).delete();
    res.status(200).send({ message: 'Organization data deleted successfully' });
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// Delete professional
myApp.delete('/Health_App/:id/professionals/:professional_ID', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id)
      .collection('professionals').doc(req.params.professional_ID);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).send({ message: 'professional not found' });
    }
    await docRef.delete();
    res.status(200).send({ message: 'professional deleted successfully' });
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});



// ___________________________________This organization section______________________________________


// Create a new organization
myApp.post('/Health_App/:id/organizations', async (req, res) => {
  try {
    const { orgName, orgType, email, phone } = req.body;
    const validationErrors = [];
    if (!orgName) {
      validationErrors.push('Organization Name is required');
    }
    if (!orgType) {
      validationErrors.push('Organization Type is required');
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

    const docRef = db.collection('Health_App').doc(req.params.id).collection('organizations').doc();
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



// Update organization info
myApp.put('/Health_App/:id', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id);
    const updateFields = req.body;
    // Add your validation logic here
    await docRef.update(updateFields);
    res.status(200).send({ message: 'Organization updated successfully' });
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});

// Fetch all organizations
myApp.get('/Health_App/:id/organizations', async (req, res) => {
  try {
    const snap = await db.collection('Health_App').doc(req.params.id)
      .collection('organizations').get();
    const organizations = snap.docs.map((doc) => doc.data());
    const totalCount = snap.size;
    res.status(200).json({ totalCount, organizations });
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});

// Fetch single organization
myApp.get('/Health_App/:id/organizations/:organization_ID', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id)
      .collection('organizations').doc(req.params.organization_ID);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).send({ message: 'organization not found' });
    }
    res.status(200).json(snap.data());
  } catch (error) {
    res.status(error.code).send(error.message);
  }
});



myApp.delete('/Health_App/:id/organizations/:organization_ID', async (req, res) => {
  try {
    const docRef = db.collection('Health_App').doc(req.params.id)
      .collection('organizations').doc(req.params.organization_ID);
    const snap = await docRef.get();
    if (!snap.exists) {
      return res.status(404).send({ message: 'organization not found' });
    }
    await docRef.delete();
    res.status(200).send({ message: 'organization deleted successfully' });
  } catch (error) {
    res.status(error.code || 500).send(error.message);
  }
});






//___________________________ Authentication TASKS______________________

const validatePhone = (phone_number) => {
  // Check if the phone number is in a valid format
  if (!phone_number.match(/^\+1[0-9]{10}$/)) {
    return false;
  }

  // The phone number is in a valid format
  return true;
};






// Signup API
myApp.post("/signup", async (req, res) => {
  const { phone_number, password } = req.body;

  if (!validatePhone(phone_number)) {

    res.json({
      status: "error",
      message: "Invalid phone number"
    });
    return;
  }

  // Check if the user already exists in Firestore
  const user = await usersCollection.doc(phone_number).get()
  // const user=false;



  // If the user doesn't exist, create a new user
  if (!user) {
    const otp = Math.random().toString(36).substring(4);

    sendOTP(phone_number, otp);

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






// Login API
myApp.post("/login", async (req, res) => {
  const { phone_number, password } = req.body;

  // Check if the user exists in Firestore
  const user = await usersCollection.doc(phone_number).get();

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





// OTP verification endpoint
myApp.get("/otp", async (req, res) => {
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
