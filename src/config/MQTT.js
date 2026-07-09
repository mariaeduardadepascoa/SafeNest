const mqtt = require("mqtt");
require('dotenv').config();

const serverMQTT = mqtt.connect({
    host: process.env.Broker_Host,
    username: process.env.Broker_Username,
    password: process.env.Broker_Password,
    port: Number(process.env.Broker_Port),
    protocol: "mqtts"
})

module.exports = serverMQTT;