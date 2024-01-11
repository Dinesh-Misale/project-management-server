const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const port = 3002;
const db = require("./DB/database");
const {
  generateAccessToken,
  generateRefreshToken,
  validateToken,
} = require("./tokens");
const uuid = require("uuid");
// require("dotenv").config(); // Load variables from .env into process.env

app.use(
  cors({
    origin: "*",
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, () => {
  console.log(`server is up and running on port ${port}`);
});

const authenticate = (req, res, next) => {
  try {
    if (req.headers?.authorization) {
      let arr = req.headers?.authorization.split(" ");
      let token = arr[1];
      const isValid = validateToken(token);
      console.log("validate", isValid.valid, token, req.headers?.authorization);
      if (isValid?.valid) {
        next();
      } else {
        res.status(401).send("invalid token");
      }
    }
  } catch (err) {
    res.send(err);
  }
};

app.post("/register", (req, res) => {
  const body = req?.body?.data;
  const randomUUID = uuid.v4();
  const empIdd = uuid.v4();
  if (body.orgName && body.orgEmail) {
    db.org_list.push({
      org_name: body.orgName,
      org_id: randomUUID,
    });
    db.employees.push({
      email: body.orgEmail,
      password: body.password,
      org_id: randomUUID,
      accountType: "admin",
      emp_id: empIdd,
    });
    const accessToken = generateAccessToken({
      email: body.orgEmail,
      orgId: randomUUID,
    });
    const refreshToken = generateRefreshToken({
      email: body.orgEmail,
      orgId: randomUUID,
    });
    const obj = {
      accessContext: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
    };
    // setTimeout(() => {
    res.send(obj);
    // }, 4000);
  } else {
    res.send({ data: "error" });
  }
});

app.post("/login", (req, res) => {
  const body = req.body.data;
  let requestDone = false;
  try {
    const emp = db.employees.filter((e) => {
      if (e.email === body.email) {
        return e;
      }
    });

    emp.map((element) => {
      if (
        element?.email === body?.email &&
        element?.password === body?.password &&
        element?.org_id === body?.organization_id
      ) {
        requestDone = true;
        const accessToken = generateAccessToken({
          email: element?.email,
          orgId: element?.emp_id,
        });
        const refreshToken = generateRefreshToken({
          email: element?.email,
          orgId: element?.emp_id,
        });
        res.send({
          accessToken,
          refreshToken,
          access_token_expires_in: 900000,
          user: element,
        });
      }
    });
    if (!requestDone) {
      // res.send("wrong credentials");
      res.status(403).send({ message: "invalid credentials" });
    }
  } catch (err) {
    // res.send({ status: 401, error_message: "User is not registered" });
    res.status(401).send({ message: err?.message });
  }
});

app.get("/orgList", (req, res) => {
  const list = db.org_list.map((e) => {
    // console.log(e);
    return { label: e.org_name, id: e.org_id };
  });
  // console.log("called");
  // res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.send({ orgList: list });
});

app.post("/get_new_tokens", (req, res) => {
  const { refreshToken, userData } = req.body.body;
  try {
    if (refreshToken) {
      const isValidToken = validateToken(refreshToken);
      console.log("is valid", isValidToken);
      if (isValidToken?.valid) {
        const accessToken = generateAccessToken({
          email: userData?.email,
          orgId: userData?.org_id,
        });
        const refreshToken = generateRefreshToken({
          email: userData?.email,
          orgId: userData?.org_id,
        });
        res.send({
          accessToken,
          refreshToken,
          access_token_expires_in: 900000,
        });
      } else {
        res.status(403).send({ message: refreshToken?.reason });
      }
    }
  } catch (err) {
    res.send(err);
  }
});

app.get("/tasks", authenticate, (req, res) => {
  try {
    const empId = req.query?.id;
    const orgId = req.query?.orgId;
    console.log(empId, orgId);
    const taskList = db.tasks?.filter((e) => {
      if (e.assignee === empId && e.org_id === orgId) {
        return e;
      }
    });
    res.status(200).send({ taskList: taskList });
  } catch (err) {
    res.send(err);
  }
});

app.get("/userInfo", authenticate, (req, res) => {
  const id = req.query?.uid;
  if (id) {
    try {
      db.employees?.forEach((emp) => {
        if (emp?.emp_id === id) {
          const obj = { ...emp };
          delete obj.password;
          res.status(200).send(obj);
        }
      });
    } catch (err) {
      console.log("error while sending user data", err);
    }
  }
});

app.get("/nothing", (req, res) => {
  res.send({ data: "ok" });
});
