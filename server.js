const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const fs = require("fs");
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
app.use('/uploads',express.static(__dirname+'/uploads'));

app.use(cors({ origin: "*" }));
app.use(express.json());


    const db = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "Vansh@1234",
        database: "triage",
      });
      
      db.connect((err) => {
        if (err) {
          console.error('Database connection failed: ', err.stack);
          return;
        }
        console.log('Connected to database.');
      });
      


app.post("/signup", (req, res) => {
  const sql = "INSERT INTO `triage`.`login` (`username`, `email`, `passwords`, `fpA`) VALUES (?,?,?,?)";
  const values = [
    req.body.username,
    req.body.email,
    req.body.password,
    req.body.fpanswer
  ]

  console.log("this is array: ", values);

  db.query(sql, values, (err, data) => {
      if(err){
          return res.json("Error .....");
      }
      return res.json(data);
  })
});


app.post("/login", (req, res) => {
 
  const sql = "SELECT * FROM login WHERE `email` = ? AND `passwords` = ?";


  db.query(sql,[ req.body.email,req.body.password], (err, data) => {
      if(err){
          return res.status(400).json({message:err.message});
      }
      else if(data.length > 0){
        return res.status(200).json({message:"success",data});
      }
      else
      return res.json("fail")

  })
});

app.post('/case', uploadMiddleware.single('file'), async (req,res) => {
  const sql = "INSERT INTO cases( `description_`, `respiration`,`position_`,`perfusion`,`mental_status`,`color`,`extra_info`,`image`) VALUES (?,?,?,?,?,?,?,?)";
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const {originalname,path} = req.file;
  const parts = originalname.split('.');
  const ext = parts[parts.length - 1];
  const newPath = path+'.'+ext;
  fs.renameSync(path, newPath);
  // console.log(req.body.position);
  const position =  req.body.position === "true" ? 1 : 0;
  
  const values = [
    req.body.description,
    req.body.respiration,
    position,
    req.body.perfusion,
    req.body.mental,
    req.body.color,
    req.body.info,
    newPath
  ]

  db.query(sql, values, (err, data) => {
    if(err){
      return res.status(400).json({message:err.message});
    }
    return res.json(data);
})
  });

  app.get('/getcase', async(req,res)=>{
    const sql = "SELECT * FROM cases";
    db.query(sql, (err, data) => {
      if(err){
          return res.status(400).json({message:err.message});
      }
      else if(data){
        return res.status(200).json({message:"success",data});
      }
      else
      return res.json("fail")

  })
  })

  app.post('/getcaseone', async(req,res)=>{
    const sql = "SELECT * FROM cases WHERE `id` = ? ";
    db.query(sql,req.body.id, (err, data) => {
      if(err){
          return res.status(400).json({message:err.message});
      }
      else if(data){
        return res.status(200).json({message:"success",data});
      }
      else
      return res.json("fail")

  })
  })
  app.post('/deletecase', async (req, res) => {
    const caseId = req.body.id;
  
    const deleteQuestionnaireSql = "DELETE FROM questionnaire WHERE `id` = ?";
    const deleteCaseSql = "DELETE FROM cases WHERE `id` = ?";
  
    db.query(deleteQuestionnaireSql, [caseId], (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      } else {
        db.query(deleteCaseSql, [caseId], (err) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          } else {
            return res.status(200).json({ message: "Deleted successfully" });
          }
        });
      }
    });
  });
  
  app.post('/submitcase', (req, res) => {
    const { name, cases } = req.body;
    cases.forEach((id)=>{
      const query = 'INSERT INTO questionnaire (quesName, id) VALUES (?, ?)';
      db.query(query, [name, id], (err, results) => {
        if (err){
          throw err;
        };
      });
    })
    res.status(200).json({ message: 'Data submitted successfully' });
  
 });

 app.get('/getQues',(req,res)=>{
  const sql = "SELECT * FROM questionnaire ";
  db.query(sql, (err, data) => {
    if(err){
        return res.status(400).json({message:err.message});
    }
    else if(data){
      return res.status(200).json({message:"success",data});
    }
    else
    return res.json("fail")

})
 })

 app.post('/deleteQues', async(req,res)=>{
  const sql = "DELETE FROM questionnaire WHERE `quesName` = ? ";
  db.query(sql,req.body.quesName, (err) => {
    if(err){
        return res.status(400).json({message:err.message});
    }
    else { 
      return res.status(200).json({message:"Deleted successfuly"});
    }
    

})
})

app.get('/getQuesById/:name',(req,res)=>{
  const {name} = req.params;
  const sql = "SELECT * FROM (SELECT quesName, description_ FROM questionnaire JOIN cases ON questionnaire.id = cases.id) AS Quesshow WHERE `quesName` = ? " ;
  
  db.query(sql,name, (err, data) => {
  
    if(err){
        return res.status(400).json({message:err.message});
    }
    else if(data){
      return res.status(200).json({message:"success",data});
    }
    else
    return res.json("fail")

})
 })

 app.get('/getusers', async(req,res)=>{
  const sql = "SELECT * FROM login WHERE admin_ IS NULL";

  db.query(sql, (err, data) => {
    if(err){
        return res.status(400).json({message:err.message});
    }
    else if(data){
      return res.status(200).json({message:"success",data});
    }
    else
    return res.json("fail")

})
})

app.get('/getQues', async(req,res)=>{
  const sql = "SELECT * FROM questionnaire";
  db.query(sql, (err, data) => {
    if(err){
        return res.status(400).json({message:err.message});
    }
    else if(data){
      return res.status(200).json({message:"success",data});
    }
    else
    return res.json("fail")

})
})


app.post('/submitexercise', (req, res) => {
  const { exerciseName, quesName, userId } = req.body;
  userId.forEach((id)=>{
    const query = 'INSERT INTO exercise (exerciseName, quesName, userId) VALUES (?,?, ?)';
    db.query(query, [exerciseName, quesName, id], (err, results) => {
      if (err){
        throw err;
      };
    });
  })
  res.status(200).json({ message: 'Data submitted successfully' });

});

app.post('/submit-Exercise-two', (req, res) => {
  const { exerciseName, quesName, userId } = req.body;

  // Check if userId is an array and not empty
  if (!Array.isArray(userId) || userId.length === 0) {
    return res.status(400).json({ message: 'No users selected' });
  }

  // Iterate over userId and insert into the database
  userId.forEach((id) => {
    const query = 'INSERT INTO showexercise (exerciseName, quesName, userId) VALUES (?, ?, ?)';
    db.query(query, [exerciseName, quesName, id], (err, results) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ message: 'Error saving data to database' });
      }
    });
  });

  res.status(200).json({ message: 'Data submitted successfully' });
});


app.post('/checkExercise', async(req,res)=>{
  const sql = "SELECT * FROM exercise WHERE `userId` = ? ";
  db.query(sql,req.body.id, (err,data) => {
    if(err){
        return res.status(400).json({message:err.message});
    }
    else { 
      if(data.length>0){
        return res.status(200).json({message:"successfull",info:data});
      }
      
      return res.status(200).json({message:"unsuccessfull"});
    }

  })
})

app.get('/getExercise', async(req,res)=>{
  const sql = "SELECT * FROM showexercise";
  db.query(sql, (err, data) => {
    if(err){
        return res.status(400).json({message:err.message});
    }
    else if(data){
      return res.status(200).json({message:"success",data});
    }
    else
    return res.json("fail")

})
})

app.post('/deleteExercise', async(req,res)=>{
  const sql = "DELETE FROM exercise WHERE `exerciseName` = ? ";
  db.query(sql,req.body.exerciseName, (err) => {
    if(err){
        return res.status(400).json({message:err.message});
    }
    else { 
      return res.status(200).json({message:"Deleted successfuly"});
    }
    

})
})

app.get('/getExerciseById/:name',(req,res)=>{
  const {name} = req.params;
  const sql = "select * from (Select exerciseName, quesName, username, email,userId from showexercise join login on showexercise.userId=login.id)as temp WHERE `exerciseName` = ?";
  
  db.query(sql,name, (err, data) => {
  
    if(err){
        return res.status(400).json({message:err.message});
    }
    else if(data){
      return res.status(200).json({message:"success",data});
    }
    else
    return res.json("fail")

})
 })


//  Join Test api
app.get('/api/exercise-cases', (req, res) => {
  const { userId } = req.query;

  // Query to fetch cases based on the user's exercise and questionnaire
  const query = `
    SELECT c.id, c.description_, c.respiration, c.position_, 
           c.perfusion, c.mental_status, c.color, c.extra_info, c.image
    FROM cases c
    JOIN questionnaire q ON c.id = q.id
    JOIN exercise e ON q.quesName = e.quesName
    WHERE e.userId = ?;
  `;

  // Execute the query
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching cases:', err);
      return res.status(500).json({ error: 'An error occurred while fetching cases.' });
    }

    res.json(results);
  });
});

// Test case show api
app.post('/api/exercise-each-case', (req, res) => {
  const { id } = req.body;  // Receive the case id from the request body

  // Query to fetch the specific case by its id
  const query = `
    SELECT c.id, c.description_, c.respiration, c.position_, 
           c.perfusion, c.mental_status, c.color, c.extra_info, c.image
    FROM cases c
    WHERE c.id = ?
  `;

  // Execute the query
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching case:', err);
      return res.status(500).json({ error: 'An error occurred while fetching the case.' });
    }

    res.json(results);
  });
});


app.post('/changePassword', async(req,res)=>{
  const { confirmPassword,id } = req.body;
  const sql = "UPDATE login SET `passwords` = ? WHERE `id`= ?";
  db.query(sql,[confirmPassword,id], (err) => {
    if(err){
        return res.status(400).json({message:err.message});
    }
    else { 
      return res.status(200).json({message:"Updated successfuly"});
    }
    

})
})

app.post("/loginById", (req, res) => {
 
  const sql = "SELECT * FROM login WHERE `id` =?";

  db.query(sql, req.body.id, (err, data) => {
      if(err){
          return res.status(400).json({message:err.message});
      }
      else if(data.length > 0){
        return res.status(200).json({message:"success",data});
      }
      else
      return res.json("fail")

  })
});

app.post('/api/save-user-color', async (req, res) => {
  const { userId, quesName, exerciseName, selectedColor,correctans } = req.body;

  try {
    const query = 'INSERT INTO user_selected_colors (userId, quesName, exerciseName, selectedColor,correctans) VALUES (?, ?, ?, ?,?)';
    const values = [userId, quesName, exerciseName, selectedColor,correctans];

   
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Server Error');
      } else {
        res.status(200).send('Data inserted successfully');
      }
    });

   
    
  } catch (error) {
    console.error('Error in API:', error);
    res.status(500).send('Server Error');
  }
});

app.post('/api/delete-exercise', async (req, res) => {
  const {userId} = req.body;

  try {
    
const deleteQuery = 'DELETE FROM exercise WHERE `userId` = ?' 

db.query(deleteQuery, [userId], (err) => {
  if (err) {
    console.error('Error deleting data:', err);
   
  } else {
    console.log('Data Deleted successfully');
  }
});
   
    
  } catch (error) {
    console.error('Error in API:', error);
    res.status(500).send('Server Error');
  }
});


app.get('/getSelectedColors/:id', async(req,res)=>{

  const {id} = req.params;
  const sql = "select * from user_selected_colors WHERE `userId`= ? ";

  db.query(sql,[id], (err, data) => {
    if(err){
        return res.status(400).json({message:err.message});
    }
    else if(data){
      return res.status(200).json({message:"success",data});
    }
    else
    return res.json("fail")

})
})

app.get('/get-correct-answer-percentage/:exerciseName', async (req, res) => {
  const { exerciseName } = req.params;
  console.log("this is testing: ",exerciseName);
  const sql = `
    SELECT 
      quesName,
      COUNT(CASE WHEN correctans = 1 THEN 1 END) AS correctCount,
      COUNT(*) AS totalCount,
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE (COUNT(CASE WHEN correctans = 1 THEN 1 END) / COUNT(*)) * 100 
      END AS correctPercentage
    FROM user_selected_colors
    WHERE exerciseName = ?
    GROUP BY quesName
  `;

  db.query(sql, exerciseName, (err, data) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    } else {
      return res.status(200).json({ message: "success", data });
    }
  });
});



app.listen(8081, () => {
  console.log("listening ...");
});

module.exports=app;