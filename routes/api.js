import express from "express";
import sql from "mssql";
import { getConnectionPool } from "../database.js"; // Use ES module import
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;

router.get("/data", async (req, res) => {
  try {
    const pool = await getConnectionPool(); // Get the connection pool
    const result = await pool.request().query("SELECT * FROM UserRole");
    //console.dir(result.recordset)
    res.json(result.recordset); // Send back the result
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
router.get("/test", (req, res) => {
  res.json([{ "test": "hello world!" }])
});
// Begin Josh Lewis

// Connection is successfull
router.post("/artist/profile/update", async (req, res) => {
  try {
    const { name, country, bio } = req.body;
    let query =
      'UPDATE Artist SET name = @name, country = @country, bio = @bio, \
          created_at = GETDATE(), user_id = user_id WHERE artist_id = @id';
    const request = new sql.Request();
    request.input('name', sql.NVarChar, name);
    request.input('country', sql.NVarChar, country);
    request.input('bio', sql.NVarChar, bio);
    request.input('id', sql.Int, 1);

    await request.query(query);
    res.status(200).send('Row updated successfully');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal server error');
  }
});
// Connection is successfull
router.post('/album/insert', async (req, res) => {
  try {
    const { id, name, instrument } = req.body;

    // Create a query to insert data
    const query = `
          INSERT INTO Album (create_at, update_at, cover_art, artist_id, album_name)
          VALUES (@created, @updated, @cover_art, @artist_id, @name)
      `;
    const now = new Date();
    const formattedDateTime = now.toISOString().slice(0, 19).replace('T', ' ');
    // Use a prepared statement with parameterized inputs to avoid SQL injection
    const request = new sql.Request();          // Bind the "id" parameter
    request.input('created', sql.DateTime, formattedDateTime);
    request.input('updated', sql.DateTime, formattedDateTime);
    request.input('cover_art', sql.Image, null);
    request.input('artist_id', sql.Int, 1);  // Bind the "name" parameter
    request.input('name', sql.NVarChar, "Josh");  // Bind the "instrument" parameter

    // Execute the query
    await request.query(query);

    res.status(200).send('Row inserted successfully');
  } catch (err) {
    console.error('Error inserting row: ', err);
    res.status(500).send('Error inserting row');
  }
});

router.post('/login', async (req, res) => {
  const { user_name, password } = req.body;
  //console.log(user_name + " " + password)
  if (!user_name || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  let myQuery =
    'SELECT user_id, password_hash, role_id FROM [User] WHERE username = @user_name;';
  const request = new sql.Request();
  request.input('user_name', sql.NVarChar, user_name);
  request.query(myQuery, async (err, result) => {


    const user = result.recordset[0];
    if (!user) {
      console.log(result.recordset.length)

      return res.status(200).json({ token: "" });
    }
    bcrypt.compare(password, user.password_hash, (err, result) => {
      if (err) {
        console.error('Error COmparing passwords: ', err);
        return;
      }
      if (result) {
        console.log("Passwords match")
        const token = jwt.sign(
          { id: user.user_id, role: user.role_id },
          SECRET_KEY,
          { expiresIn: '1h' }
        );
        return res.status(200).json({ token });
      } else {
        console.log("Passwords do not match")
        const token = "";
        return res.status(200).json({ token: "" });
      }
    })
    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log("user.password_hash:\n" + user.password_hash)

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const token = jwt.sign(
      { id: user.user_id, role: user.role_id },
      SECRET_KEY,
      { expiresIn: '1h' }
    );
    /*
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
    });
    
    const role_id = user.role_id
    res.json({ token });
    */
  });
});
// End /login

// Begin /register
router.post('/register', async (req, res) => {
  try {
    const { user_name, password, role_id } = req.body;
    //console.log(user_name + " " + password)
    // If either
    if (!role_id && !password) {
      if (user_name == "") {
        return res.status(400).json({ error: 'All fields are required.' });
      }
      // Request to verify user name availabilty. If request doesn't have 3
      // parameters then its a username verification call.
      let myQuery =
        'SELECT count(*) as total from [User] WHERE [username] = @user_name;';
      const request = new sql.Request();
      request.input('user_name', sql.NVarChar, user_name);
      request.query(myQuery, async (err, result) => {
        if (result && result.recordset && result.recordset.length > 0) {
          return res.status(sername_count === 0 ? 200 : 400).json({ usernameAvailable })
        } else {
          return res.json({ error: "database server did not return anything." })
        }
      })
    } else if (user_name !== "" && password && role_id) {
      const password_hash = await bcrypt.hash(password, 4);
      const myQuery = `
          INSERT INTO [User] (username, password_hash, created_at, role_id)
          OUTPUT inserted.user_id, inserted.username, inserted.role_id
          VALUES (@user_name, @password_hash, GETDATE(), @role_id)`;
      const request = new sql.Request();
      request.input('user_name', sql.NVarChar, user_name);
      request.input('password_hash', sql.NVarChar, password_hash);
      request.input('role_id', sql.Int, role_id);
      const result = await request.query(myQuery)//, async (err, result) => {
      if (result.rowsAffected[0] == 1) {
        const token = jwt.sign(
          {
            user_id: result.recordset[0], user_name: result.recordset[1], role_id: result.recordset[2]
          },
          SECRET_KEY,
          { expiresIn: '1h' }
        );
        res.json({ token });
      } else {
        res.json({ error: "database server did not return anything." })
      }
    }
    else {
      res.json({ error: "error" })
    }
  } catch (error) {
    res.json({ "error": error.message })
  }
});
// End /register

// End Josh Lewis
export default router;