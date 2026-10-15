const response = await fetch("http://localhost:5000/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    username: "Majozi",
    password: "1234"
  })
});

console.log("STATUS:", response.status);
console.log("RESPONSE:", await response.text());
