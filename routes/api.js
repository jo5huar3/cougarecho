import express from "express";
import sql from "mssql";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv";
import path from 'path'
import fs from 'fs';
import { fileURLToPath } from "url";
import multer from "multer";
dotenv.config();

const router = express.Router();
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;
const userRoles = { "Listener": 1, "Artist": 2, "Admin": 3 }


router.get("/data", async (req, res) => {
  try {
    const myQuery = "SELECT * FROM UserRole";
    const request = new sql.Request();
    request.query(myQuery, async (err, result) => {
      res.json(result.recordset);
    })

  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
router.get("/test", (req, res) => {
  res.json([{ "test": "hello world!" }])
});
// Begin Josh
router.get('/listener/:id', async (req, res) => {
  try {
    const user_id = req.params.id;
    const request = await new sql.Request();
    request.input('user_id', sql.Int, user_id)
    const myQuery = `SELECT U.display_name, \
            ( \
            SELECT COUNT(*) FROM [Playlist] P where P.user_id = U.user_id \
            ) playlists FROM [User] U WHERE U.user_id = @user_id`;
    request.query(myQuery, async (err, result) => {
      console.log(result?.recordset?.[0])
      if (result?.recordset?.length > 0) {
        return res.json(result.recordset[0]);
      } else {
        return res.json({ display_name: '', playlists: '' });
      }
    })

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
// Get artist profile and counts
router.get('/artist/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const request = await new sql.Request();
    request.input('user_id', sql.Int, id)
    const myQuery = `SELECT A.artist_id, U.display_name,
          (SELECT COUNT(album_id) FROM Album WHERE artist_id = A.artist_id)  album_count,
          (SELECT COUNT(artist_id) FROM Song WHERE artist_id =a.artist_id)  song_count
          FROM [Artist] A, [User] U WHERE A.user_id = U.user_id and A.user_id = @user_id`;
    request.query(myQuery, async (err, result) => {
      if (result?.recordset?.length > 0) {
        res.json(result.recordset[0]);
      } else {
        res.json({ artist_id: '', artist_name: '', album_count: '', song_count: '' });
      }
    })

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/artist/:id/albumlatest', async (req, res) => {
  try {
    const id = req.params.id;
    const request = new sql.Request();
    request.input('user_id', sql.Int, id)
    const myQuery = 'SELECT A.album_name,\
          (Select SUM(B.plays) FROM Song B WHERE A.album_id = B.album_id ) album_streams, \
          (Select COUNT(C.song_id) FROM [Likes] C, [Song] D WHERE C.song_id = D.song_id and D.album_id = A.album_id ) album_likes \
          FROM [Album] A, [Artist] ART WHERE A.artist_id = ART.artist_id and ART.user_id = @user_id and A.create_at = \
          (select max(A_NEW.create_at) from [Album] A_NEW where A_NEW.album_id = A.album_id);';
    request.query(myQuery, async (err, result) => {
      if (result?.recordset?.length > 0) {
        res.json(result.recordset[0]);
      } else {
        res.json({ album_name: '', album_streams: 0, album_likes: 0 });
      }
    })

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Begin Josh Lewis
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create 'uploads' directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Directory where files will be stored
  },
  filename: function (req, file, cb) {
    // Save the file with its original name
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
const album_upload = upload.fields([
  { name: 'song', maxCount: 20 },
  { name: 'img', maxCount: 1 }
])
// Begin /album-upload
router.post("/song-insert", upload.single('song'), async function (req, res, next) {

  console.log(req?.body)
  const user_id = req?.body?.user_id
  const file = req?.file;
  const album_id = req?.body?.album_id
  const song_name = 'NO-NAME';
  const isAvailable = true;
  console.log("user_id: ", user_id, ", file", file)
  if (!file || !user_id || !album_id) {
    return res.status(400).json({ error: "File upload failed. Neccesary fields not received." });
  }
  //const transaction = new sql.Transaction()
  //transaction.begin(err => {


  try {
    const request1 = new sql.Request();
    request1.input('song_name', sql.VarChar, song_name);
    request1.input('user_id', sql.Int, user_id);
    request1.input('album_id', sql.Int, album_id);
    request1.input('isAvailable', sql.Bit, isAvailable);
    //request1.input('OutputTable', sql.Table, "isAvailable");

    console.log("Starting query1....")
    const result1 = await request1.query(
      'DECLARE @InsertedSongs TABLE (id INT); \
      INSERT INTO [Song] (song_name, album_id, artist_id, created_at, isAvailable) \
      OUTPUT inserted.song_id INTO @InsertedSongs \
      VALUES( @song_name, @album_id, (SELECT A.artist_id FROM [Artist] A WHERE A.user_id = @user_id), GETDATE(), @isAvailable); \
      SELECT * FROM @InsertedSongs;');
    console.log("Finished query1")
    console.log(result1?.rowsAffected[0], !result1?.[0]?.song_id)
    console.log(result1?.recordset?.[0].id)
    const song_id = result1?.recordset?.[0].id
    if (!song_id) {
      return res.status(500).json({ message: "Line 154 Error" });
    }
    console.log("Finished query1")
    const filePath = file.path;
    const fileBuffer = fs.readFileSync(filePath);

    const request2 = new sql.Request();
    request2.input('song_id', sql.Int, song_id);
    request2.input('file_name', sql.VarChar, file.originalname);
    request2.input('song_file', sql.VarBinary(sql.MAX), fileBuffer)
    request2.query(`INSERT INTO [SongFile] (song_id, song_file, file_name)
              VALUES (@song_id, @song_file, @file_name)`);
    fs.unlinkSync(filePath);
    console.log("Finished query2 *****")
    return res.status(200).json({ message: "Success" })
  } catch (err) {
    console.log("ERROR: ", err.message)
    return res.status(500).json({ message: err.message })
    //console.log('Transaction rolled back.')
  }
})
// NewAblum page: add album endpoint
// Begin /album-insert
router.post("/album-insert", upload.single('img'), async function (req, res, next) {
  try {
    const user_id = req?.body?.user_id
    const file = req?.file;
    const album_name = req?.body?.albumName
    console.log("user_id: " + user_id + ", album_name: " + album_name)
    if (!file || !user_id || !album_name) {
      return res.status(400).json({ error: "File upload failed. No file received." });
    }
    const filePath = file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const albRequest = new sql.Request();
    albRequest.input('user_id', sql.Int, user_id)
    albRequest.input('album_name', sql.VarChar, album_name)
    albRequest.input('album_cover', sql.VarBinary(sql.MAX), fileBuffer)
    const albResult = await albRequest.query(
      'INSERT INTO [Album]  (create_at, update_at, artist_id, album_name, album_cover) \
       OUTPUT inserted.artist_id, inserted.album_id \
       VALUES ( GETDATE(), GETDATE(), (SELECT A.artist_id FROM [Artist] A WHERE A.user_id = @user_id), @album_name, @album_cover)');
    if (albResult?.rowsAffected[0] == 1) {
      console.log(albResult?.recordset?.[0], 'Succsessful upload into DB.')
    }
    //const artist_id = albResult.recordset?.[0].artist_id;
    const album_id = albResult.recordset?.[0].album_id;
    fs.unlinkSync(filePath);
    return res.json({ album_id })
  }
  catch (err) {
    console.log("ERROR: ", err.message);
    return res.status(500)
  }
})

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

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  //console.log(user_name + " " + password)
  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  let myQuery =
    'SELECT user_id, username, password_hash, role_id FROM [User] WHERE username = @username;';
  const request = new sql.Request();
  request.input('username', sql.NVarChar, username);
  request.query(myQuery, async (err, result) => {


    const user = result?.recordset?.[0];
    if (!user) {
      console.log(result?.recordset?.length)

      return res.status(200).json({ token: "" });
    }
    bcrypt.compare(password, user.password_hash, (err, result) => {
      if (err) {
        console.error('Error COmparing passwords: ', err);
        return;
      }
      if (result) {
        console.log("Passwords match")
        const role_id = user.role_id
        const token = jwt.sign(
          { user_id: user.user_id, username: user.username, role_id },
          SECRET_KEY,
          { expiresIn: '1h' }
        );
        return res.json({ token, user_id: user.user_id, username: user.username, role_id });
      } else {
        console.log("Passwords do not match")
        const token = "";
        return res.status(200).json({ token: "" });
      }
    })
  });
});
// End /login

// Begin /register get method: This method checks if username is available.
router.get('/register/:username', async (req, res) => {
  try {
    const username = req.params.username;
    let myQuery =
      'SELECT 1 as total from [User] WHERE [username] = @username;';
    const request = new sql.Request();
    request.input('username', sql.NVarChar, username);
    request.query(myQuery, async (err, result) => {

      if (result && result.recordset && result.recordset.length > 0) {

        return res./*status(200).*/json({ "isUsernameAvailable": '0' })
      } else {
        return res./*status(200).*/json({ "isUsernameAvailable": '1' })
      }
    })
  }
  catch (err) {
    return res.status(500).json({ isUsernameAvailable: '0', error: err.message })
  }
});
// End /register get method:

// Begin /register
router.post('/register', async (req, res) => {
  try {
    const { username, password, role_id } = req.body;
    if (!role_id || !password || !username) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    const password_hash = await bcrypt.hash(password, 4);
    const myQuery = `
          INSERT INTO [User] (username, password_hash, created_at, role_id)
          OUTPUT inserted.user_id, inserted.username, inserted.role_id
          VALUES (@user_name, @password_hash, GETDATE(), @role_id)`;
    const request = new sql.Request();
    request.input('user_name', sql.NVarChar, username);
    request.input('password_hash', sql.NVarChar, password_hash);
    request.input('role_id', sql.Int, userRoles[role_id]);
    const result = await request.query(myQuery)//, async (err, result) => {
    if (result?.rowsAffected[0] == 1) {
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
  } catch (error) {
    res.json({ "error": error.message })
  }
});
// End /register

// End Josh Lewis


//Thinh Bui

//get all user
router.get('/users', async (req, res) => {
  try {
    const pool = await sql.connect('your-database-connection-string');
    const result = await pool.request().query('SELECT * FROM [dbo].[User]');
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//search for songs and artist name

router.get('/songs/search', async (req, res) => {
  const { keyword = '' } = req.query;

  try {
    const pool = await sql.connect('your-database-connection-string');
    const request = pool.request();
    request.input('keyword', sql.NVarChar, `%${keyword}%`); // Use wildcards to match the keyword

    const myQuery = `
      SELECT 
          s.song_id, 
          s.song_name, 
          s.duration, 
          s.plays, 
          s.created_at, 
          s.isAvailable, 
          a.album_name, 
          u.display_name AS artist_name, 
          g.genre_name 
      FROM [dbo].[Song] s
      JOIN [dbo].[Artist] ar ON s.artist_id = ar.artist_id
      JOIN [dbo].[User] u ON ar.user_id = u.user_id
      JOIN [dbo].[Album] a ON s.album_id = a.album_id
      LEFT JOIN [dbo].[Genre] g ON s.genre_id = g.genre_id
      WHERE s.song_name LIKE @keyword 
         OR u.display_name LIKE @keyword 
         OR u.first_name + ' ' + u.last_name LIKE @keyword`;

    const result = await request.query(myQuery);
    res.status(200).json(result.recordset);

  } catch (error) {
    console.error('Error fetching songs or artists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//End Thinh Bui
export default router;
/*
router.post("/new1album", upload.single('img'), async function (req, res, next) {
  try {
    console.log(req.file)
    const request = new sql.Request();
    request.input('img_file', sql.VarBinary, req?.file?.buffer)
    const result = await request.query(
      'INSERT INTO [Test] (img_file) VALUES(@img_file)'
    )
    if (result.rowsAffected == 1) {
      console.log('Succsessful upload into DB.')
    }
    /*
    try {
      if (!req?.buffer) {
        console.log('No files uploaded or album name missing.')
        return res.status(400).send('No files uploaded or album name missing.');
      }
      const fileBuffer = req.file?.buffer;
      //const fileName = req.file.originalname;
      //const fileType = req.file.mimetype;
  
      const request = new sql.Request();
      request.input('song_id', sql.Int, 1)
      request.input('file', sql.VarBinary, fileBuffer)
      //request.input('file_name', sql.VarBinary, fileName)
  
      const result = await request.query(
        'INSERT INTO [SongFile] (song_id, file) \
          VALUES(@song_id, @file)'
      )
      // Create album in database
      /*
      request.input('user_id', sql.VarChar, user_id);
      request.input('album_name', sql.VarChar, album_name);
      const result_alb = await request.query(
        'INSERT INTO [Album] A (created_at, update_at, artist_id, album_name) \
          OUTPUT inserted.artist_id, inserted.album_id VALUES (GETDATE(), GETDATE(), \
            (SELECT artist_id from [Artist] Art where Art.user_id = @user_id), @album_name)'
      );
      if (result_alb?.rowsAffected[0] != 1) {
        return res.status(400).send('No files uploaded or album name missing.');
      }
      const artist_id = (await result_alb).recordset?.[1];
      const album_id = (await result_alb).recordset?.[2];
      const genre_id = 1;
      for (const file of req.files) {
        //const filePath = `uploads/${file.filename}`;
        //const fileBuffer = fs.readFileSync(filePath);
        //request.input('artist_id', sql.VarChar, artist_id);
        //request.input('album_id', sql.VarChar, album_id);
        //request.input('genre_id', sql.Int, genre_id);
        const result = await new sql.Request()
          .input('album_id', sql.VarChar, album_id)
          .input('artist_id', sql.VarChar, artist_id)
          .input('song_name', sql.VarChar, album_name)
          .input('isAvailable', sql.Bit, 1)
          .query(
            'INSERT INTO [Song] S (song_name, album_id, artist_id, created_at, isAvailable) \
              OUTPUT inserted.song_id VALUES(@song_name, @album_id, @artist_id, GETDATE(), @isAvailable)'
          );
        await new sql.Request()
          .input('song_id', sql.VarChar, result?.recordset?.[0])
          .input('file', sql.VarBinary, file)
          .query(
            'INSERT INTO [SongFile] SF (song_id, file) VALUES (@song_id, @file)'
          )
        fs.unlinkSync(filePath);
      }
      
    console.log(result?.rowsAffected + ' rows affected.')
    return res.status(200).json({ 'msg': 'Success' });
  
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }*/
/*
 }
 catch (err) {
   console.log(err.message);
 }
})
*/
/*
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
*/
/*
router.post("/newalbum", upload, async (req, res) => {
  try {
    if (!req?.files) {
      console.log('No files uploaded or album name missing.')
      return res.status(400).send('No files uploaded or album name missing.');
    }
    const album_name = req.body.albumName;
    const user_id = req.body.albumName;
    const request = new sql.Request();
    // Create album in database
    request.input('user_id', sql.VarChar, user_id);
    request.input('album_name', sql.VarChar, album_name);
    const result_alb = await request.query(
      'INSERT INTO [Album] A (created_at, update_at, artist_id, album_name) \
        OUTPUT inserted.artist_id, inserted.album_id VALUES (GETDATE(), GETDATE(), \
          (SELECT artist_id from [Artist] Art where Art.user_id = @user_id), @album_name)'
    );
    if (result_alb?.rowsAffected[0] != 1) {
      return res.status(400).send('No files uploaded or album name missing.');
    }
    const artist_id = (await result_alb).recordset?.[1];
    const album_id = (await result_alb).recordset?.[2];
    const genre_id = 1;
    for (const file of req.files) {
      //const filePath = `uploads/${file.filename}`;
      //const fileBuffer = fs.readFileSync(filePath);
      //request.input('artist_id', sql.VarChar, artist_id);
      //request.input('album_id', sql.VarChar, album_id);
      //request.input('genre_id', sql.Int, genre_id);
      const result = await new sql.Request()
        .input('album_id', sql.VarChar, album_id)
        .input('artist_id', sql.VarChar, artist_id)
        .input('song_name', sql.VarChar, album_name)
        .input('isAvailable', sql.Bit, 1)
        .query(
          'INSERT INTO [Song] S (song_name, album_id, artist_id, created_at, isAvailable) \
            OUTPUT inserted.song_id VALUES(@song_name, @album_id, @artist_id, GETDATE(), @isAvailable)'
        );
      await new sql.Request()
        .input('song_id', sql.VarChar, result?.recordset?.[0])
        .input('file', sql.VarBinary, file)
        .query(
          'INSERT INTO [SongFile] SF (song_id, file) VALUES (@song_id, @file)'
        )
      fs.unlinkSync(filePath);
    }

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
})
// End /album-new
*/