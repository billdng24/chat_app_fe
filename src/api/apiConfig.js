import axios from "axios";

const instance = axios.create({
  baseURL: "https://chat-app-be-a5ec4b2bfcd6.herokuapp.com/",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;