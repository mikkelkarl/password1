const express = require("express")
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, setDoc, doc } = require('firebase/firestore');
const SHA256 = require("crypto-js/sha256");
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");

const app = express()
const saltRounds = 10;


let googlepassword = 'vgzppxlleuypjtfr'; 

app.set('view engine', 'ejs');

app.use(express.static('public'))

app.use(express.urlencoded({ extended: true }))

let userLoggedIn = false;
let newUser = false;

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCWsXbGqinPV_jz6MUcdgqtqxaS6fUmt8A",
    authDomain: "ejs1-e9723.firebaseapp.com",
    projectId: "ejs1-e9723",
    storageBucket: "ejs1-e9723.appspot.com",
    messagingSenderId: "818029570593",
    appId: "1:818029570593:web:3864753545e960e240d160",
    measurementId: "G-R8SXJPXXL7"
};

// Initialize Firebase
const fb = initializeApp(firebaseConfig);
const db = getFirestore(fb);


async function getBrukere(db, email, passord) {
    const Brukere = collection(db, 'Brukere');
    const BrukerSnapshot = await getDocs(Brukere);
    const BrukerList = BrukerSnapshot.docs.map(doc => doc.data());
    console.log(BrukerList)
    console.log('ep', email, passord)



    BrukerList.forEach(element => {
        bcrypt.compare(passord, element.passord, function (err, result) {
            // result == true
            console.log("result", result)
            if (result == true) {
                if (element.email === email) {
                    console.log("Awesome")
                    userLoggedIn = true;
                    newUser = true;
                } else {
                    console.log('Depresso')
                    // console.log(element.passord)
                    // console.log(hashedPassword)
                }
            }
        });

    });
    let hashedPassword = SHA256(passord).toString()


    return BrukerList;
}

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/passord', (req, res) => {
    res.render('passord');
});

app.get('/nybruker', (req, res) => {
    res.render('nybruker');
});

app.post("/nyBruker", async (req, res) => {
    console.log(req.body)
    let email = req.body.epost
    let passord = req.body.passord
    let gjentapassord = req.body.gjentapassord;
    bcrypt.hash(passord, saltRounds, function (err, hash) {
        console.log(hash)
        saveUser(db, email, hash)
        // Store hash in your password DB.
    });

    res.send('vellykket')

})


app.get('/index', (req, res) => {
    res.render('login');
});

app.post("/logIn", async (req, res) => {
    console.log(req.body)
    let email = req.body.epost
    let passord = req.body.passord

    await getBrukere(db, email, passord).then(() => {
        if (userLoggedIn === true) {
            res.redirect("welcome")
        } else {
            res.send("I found you")
        }
    })
})

app.get('/email', (req, res) => {
    res.render('passord');
});

app.post("/eMail", (req, res) => {
    console.log(req.body)
    sendEmail(req.body.epost);
    res.send("I found you")
})

app.get("/welcome", (req, res) => {
    res.render('welcome');
});


async function saveUser(db, email, passord) {
    let hashedEmail = SHA256(email).toString()
    const document = doc(db, "Brukere", hashedEmail)
    const data = {
        email: email,
        passord: passord,
    };

    await setDoc(document, data)
        .then((result) => {
            console.log("bruker logget");
        })
        .catch((e) => {
            console.log(e);
        });
}


async function sendEmail(email) {
    let transporter = nodemailer.createTransport({
        service:"gmail",
        secure: true, // true for 465, false for other ports
        auth: {
          user: "mikkelkkarlsson@gmail.com", // generated ethereal user
          pass: googlepassword, // generated ethereal password
        },
      });
      
    let info = transporter.sendMail({
    from: '"Mikkel" <mikkelkkarlsson@gmail.com>', // sender address
    to: "mikkelkkarlsson@gmail.com", // list of receivers
    subject: "Nytrt passdord", // Subject line
    text: "Reset epost", // plain text body
    html: `Her kan du lage nytt passord: http://localhost/passord?email=${email}`, // html body
  });
}



app.listen(80) 
