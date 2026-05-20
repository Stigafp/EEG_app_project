// import twilio from 'twilio';

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// export type SendEmergencySmsInput = {
//     to: string;
//     message: string;
// };

// export async function sendEmergencySms({ to, message}: SendEmergencySmsInput) {
//     if(!accountSid || !authToken || !fromPhoneNumber){
//         throw new Error(
//             "Twilio mangler nøgler: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, eller TWILIO_PHONE_NUMBER"
//         );
//     }

//     const client = twilio(accountSid, authToken);

//     return client.messages.create({
//         body: message,
//         from: fromPhoneNumber,
//         to: to,
//     });
// }