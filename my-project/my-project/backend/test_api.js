const axios = require('axios');

async function test() {
  const url = 'http://10.41.105.49:5000/api/send-sms';
  const payload = {
    from: "ONLINE COMPLAINT MANAGEMENT SYSTEM",
    toList: ["9874382619"],
    message: "Test to port 5000"
  };

  try {
    const res = await axios.post(url, payload, { timeout: 5000 });
    console.log("Success:", res.data);
  } catch (err) {
    if (err.response) {
      console.log("Error Status:", err.response.status);
      console.log("Error Data:", JSON.stringify(err.response.data));
    } else {
      console.log("Network Error:", err.message);
    }
  }
}

test();
