const allowedOrigins = require('./allowedOrigins')

// const corsOptions = {
//     origin: (origin, callback) => {
//         if (allowedOrigins.toString().indexOf(origin) !== -1 || !origin) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     },
//     credentials: true,
//     optionsSuccessStatus: 200
// }

const corsOptions={
    origin:'http://localhost:3000',credentials:true,optionsSuccessStatus:200
}

module.exports = corsOptions 