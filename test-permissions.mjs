const users = [
  { username: "Majozi", password: "1234" },
  { username: "Kgopotso", password: "1234" },
  { username: "Lesego1", password: "1234" }
];

for (const login of users) {
  console.log("\n================================");
  console.log("TESTING:", login.username);
  console.log("================================");

  const loginResponse = await fetch("http://localhost:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(login)
  });

  const loginData = await loginResponse.json();

  console.log("LOGIN STATUS:", loginResponse.status);

  if (!loginData.success) {
    console.log("LOGIN FAILED:", loginData.message);
    continue;
  }

  const token = loginData.token;

  const response = await fetch("http://localhost:5000/test-bookings", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  console.log("BOOKINGS STATUS:", response.status);
  console.log("BOOKINGS:", await response.text());
}
