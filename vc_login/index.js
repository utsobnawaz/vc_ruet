const firebaseConfig = {
    apiKey: "AIzaSyCwGhG2vUd9JjMn0mTnqulPmmTDfh31bEw",
    authDomain: "vcruet-86ec5.firebaseapp.com",
    projectId: "vcruet-86ec5",
    storageBucket: "vcruet-86ec5.firebasestorage.app",
    messagingSenderId: "259743308901",
    appId: "1:259743308901:web:d881ac9ef3798df536fa8c"
};

// 🔹 Initialize Firebase
firebase.initializeApp(firebaseConfig);

// 🔹 Login Function (Redirects on Success)
function login() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            
            // 🔹 Redirect to another page
            window.location.href = "vc.html"; // Change this to your desired webpage
        })
        .catch((error) => {
            alert("Login Failed: " + error.message);
        });
}
function register() {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            alert("Registration Successful!");
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
}