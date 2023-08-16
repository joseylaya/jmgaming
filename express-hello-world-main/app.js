const express = require("express");
const app = express();
const port = process.env.PORT || 3001;
const mysql = require ('mysql');
const cors = require ('cors');
const bcrypt = require('bcrypt')
// standard for express
app.use(cors());
app.use(express.json());

// db con
const db = mysql.createConnection({
  user: 'root',
  hostname: 'proweaveracademy',
  password: '',
  database: 'academy'
});

// Attempt to connect to the database
db.connect((err) => {
  if (err) {
      console.error('Error connecting to the database:', err);
      return;
  }

  console.log('Connected to the database!');
});

app.get("/", (req, res) => res.type('html').send(html));


// insert quert
app.post('/insert', (req, res) => {
  const Name = req.body.Name
  const Codename = req.body.Usercodename
  const Teamname = req.body.Userteamname
  const Interest = req.body.Userinterest
  const Email = req.body.Useremail
  const Password = req.body.Userpassword
  const Status = req.body.Userstatus
  const Role = req.body.Userrole

db.query('INSERT INTO usertbl (Name, Codename, Teamname, Email, Password, Interest, Status, Role) VALUES (?,?,?,?,?,?,?,?)',
  [Name, Codename, Teamname, Email, Password, Interest, Status, Role],
      (err, result) =>{
          if(err){
              console.log(err)
          } else{
              res.send(result)
          }
      }
  )
});

app.post('/insertContentmodule', (req, res) => {
const id = req.body.id
const content = req.body.content

db.query('INSERT INTO module_content_tbl (moduleID, content) VALUES (?,?)',
[id, content],
    (err, result) =>{
        if(err){
            console.log(err)
        } else{
            res.send(result)
        }
    }
)
});


// ADD QUIZ 
app.post('/Addquiz', (req, res) => {
const { id, examContent } = req.body;

db.query('INSERT INTO module_exam_tbl (moduleID, examContent) VALUES (?, ?)',
  [id, examContent], // Convert the examContent JSON object to a string
  (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error inserting quiz data.");
    } else {
      res.status(200).send("Quiz data inserted successfully.");
    }
  }
);
});



app.get('/fetchQuiz/:moduleId', (req, res) => {
const moduleId = req.params.moduleId;

const query = "SELECT * FROM module_exam_tbl WHERE moduleId = ?";

db.query(query, [moduleId], (err, result) => {
  if (err) {
    console.log(err)
  } else {
    res.send(result)
  }
})
})


app.get('/user/:id', (req, res) => {
  const { id } = req.params;
  db.query(`SELECT * FROM usertbl WHERE Id = ${id}`, (err, result) => {
      if (err) {
          console.log(err);
          res.status(500).send('An error occurred');
      } else {
          res.send(result);
      }
  });
});

app.get('/singleCourse/:id', (req, res) => {
  const { id } = req.params;
  db.query(`SELECT * FROM course_tbl
            JOIN module_tbl ON module_tbl.course_id = course_tbl.id
            WHERE course_tbl.id = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: 'An error occurred' });
    } else {
      db.query(`SELECT * FROM usertbl WHERE Id = ${id}`, (err, innerResult) => {
        if (err) {
          console.log(err);
          res.status(500).send('An error occurred');
        } else {
          res.send({
            modules: result, 
            moduleContent: innerResult
          });
        }
      });;
    }
  });
});

app.get('/content/:id', (req, res) => {
  const { id } = req.params;

  db.query(`SELECT * FROM module_content_tbl 
    JOIN module_tbl ON module_tbl.id = module_content_tbl.moduleId 
    WHERE moduleId = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send('An error occurred');
    }

    db.query(`SELECT * FROM course_tbl WHERE Id = ${id}`, (err, innerResult) => {
      if (err) {
        console.log(err);
        return res.status(500).send('An error occurred');
      }

      res.send({ moduleContent: result, courseData: innerResult });
    });
  });
});

app.get('/fetchModule/:id', (req, res) => {
  const { id } = req.params;
  db.query(`SELECT * FROM module_tbl WHERE course_id = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred');
    } else {
      db.query(`SELECT * FROM module_content_tbl WHERE moduleID = ${id}`, (err, innerResult) => {
        if (err) {
          console.log(err);
          res.status(500).send('An error occurred');
        } else {
          res.send({
            modules: result,
            moduleContent: innerResult
          });
        }
      });
    }
  });
});

app.get('/fetchModuleContent/:id', (req, res) => {
  const { id } = req.params;
  db.query(`SELECT * FROM module_content_tbl WHERE moduleId = ${id}`, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred');
    } 
      else {
          res.send(result);
      }
      });
  });

  app.get('/fetchSingleModule/:id', (req, res) => {
    const { id } = req.params;
    db.query(`SELECT * FROM module_tbl WHERE id = ${id}`, (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred');
      } 
        else {
            res.send(result);
        }
        });
    });

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  db.query("SELECT * FROM usertbl WHERE Email = ?;",
      email,
      (err, result) => {
          if (err) {
              res.status(500).send({ message: 'An error occurred during login' });
              return;
          }
          if (result && result.length > 0) {
              bcrypt.compare(password, result[0].Password, (error, response) => {
                  if (response) {
                      res.send(result);
                  } else {
                      res.send({ message: 'Wrong email/password combination!' });
                  }
              });
          } else {
              res.send({ message: "User doesn't exist" });
          }
      }
  );
});


app.get('/fetchCourse', (req, res) =>{
  db.query("SELECT * FROM course_tbl",  (err, result) =>{
      if(err){
          console.log(err)
      }else{
          res.send(result)
      }
  })
})

// delete query
app.delete('/deleteUser/:id', (req, res) => {
  const { id } = req.params;
  db.query(`DELETE FROM usertbl WHERE Id = ${id}`,  (err, result) =>{
      if(err){
          console.log(err)
          res.status(500).json({ error: 'An error occurred' });
      }else{
          res.send(result)
      }
  })
});


// Update query
app.put('/updateUser/:id', (req, res) => {
  const { id } = req.params;
  const updatedRow = req.body;

  db.query(
    'UPDATE users SET name = ?, email = ?, profile_image_url = ?, cover_photo_url = ?, about_me = ? WHERE Id = ?',
    [
      updatedRow.name,
      updatedRow.email,
      updatedRow.profile_image_url,
      updatedRow.cover_photo_url,
      updatedRow.about_me,
      id,
    ],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred' });
      } else {
        res.send('User updated');
      }
    }
  );
});


const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>Hello from Render!</title>
    <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"></script>
    <script>
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          disableForReducedMotion: true
        });
      }, 500);
    </script>
    <style>
      @import url("https://p.typekit.net/p.css?s=1&k=vnd5zic&ht=tk&f=39475.39476.39477.39478.39479.39480.39481.39482&a=18673890&app=typekit&e=css");
      @font-face {
        font-family: "neo-sans";
        src: url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff2"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/d?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("woff"), url("https://use.typekit.net/af/00ac0a/00000000000000003b9b2033/27/a?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3") format("opentype");
        font-style: normal;
        font-weight: 700;
      }
      html {
        font-family: neo-sans;
        font-weight: 700;
        font-size: calc(62rem / 16);
      }
      body {
        background: white;
      }
      section {
        border-radius: 1em;
        padding: 1em;
        position: absolute;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%);
      }
    </style>
  </head>
  <body>
    <section>
      Hello from JmGaming!
    </section>
  </body>
</html>
`
