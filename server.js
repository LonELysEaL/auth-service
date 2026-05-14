const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "MY_SECRET_KEY";

const users = [
  {
    id: 1,
    username: "admin",
    password: "1234",
    max_sessions: 2
  }
];

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "wrong login" });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      max_sessions: user.max_sessions
    },
    SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

app.get("/verify", (req, res) => {
  const token = req.headers.authorization;

  if (!token) return res.json({ valid: false });

  try {
    const decoded = jwt.verify(token, SECRET);

    res.json({
      valid: true,
      user: decoded
    });
  } catch {
    res.json({ valid: false });
  }
});

app.get("/", (req, res) => {
  res.send("Auth Service Running");
});

app.get("/test-login", (req, res) => {
  res.send(`
    <h2>Test Login</h2>

    <button onclick="login()">
      LOGIN
    </button>

    <pre id="result"></pre>

    <script>
      async function login() {

        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'admin',
            password: '1234'
          })
        });

        const data = await response.json();

        document.getElementById('result').innerText =
          JSON.stringify(data, null, 2);
      }
    </script>
  `);
});

app.get("/test-verify", (req, res) => {
  res.send(`
    <h2>Verify Token</h2>

    <textarea id="token" rows="10" cols="80"></textarea>
    <br><br>

    <button onclick="verify()">
      VERIFY
    </button>

    <pre id="result"></pre>

    <script>
      async function verify() {

        const token =
          document.getElementById('token').value;

        const response = await fetch('/verify', {
          headers: {
            authorization: token
          }
        });

        const data = await response.json();

        document.getElementById('result').innerText =
          JSON.stringify(data, null, 2);
      }
    </script>
  `);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Auth service running");
});
