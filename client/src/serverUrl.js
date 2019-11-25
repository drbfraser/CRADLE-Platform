console.log("process.env.NODE_ENV", process.env.NODE_ENV);

let BASE_URL;

if(process.env.NODE_ENV === "production") {
    BASE_URL = "http://cmpt373.csil.sfu.ca:8088/api"
} else {
    BASE_URL = "http://localhost:5000/api"
}

export default BASE_URL