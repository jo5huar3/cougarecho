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

// Begin Josh Lewis
router.get('/listener/:id', async (req, res) => {
  try {
    const user_id = req.params.id;
    const request = await new sql.Request();
    request.input('user_id', sql.Int, user_id)
    const myQuery = `SELECT U.display_name, \
            ( \
            SELECT COUNT(*) FROM [Playlist] P where P.user_id = U.user_id \
            ) playlists, U.avatar FROM [User] U WHERE U.user_id = @user_id`;
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
// Begin get album_cover IMAGE
router.get('/album/:album_id/IMG', async (req, res) => {
  try {
    const album_id = req.params.album_id;
    const request = new sql.Request();
    request.input('album_id', sql.Int, album_id)
    const myQuery = 'SELECT A.album_cover FROM [Album] A WHERE A.album_id = @album_id;';
    request.query(myQuery, async (err, result) => {
      if (result?.recordset?.length > 0) {
        console.log("IMAGE BACKEND: ", result.recordset?.[0].album_cover)
        const imageBuffer = result?.recordset?.[0].album_cover;
        res.setHeader('Content-Type', 'image/jpeg'); // Set the correct MIME type
        res.send(imageBuffer);
      } else {
        return res.status(300).json({ message: "Album does not exist." });
      }
    })

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
})
router.get('/artist/:artist_id/IMG', async (req, res) => {
  try {
    const artist_id = req.params.artist_id;
    const request = new sql.Request();
    request.input('artist_id', sql.Int, artist_id)
    const myQuery = 'SELECT A.album_cover FROM [Album] A WHERE A.album_id = @album_id;';
    request.query(myQuery, async (err, result) => {
      if (result?.recordset?.length > 0) {
        console.log("IMAGE BACKEND: ", result.recordset?.[0].album_cover)
        const imageBuffer = result?.recordset?.[0].album_cover;
        res.setHeader('Content-Type', 'image/jpeg'); // Set the correct MIME type
        res.send(imageBuffer);

      } else {
        return res.status(300).json({ message: "Album does not exist." });
      }
    })

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
})
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
    const myQuery = 'SELECT A.album_name name,\
          (Select SUM(B.plays) FROM Song B WHERE A.album_id = B.album_id ) streams, \
          (Select COUNT(C.song_id) FROM [Likes] C, [Song] D WHERE C.song_id = D.song_id and D.album_id = A.album_id ) likeSaves \
          FROM [Album] A, [Artist] ART WHERE A.artist_id = ART.artist_id and ART.user_id = @user_id and A.create_at = \
          (select max(A_NEW.create_at) from [Album] A_NEW where A_NEW.artist_id = A.artist_id);';
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
router.get('/album/playcount/3', async (req, res) => {
  try {
    const id = req.params.id;
    const request = new sql.Request();
    //request.input('user_id', sql.Int, id)
    const myQuery = 'SELECT TOP 3 A.album_id, A.album_name, ART.artist_name, \
     AP.playCount, AP.lastPlayed, A.album_cover \
    FROM [Album] A, [Artist] ART, [AlbumPlays] AP \
    where A.album_cover is not null and A.artist_id = ART.artist_id and A.album_id = AP.album_id ORDER BY AP.playCount DESC;';
    const result = await request.query(myQuery);
    const albums = result?.recordset?.map((album) => {
      const base64Image = album.album_cover
        ? Buffer.from(album.album_cover).toString('base64')
        : null;
      return {
        album_id: album.album_id,
        album_name: album.album_name,
        artist_name: album.artist_name,
        playCount: album.playCount,
        lastPlayed: album.lastPlayed,
        album_cover: base64Image ? `data:image/jpeg;base64,${base64Image}` : null, // Include MIME type prefix
      };

    })

    /*console.log([{ ...result?.recordset?.[0], album_cover: null },
    { ...result?.recordset?.[1], album_cover: null }, { ...result?.recordset?.[2], album_cover: null }])*/
    return res.json(albums);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
// Song upload endpoint
router.post("/song-insert", upload.single('song'), async function (req, res) {
  try {
    const user_id = req?.body?.user_id;
    const file = req?.file;
    const album_id = req?.body?.album_id;
    const song_name = 'NO-NAME';
    const isAvailable = true;

    console.log("user_id:", user_id, ", file:", file);
    if (!file || !user_id || !album_id) {
      return res.status(400).json({ error: "File upload failed. Necessary fields not received." });
    }

    const filePath = file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const request = new sql.Request();

    request.input('song_name', sql.VarChar, song_name);
    request.input('user_id', sql.Int, user_id);
    request.input('album_id', sql.Int, album_id);
    request.input('isAvailable', sql.Bit, isAvailable);

    console.log("Starting query to insert song...");
    const result = await request.query(`
      DECLARE @InsertedSongs TABLE (id INT);
      INSERT INTO [Song] (song_name, album_id, artist_id, created_at, isAvailable)
      OUTPUT inserted.song_id INTO @InsertedSongs
      VALUES (@song_name, @album_id, 
              (SELECT A.artist_id FROM [Artist] A WHERE A.user_id = @user_id), 
              GETDATE(), @isAvailable);
      SELECT * FROM @InsertedSongs;
    `);

    const song_id = result?.recordset?.[0]?.id;
    if (!song_id) {
      return res.status(500).json({ error: "Error inserting song." });
    }

    console.log("Inserting song file...");
    const request2 = new sql.Request();
    request2.input('song_id', sql.Int, song_id);
    request2.input('file_name', sql.VarChar, file.originalname);
    request2.input('song_file', sql.VarBinary(sql.MAX), fileBuffer);

    await request2.query(`
      INSERT INTO [SongFile] (song_id, song_file, file_name)
      VALUES (@song_id, @song_file, @file_name);
    `);

    fs.unlinkSync(filePath);
    console.log("Song upload successful");
    return res.status(200).json({ message: "Song uploaded successfully" });

  } catch (err) {
    console.log("Full error:", err);

    // Check for the specific trigger error based on the error message
    let errorMessage = err.message;

    // Check if precedingErrors contains the trigger's custom error message
    if (err.precedingErrors && err.precedingErrors.length > 0) {
      const customError = err.precedingErrors.find(error =>
        error.message.includes("Unverified artists can only upload one song per day")
      );
      if (customError) {
        errorMessage = customError.message;
      }
    }

    if (errorMessage.includes("Unverified artists can only upload one song per day")) {
      return res.status(403).json({ error: "Unverified artists can only upload one song per day." });
    } else {
      return res.status(500).json({ error: errorMessage });
    }
  }
});


// Album upload endpoint
router.post("/album-insert", upload.single('img'), async function (req, res) {
  try {
    const user_id = req?.body?.user_id;
    const file = req?.file;
    const album_name = req?.body?.albumName;

    console.log("user_id:", user_id, ", album_name:", album_name);
    if (!file || !user_id || !album_name) {
      return res.status(400).json({ error: "File upload failed. Required fields missing." });
    }

    const filePath = file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const request = new sql.Request();

    request.input('user_id', sql.Int, user_id);
    request.input('album_name', sql.VarChar, album_name);
    request.input('album_cover', sql.VarBinary(sql.MAX), fileBuffer);

    console.log("Inserting album...");
    
    const result = await request.query(`
      DECLARE @InsertedAlbum TABLE (album_id INT);
      INSERT INTO [Album] (create_at, update_at, artist_id, album_name, album_cover)
      OUTPUT inserted.album_id INTO @InsertedAlbum
      VALUES (GETDATE(), GETDATE(), 
              (SELECT A.artist_id FROM [Artist] A WHERE A.user_id = @user_id), 
              @album_name, @album_cover);
      SELECT album_id FROM @InsertedAlbum;
    `);

    const album_id = result?.recordset[0]?.album_id;
    if (album_id) {
      fs.unlinkSync(filePath);
      console.log("Album upload successful");
      return res.json({ album_id });
    } else {
      return res.status(500).json({ error: "Album upload failed." });
    }
  } catch (err) {
    console.log("Full error:", err);

    // Check for the specific trigger error based on the error message
    let errorMessage = err.message;

    // Check if precedingErrors contains the trigger's custom error message
    if (err.precedingErrors && err.precedingErrors.length > 0) {
      const customError = err.precedingErrors.find(error =>
        error.message.includes("Unverified artists can only create one album per day")
      );
      if (customError) {
        errorMessage = customError.message;
      }
    }

    if (errorMessage.includes("Unverified artists can only create one album per day")) {
      return res.status(403).json({ error: "Unverified artists can only create one album per day." });
    } else {
      return res.status(500).json({ error: errorMessage });
    }
  }
});

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
router.post("/register", async (req, res) => {
  try {

    const { username, password, role_id } = req.body;
    if (!role_id || !password || !username) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const password_hash = await bcrypt.hash(password, 4);

    const myQuery = `
          INSERT INTO [User] (username, password_hash, created_at, role_id)
          OUTPUT inserted.user_id, inserted.username, inserted.role_id
          VALUES (@user_name, @password_hash, GETDATE(), @role_id)`;

    const request = new sql.Request();

    request.input("user_name", sql.NVarChar, username);
    request.input("password_hash", sql.NVarChar, password_hash);
    request.input("role_id", sql.Int, role_id); // Pass role_id directly

    const result = await request.query(myQuery);

    if (result?.rowsAffected[0] == 1) {
      const user_id = result.recordset[0].user_id;

      // If the user role is "Artist" (role_id = 2), add them to the Artist table
      if (numericRoleId === 2) {
        const artistQuery = `
          INSERT INTO [Artist] (user_id, artist_name, country, bio, created_at, isVerified)
          VALUES (@user_id, @artist_name, @country, @bio, GETDATE(), 0)`;

        const artistRequest = new sql.Request();
        artistRequest.input('user_id', sql.Int, user_id);
        artistRequest.input('artist_name', sql.NVarChar, username);
        artistRequest.input('country', sql.NVarChar, country || 'Unknown');
        artistRequest.input('bio', sql.NVarChar, bio || 'No biography provided');

        await artistRequest.query(artistQuery);
      }

      const token = jwt.sign(
        {

          user_id: result.recordset[0].user_id,
          username: result.recordset[0].username,
          role_id: result.recordset[0].role_id,
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      res.json({ token });
    } else {

      res.json({ error: "Database server did not return anything." });
    }
  } catch (error) {
    res.json({ error: error.message });
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
  try {
    // Get and validate the keyword
    const keyword = req.query.keyword?.toString() || '';
    
    // Log for debugging
    console.log('Search request received:', { keyword });

    if (keyword.length < 2) {
      return res.json([]); // Return empty array for short queries
    }

    const request = new sql.Request();
    request.input('keyword', sql.NVarChar, `%${keyword}%`);

    const result = await request.query(`
      SELECT TOP 10
          s.song_id, 
          s.song_name, 
          s.duration, 
          s.plays, 
          s.created_at, 
          s.isAvailable, 
          a.album_name, 
          u.display_name AS artist_name
      FROM [dbo].[Song] s
      JOIN [dbo].[Artist] ar ON s.artist_id = ar.artist_id
      JOIN [dbo].[User] u ON ar.user_id = u.user_id
      JOIN [dbo].[Album] a ON s.album_id = a.album_id
      WHERE s.song_name LIKE @keyword 
         OR u.display_name LIKE @keyword
      ORDER BY s.song_name ASC
      `); // Limit results for better performance

    // Log the results for debugging
    console.log(`Found ${result.recordset.length} results`);

    return res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Search error:', error);
    return res.status(500).json({ 
      error: 'Error searching songs',
      details: error.message 
    });
  }
});
router.get('/user-rating', async (req, res) => {
  try {
    const pool = await sql.connect('your-database-connection-string');
    const result = await pool.request().query(`
      WITH UserPlays AS (
          SELECT user_id, COUNT(song_id) AS songs_played
          FROM dbo.SongPlayHistory
          GROUP BY user_id
      ),
      UserPlaylists AS (
          SELECT user_id, COUNT(playlist_id) AS playlists_created
          FROM dbo.Playlist
          GROUP BY user_id
      ),
      UserLikes AS (
          SELECT user_id, COUNT(song_id) AS likes_given
          FROM dbo.Likes
          GROUP BY user_id
      )
      
      SELECT 
          u.user_id,
          u.username,
          u.display_name,
          ISNULL(up.songs_played, 0) AS songs_played,
          ISNULL(ul.likes_given, 0) AS likes_given,
          ISNULL(upc.playlists_created, 0) AS playlists_created
      FROM dbo.[User] u
      LEFT JOIN UserPlays up ON u.user_id = up.user_id
      LEFT JOIN UserLikes ul ON u.user_id = ul.user_id
      LEFT JOIN UserPlaylists upc ON u.user_id = upc.user_id
      ORDER BY u.user_id;
    `);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching user activity report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/song-rating', async (req, res) => {
  try {
    const pool = await sql.connect('your-database-connection-string');
    const results = await pool.request().query(`
      SELECT 
          s.song_name,
          a.artist_name,
          COALESCE(COUNT(DISTINCT l.user_id), 0) AS total_likes,
          COALESCE(COUNT(DISTINCT ph.user_id), 0) AS total_plays
      FROM 
          dbo.Song s
      LEFT JOIN 
          dbo.Likes l ON s.song_id = l.song_id
      LEFT JOIN 
          dbo.SongPlayHistory ph ON s.song_id = ph.song_id
      LEFT JOIN 
          dbo.Artist a ON s.artist_id = a.artist_id
      GROUP BY 
          s.song_name, a.artist_name
      ORDER BY 
          total_likes DESC, total_plays DESC;
    `);
    res.status(200).json(results.recordset);
  } catch (error) {
    console.error('Error fetching song rating report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/artist-rating', async (req, res) => {
  try {
    const pool = await sql.connect('your-database-connection-string');
    const results = await pool.request().query(`
      WITH ArtistSongCounts AS (
          SELECT 
              s.artist_id,
              COUNT(s.song_id) AS total_songs
          FROM 
              Song s
          GROUP BY 
              s.artist_id
      ),
      ArtistAlbumCounts AS (
          SELECT 
              a.artist_id,
              COUNT(DISTINCT alb.album_id) AS total_albums
          FROM 
              Album alb
          JOIN 
              Artist a ON alb.artist_id = a.artist_id
          GROUP BY 
              a.artist_id
      ),
      ArtistLikeCounts AS (
          SELECT 
              s.artist_id,
              COUNT(l.song_id) AS total_likes
          FROM 
              Likes l
          JOIN 
              Song s ON l.song_id = s.song_id
          GROUP BY 
              s.artist_id
      )
      
      SELECT 
          a.artist_id,
          a.artist_name,
          COALESCE(ascnt.total_songs, 0) AS total_songs,
          COALESCE(aac.total_albums, 0) AS total_albums,
          COALESCE(alc.total_likes, 0) AS total_likes
      FROM 
          Artist a
      LEFT JOIN 
          ArtistSongCounts ascnt ON a.artist_id = ascnt.artist_id
      LEFT JOIN 
          ArtistAlbumCounts aac ON a.artist_id = aac.artist_id
      LEFT JOIN 
          ArtistLikeCounts alc ON a.artist_id = alc.artist_id
      ORDER BY 
          total_likes DESC;
    `);
    res.status(200).json(results.recordset);
  } catch (error) {
    console.error('Error fetching artist summary report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Begin /create-admin
router.post('/create-admin', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Hash the password using bcrypt
    const password_hash = await bcrypt.hash(password, 4);
    
    // Define SQL query to insert new admin user into the database
    const myQuery = `
          INSERT INTO [User] (username, password_hash, created_at, role_id)
          OUTPUT inserted.user_id, inserted.username, inserted.role_id
          VALUES (@username, @password_hash, GETDATE(), @role_id)`;
    
    // Create SQL request
    const request = new sql.Request();
    request.input('username', sql.NVarChar, username);
    request.input('password_hash', sql.NVarChar, password_hash);
    request.input('role_id', sql.Int, 3); // Role ID 3 for admin

    // Execute the query
    const result = await request.query(myQuery);
    
    if (result?.rowsAffected[0] === 1) {
      // Generate a JWT token for the newly created admin user
      const token = jwt.sign(
        {
          user_id: result.recordset[0].user_id,
          username: result.recordset[0].username,
          role_id: result.recordset[0].role_id,
        },
        SECRET_KEY,
        { expiresIn: '1h' }
      );

      // Respond with the JWT token
      res.json({ token });
    } else {
      res.status(500).json({ error: "Failed to create admin account. Database did not return expected output." });
    }
  } catch (error) {
    // Handle errors and send response with error message
    res.status(500).json({ error: error.message });
  }
});
// End /create-admin


//End Thinh Bui

//Will Nguyen Begin

//Start: Create New Playlist
router.post("/playlist/new", async (req, res) => {
  try {
    const { title, userId, avatar } = req.body;

    if (!title || !userId) {
      return res
        .status(400)
        .json({ message: "Playlist title and user ID are required." });
    }

    const request = new sql.Request();
    request.input("title", sql.VarChar(50), title);
    request.input("userId", sql.Int, userId);
    request.input("avatar", sql.VarChar(255), avatar || null); // avatar can be null

    const result = await request.query(`
      INSERT INTO [Playlist] (title, user_id, created_at, updated_at, avatar)
      OUTPUT inserted.playlist_id
      VALUES (@title, @userId, GETDATE(), GETDATE(), @avatar)
    `);

    const playlistId = result.recordset[0].playlist_id;
    res
      .status(200)
      .json({ message: "Playlist created successfully", playlistId });
  } catch (err) {
    console.error("Error creating playlist:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
//End: Create New Playlist

//Start: Add song to playlist
router.post("/playlist/:playlist_id/song", async (req, res) => {
  try {
    //Code to handle request goes here
    const { playlist_id } = req.params;
    const { song_id, active } = req.body;

    if (!playlist_id || !song_id) {
      return res.status(400).json({ message: "Playlist ID and song are required." });
    }

    const request = new sql.Request();

    request.input("playlist_id", sql.Int, playlist_id);
    request.input("song_id", sql.Int, song_id);
    request.input("created_at", sql.DateTime, new Date());
    request.input("updated_at", sql.DateTime, new Date());
    request.input("active", sql.Bit, active !== undefined ? active : 1); // Default to active if not provided

    const result = await request.query(`
      INSERT INTO [PlaylistSongs] (playlist_id, song_id, created_at, updated_at, active)
      VALUES (@playlist_id, @song_id, @created_at, @updated_at, @active)
      `);

    if (result.rowsAffected[0] === 1) {
      res.status(200).json({ message: "Song added to playlist successfully" });
    } else {
      res.status(500).json({ error: "Failed to add song to playlist" });
    }

  } catch (err) {
    console.error("Error adding song to playlist:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
//End: Add Song to Playlist

// Start: Delete song from playlist
router.delete('/playlist/:playlist_id/song/:song_id', async (req, res) => {
  try {
    const { playlist_id, song_id } = req.params;

    if (!playlist_id || !song_id) {
      return res.status(400).json({ message: 'Playlist ID and Song ID are required' });
    }

    const request = new sql.Request();
    request.input('playlist_id', sql.Int, playlist_id);
    request.input('song_id', sql.Int, song_id);

    const result = await request.query(`
      DELETE FROM [PlaylistSongs]
      WHERE playlist_id = @playlist_id AND song_id = @song_id
    `);

    if (result.rowsAffected[0] === 1) {
      res.status(200).json({ message: 'Song deleted from playlist successfully' });
    } else {
      res.status(404).json({ message: 'Song not found in playlist' });
    }
  } catch (err) {
    console.error('Error deleting song from playlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//End: Delete song from playlist

// Delete playlist
router.delete('/playlist/:playlist_id', async (req, res) => {
  try {
    const { playlist_id } = req.params;

    if (!playlist_id) {
      return res.status(400).json({ message: 'Playlist ID is required' });
    }

    const request = new sql.Request();
    request.input('playlist_id', sql.Int, playlist_id);

    // First, delete all related songs in PlaylistSongs (optional, if required)
    await request.query(`
      DELETE FROM [PlaylistSongs]
      WHERE playlist_id = @playlist_id
    `);

    // Then, delete the playlist itself
    const result = await request.query(`
      DELETE FROM [Playlist]
      WHERE playlist_id = @playlist_id
    `);

    if (result.rowsAffected[0] === 1) {
      res.status(200).json({ message: 'Playlist deleted successfully' });
    } else {
      res.status(404).json({ message: 'Playlist not found' });
    }
  } catch (err) {
    console.error('Error deleting playlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//End: delete playlist

//Start: get playlist

router.get('/playlist/:playlist_id', async (req, res) => {
  try {
    const { playlist_id } = req.params;
    const request = new sql.Request();
    request.input('playlist_id', sql.Int, playlist_id);
    
    // First get playlist details
    const playlist = await request.query(`
      SELECT p.*, u.username as creator_name 
      FROM [Playlist] p
      JOIN [User] u ON p.user_id = u.user_id
      WHERE p.playlist_id = @playlist_id
    `);

    // Then get playlist songs
    const songs = await request.query(`
      SELECT s.*, ps.created_at as added_at
      FROM [Song] s
      JOIN [PlaylistSongs] ps ON s.song_id = ps.song_id
      WHERE ps.playlist_id = @playlist_id AND ps.active = 1
      ORDER BY ps.created_at DESC
    `);

    res.json({
      ...playlist.recordset[0],
      songs: songs.recordset
    });
  } catch (err) {
    console.error('Error fetching playlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//End: get playlist

//Start: update playlist name
router.put('/playlist/:playlist_id', async (req, res) => {
  try {
    const { playlist_id } = req.params;
    const { title } = req.body;
    
    const request = new sql.Request();
    request.input('playlist_id', sql.Int, playlist_id);
    request.input('title', sql.VarChar, title);
    
    await request.query(`
      UPDATE [Playlist]
      SET title = @title, updated_at = GETDATE()
      WHERE playlist_id = @playlist_id
    `);

    res.json({ message: 'Playlist updated successfully' });
  } catch (err) {
    console.error('Error updating playlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//End: update playlist name
router.put('/playlist/:playlist_id', async (req, res) => {
  try {
    const { playlist_id } = req.params;
    const { title } = req.body;
    
    const request = new sql.Request();
    request.input('playlist_id', sql.Int, playlist_id);
    request.input('title', sql.VarChar, title);
    
    await request.query(`
      UPDATE [Playlist]
      SET title = @title, updated_at = GETDATE()
      WHERE playlist_id = @playlist_id
    `);

    res.json({ message: 'Playlist updated successfully' });
  } catch (err) {
    console.error('Error updating playlist:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//Start: get user playlists
// Get user's playlists
router.get('/playlists/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const request = new sql.Request();
    request.input('userId', sql.Int, userId);
    
    const result = await request.query(`
      SELECT 
        p.playlist_id,
        p.title,
        p.avatar,
        p.created_at,
        p.updated_at,
        p.user_id
      FROM [Playlist] p
      WHERE p.user_id = @userId
      ORDER BY p.created_at DESC
    `);
    
    console.log('Found playlists:', result.recordset); // Fixed logging statement
    res.json(result.recordset);
  } catch (err) {
    console.error('Error fetching user playlists:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
//End: get user playlists

//Will Nguyen End

//Homepage: Yeni
// In your api.js file, update the routes
// Get top 3 artists
router.get("/artists", async (req, res) => {

  try {
    const request = new sql.Request();
    const query = `
      SELECT TOP 3
        artist_id,
        artist_name,
        country
      FROM [Artist]
      WHERE artist_name IS NOT NULL
      ORDER BY created_at DESC
    `;

    request.query(query, (err, result) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(result.recordset || []);
    });
  } catch (err) {
    console.error('Route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top 3 albums
router.get("/albums", async (req, res) => {
  try {
    const request = new sql.Request();
    const query = `
      SELECT TOP 3
        a.album_id,
        a.album_name,
        a.artist_id,
        art.artist_name,
        a.album_cover
      FROM [Album] a
      INNER JOIN [Artist] art ON a.artist_id = art.artist_id
      WHERE a.album_name IS NOT NULL
      ORDER BY a.create_at DESC
    `;

    request.query(query, (err, result) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(result.recordset || []);
    });
  } catch (err) {
    console.error('Route error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }

})
// End /album-new


//End Homepage: Yeni
export default router;

